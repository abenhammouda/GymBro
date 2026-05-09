using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace CoachingApp.Infrastructure.Services;

/// <summary>
/// Service to analyze exercise video frames using Google Gemini Vision API.
/// Used when title-based detection is inconclusive.
/// </summary>
public class GeminiVisionService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<GeminiVisionService> _logger;
    private readonly string _apiKey;
    private readonly string _model;

    public GeminiVisionService(IHttpClientFactory httpClientFactory, IConfiguration config, ILogger<GeminiVisionService> logger)
    {
        _httpClient = httpClientFactory.CreateClient();
        _logger = logger;
        _apiKey = config["GeminiApi:ApiKey"] ?? throw new InvalidOperationException("GeminiApi:ApiKey not configured");
        _model = config["GeminiApi:Model"] ?? "gemini-2.5-flash";
    }

    public record DetectionResult(string ExerciseName, string Category, float Confidence);

    /// <summary>
    /// Analyzes video frames (optional) + title hint using Gemini and returns detected exercise info.
    /// Can be called with an empty framePaths list to do title-only detection.
    /// </summary>
    public async Task<DetectionResult?> AnalyzeExerciseFramesAsync(List<string> framePaths, string? titleHint = null)
    {
        // Allow title-only calls (no frames required when a title hint is provided)
        if (framePaths.Count == 0 && string.IsNullOrWhiteSpace(titleHint)) return null;

        try
        {
            var hasFrames = framePaths.Count > 0;
            var prompt = BuildPrompt(titleHint, hasFrames);
            var parts = new List<object>();

            // Add text prompt
            parts.Add(new { text = prompt });

            // Add each frame as inline image data
            foreach (var path in framePaths.Take(3))
            {
                if (!File.Exists(path)) continue;
                var imageBytes = await File.ReadAllBytesAsync(path);
                var base64 = Convert.ToBase64String(imageBytes);
                parts.Add(new
                {
                    inline_data = new
                    {
                        mime_type = "image/jpeg",
                        data = base64
                    }
                });
            }

            var requestBody = new
            {
                contents = new[]
                {
                    new { parts }
                },
                generationConfig = new
                {
                    temperature = 0.1,
                    maxOutputTokens = 512,
                    // Disable thinking: consumes the entire token budget (188/200 tokens
                    // observed), leaving almost nothing for the actual response.
                    thinkingConfig = new { thinkingBudget = 0 }
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent?key={_apiKey}";
            var response = await _httpClient.PostAsync(url, content);

            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                _logger.LogError("Gemini API error {Status}: {Error}", response.StatusCode, error);
                return null;
            }

            var responseJson = await response.Content.ReadAsStringAsync();
            return ParseGeminiResponse(responseJson);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Gemini Vision analysis failed");
            return null;
        }
        finally
        {
            // Cleanup temp frame files
            foreach (var path in framePaths)
            {
                try { File.Delete(path); } catch { }
            }
        }
    }

    private static string BuildPrompt(string? titleHint, bool hasFrames)
    {
        string context;
        if (hasFrames && !string.IsNullOrWhiteSpace(titleHint))
            context = $"You are analyzing video frames of an exercise. The video title is: \"{titleHint}\".";
        else if (hasFrames)
            context = "You are analyzing video frames of an exercise.";
        else
            context = $"You are a fitness expert. Identify the exercise from this video title: \"{titleHint}\". The title may be in any language (Arabic, French, English, etc.).";

        return $@"{context}

Identify the exercise and classify it into one of these categories: Pectoraux, Dos, Épaules, Bras, Jambes, Core, Cardio, Flexibility, Other

Respond ONLY with this exact JSON format (no markdown, no extra text):
{{
  ""exercise_name"": ""Exercise Name in English"",
  ""category"": ""Category Here"",
  ""confidence"": 0.9
}}

If you cannot identify the exercise: {{""exercise_name"": ""Exercice de fitness"", ""category"": ""Other"", ""confidence"": 0.1}}";
    }

    private DetectionResult? ParseGeminiResponse(string responseJson)
    {
        try
        {
            var doc = JsonDocument.Parse(responseJson);
            var text = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString() ?? "";

            // Extract JSON from response (Gemini sometimes adds markdown)
            var jsonStart = text.IndexOf('{');
            var jsonEnd = text.LastIndexOf('}');
            if (jsonStart < 0 || jsonEnd < 0) return null;

            var jsonText = text[jsonStart..(jsonEnd + 1)];
            var result = JsonDocument.Parse(jsonText);

            var exerciseName = result.RootElement.GetProperty("exercise_name").GetString() ?? "Exercice";
            var category = result.RootElement.GetProperty("category").GetString() ?? "Other";
            var confidence = result.RootElement.TryGetProperty("confidence", out var conf)
                ? (float)conf.GetDouble()
                : 0.5f;

            // Validate category
            var validCategories = new[] { "Pectoraux", "Dos", "Épaules", "Bras", "Jambes", "Core", "Cardio", "Flexibility", "Other" };
            if (!validCategories.Contains(category)) category = "Other";

            return new DetectionResult(exerciseName, category, confidence);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to parse Gemini response: {Response}", responseJson[..Math.Min(500, responseJson.Length)]);
            return null;
        }
    }
}
