using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CoachingApp.Infrastructure.Services;

/// <summary>
/// Calls OpenAI Chat Completions to normalize a free-form food name
/// (e.g. "poulet grillé") into a canonical English/French label that we can
/// fuzzy-match against the local NutritionFood (CIQUAL) table.
/// </summary>
public class OpenAiService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<OpenAiService> _logger;
    private readonly string? _apiKey;
    private readonly string _model;
    private const string ChatEndpoint = "https://api.openai.com/v1/chat/completions";

    public OpenAiService(IHttpClientFactory factory, IConfiguration config, ILogger<OpenAiService> logger)
    {
        _httpClient = factory.CreateClient();
        _logger = logger;
        _apiKey = config["OpenAi:ApiKey"];
        _model = config["OpenAi:Model"] ?? "gpt-4o-mini";
    }

    public record FoodNormalizationResult(string CanonicalEn, string CanonicalFr, double Confidence);

    public async Task<FoodNormalizationResult?> NormalizeFoodAsync(string rawName, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(rawName)) return null;
        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            _logger.LogWarning("OpenAi:ApiKey not configured — skipping AI normalization for '{Raw}'", rawName);
            return null;
        }

        var systemPrompt = """
            You are a nutrition assistant. The user gives you a single food name in French or English
            (possibly with typos or qualifiers like "grillé"). Reply ONLY with a JSON object:
            { "canonical_en": "...", "canonical_fr": "...", "confidence": 0.0 }
            - canonical_en: short canonical English food name (e.g. "chicken breast cooked").
            - canonical_fr: short canonical French food name (e.g. "blanc de poulet cuit").
            - confidence: 0..1, how sure you are the input is a real edible food.
            If the input is not a recognizable food, return confidence: 0.
            """;

        var requestBody = new
        {
            model = _model,
            response_format = new { type = "json_object" },
            temperature = 0.1,
            messages = new object[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = rawName }
            }
        };

        try
        {
            using var req = new HttpRequestMessage(HttpMethod.Post, ChatEndpoint);
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
            req.Content = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");

            using var res = await _httpClient.SendAsync(req, ct);
            var body = await res.Content.ReadAsStringAsync(ct);

            if (!res.IsSuccessStatusCode)
            {
                _logger.LogWarning("OpenAI returned {Status} for '{Raw}': {Body}", res.StatusCode, rawName, body);
                return null;
            }

            using var doc = JsonDocument.Parse(body);
            var content = doc.RootElement
                .GetProperty("choices")[0]
                .GetProperty("message")
                .GetProperty("content")
                .GetString();

            if (string.IsNullOrWhiteSpace(content)) return null;

            using var inner = JsonDocument.Parse(content);
            var root = inner.RootElement;
            var en = root.TryGetProperty("canonical_en", out var pe) ? pe.GetString() ?? "" : "";
            var fr = root.TryGetProperty("canonical_fr", out var pf) ? pf.GetString() ?? "" : "";
            double confidence = 0;
            if (root.TryGetProperty("confidence", out var pc))
            {
                if (pc.ValueKind == JsonValueKind.Number) confidence = pc.GetDouble();
                else if (pc.ValueKind == JsonValueKind.String && double.TryParse(pc.GetString(), out var parsed)) confidence = parsed;
            }

            return new FoodNormalizationResult(en, fr, confidence);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "OpenAI normalize call failed for '{Raw}'", rawName);
            return null;
        }
    }
}
