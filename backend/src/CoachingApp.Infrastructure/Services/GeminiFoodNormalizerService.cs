using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CoachingApp.Infrastructure.Services;

/// <summary>
/// Calls Google Gemini (text-only) to normalize a free-form food name
/// (e.g. "poulet grillé") into a canonical English/French label that we
/// fuzzy-match against the local NutritionFood (CIQUAL) table.
///
/// Mirrors the public surface of OpenAiService.NormalizeFoodAsync so
/// NutritionCalculatorService can swap providers without other changes.
/// </summary>
public class GeminiFoodNormalizerService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<GeminiFoodNormalizerService> _logger;
    private readonly string _apiKey;
    private readonly string _model;

    public GeminiFoodNormalizerService(IHttpClientFactory factory, IConfiguration config, ILogger<GeminiFoodNormalizerService> logger)
    {
        _httpClient = factory.CreateClient();
        _logger = logger;
        _apiKey = config["GeminiApi:ApiKey"] ?? throw new InvalidOperationException("GeminiApi:ApiKey not configured");
        // Dedicated model for food normalization — cheap & fast (free-tier friendly).
        _model = config["GeminiApi:FoodModel"] ?? "gemini-2.5-flash";
    }

    public record FoodNormalizationResult(
        string CanonicalEn, string CanonicalFr, double Confidence,
        decimal? KcalPer100g, decimal? ProteinPer100g, decimal? CarbsPer100g, decimal? FatPer100g);

    public async Task<FoodNormalizationResult?> NormalizeFoodAsync(string rawName, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(rawName)) return null;

        var prompt = BuildPrompt(rawName);

        var requestBody = new
        {
            contents = new[]
            {
                new { parts = new object[] { new { text = prompt } } }
            },
            generationConfig = new
            {
                temperature = 0.1,
                maxOutputTokens = 512,
                thinkingConfig = new { thinkingBudget = 0 }
            }
        };

        try
        {
            var json = JsonSerializer.Serialize(requestBody);
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent?key={_apiKey}";
            int[] retryDelaysMs = [5_000, 15_000, 30_000];

            for (int attempt = 0; attempt <= retryDelaysMs.Length; attempt++)
            {
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync(url, content, ct);

                if (response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                {
                    if (attempt == retryDelaysMs.Length)
                    {
                        _logger.LogWarning("Gemini food normalizer: rate limit exceeded after {Max} retries for '{Raw}'",
                            retryDelaysMs.Length, rawName);
                        return null;
                    }
                    var delay = retryDelaysMs[attempt];
                    _logger.LogWarning("Gemini food normalizer: 429 for '{Raw}', retrying in {Delay}ms (attempt {A}/{M})",
                        rawName, delay, attempt + 1, retryDelaysMs.Length);
                    await Task.Delay(delay, ct);
                    continue;
                }

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync(ct);
                    _logger.LogWarning("Gemini food normalizer returned {Status} for '{Raw}': {Error}",
                        response.StatusCode, rawName, error);
                    return null;
                }

                var responseJson = await response.Content.ReadAsStringAsync(ct);
                return ParseResponse(responseJson, rawName);
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Gemini food normalizer call failed for '{Raw}'", rawName);
            return null;
        }
    }

    private static string BuildPrompt(string rawName) => $@"Tu reçois un nom d'aliment en français ou anglais (possiblement avec fautes ou qualifiers comme ""grillé"", ""cuit""). Réponds UNIQUEMENT par un JSON valide, sans markdown, sans texte autour :
{{
  ""canonical_en"": ""nom canonique anglais court (ex: chicken breast cooked)"",
  ""canonical_fr"": ""nom canonique français court (ex: blanc de poulet cuit)"",
  ""confidence"": 0.0,
  ""kcal_per_100g"": null,
  ""protein_per_100g"": null,
  ""carbs_per_100g"": null,
  ""fat_per_100g"": null
}}
- confidence est un nombre entre 0 et 1 : ta certitude que l'entrée est un aliment réel et comestible.
- Si l'entrée n'est pas un aliment reconnaissable, mets confidence à 0 et les 4 valeurs nutritionnelles à null.
- Sinon, estime les valeurs nutritionnelles moyennes pour 100g (nombres décimaux).

Aliment : {rawName}";

    private FoodNormalizationResult? ParseResponse(string responseJson, string rawName)
    {
        try
        {
            using var doc = JsonDocument.Parse(responseJson);
            var text = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString() ?? "";

            // Gemini sometimes wraps the JSON in ```json … ```
            var jsonStart = text.IndexOf('{');
            var jsonEnd = text.LastIndexOf('}');
            if (jsonStart < 0 || jsonEnd < 0 || jsonEnd <= jsonStart)
            {
                _logger.LogWarning("Gemini food normalizer: no JSON block in response for '{Raw}'. Raw text: {Text}",
                    rawName, text[..Math.Min(300, text.Length)]);
                return null;
            }

            var jsonText = text[jsonStart..(jsonEnd + 1)];
            using var inner = JsonDocument.Parse(jsonText);
            var root = inner.RootElement;

            var en = root.TryGetProperty("canonical_en", out var pe) ? pe.GetString() ?? "" : "";
            var fr = root.TryGetProperty("canonical_fr", out var pf) ? pf.GetString() ?? "" : "";
            double confidence = 0;
            if (root.TryGetProperty("confidence", out var pc))
            {
                if (pc.ValueKind == JsonValueKind.Number) confidence = pc.GetDouble();
                else if (pc.ValueKind == JsonValueKind.String && double.TryParse(pc.GetString(), out var parsed)) confidence = parsed;
            }

            decimal? ParseNullableDecimal(string propName)
            {
                if (!root.TryGetProperty(propName, out var el)) return null;
                if (el.ValueKind == JsonValueKind.Number) return el.GetDecimal();
                if (el.ValueKind == JsonValueKind.String && decimal.TryParse(el.GetString(), out var v)) return v;
                return null;
            }

            return new FoodNormalizationResult(
                en, fr, confidence,
                ParseNullableDecimal("kcal_per_100g"),
                ParseNullableDecimal("protein_per_100g"),
                ParseNullableDecimal("carbs_per_100g"),
                ParseNullableDecimal("fat_per_100g"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Gemini food normalizer: failed to parse response for '{Raw}'. Raw: {Response}",
                rawName, responseJson[..Math.Min(500, responseJson.Length)]);
            return null;
        }
    }
}
