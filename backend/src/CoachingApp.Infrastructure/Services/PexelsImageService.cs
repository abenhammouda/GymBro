using Microsoft.Extensions.Configuration;

namespace CoachingApp.Infrastructure.Services;

public class PexelsImageService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _uploadsPath;

    public PexelsImageService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient();
        _apiKey = configuration["ExternalApis:PexelsApiKey"] ?? throw new InvalidOperationException("Pexels API key not configured");
        
        var baseDirectory = Directory.GetCurrentDirectory();
        _uploadsPath = Path.Combine(baseDirectory, "uploads", "muscle-group-images");
        
        if (!Directory.Exists(_uploadsPath))
        {
            Directory.CreateDirectory(_uploadsPath);
        }
    }

    public async Task<List<PexelsPhoto>> SearchPhotosAsync(string query, int perPage = 3)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, 
            $"https://api.pexels.com/v1/search?query={Uri.EscapeDataString(query)}&per_page={perPage}&orientation=landscape");
        request.Headers.Add("Authorization", _apiKey);

        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var json = await response.Content.ReadAsStringAsync();
        var result = System.Text.Json.JsonSerializer.Deserialize<PexelsSearchResponse>(json);

        return result?.Photos ?? new List<PexelsPhoto>();
    }

    public async Task<string> DownloadImageAsync(string imageUrl, string category)
    {
        var fileName = $"{category}_{Guid.NewGuid()}.jpg";
        var filePath = Path.Combine(_uploadsPath, fileName);

        using var response = await _httpClient.GetAsync(imageUrl);
        response.EnsureSuccessStatusCode();

        await using var fileStream = new FileStream(filePath, FileMode.Create);
        await response.Content.CopyToAsync(fileStream);

        return $"/uploads/muscle-group-images/{fileName}";
    }
}

public class PexelsSearchResponse
{
    [System.Text.Json.Serialization.JsonPropertyName("photos")]
    public List<PexelsPhoto> Photos { get; set; } = new();
}

public class PexelsPhoto
{
    [System.Text.Json.Serialization.JsonPropertyName("id")]
    public int Id { get; set; }

    [System.Text.Json.Serialization.JsonPropertyName("photographer")]
    public string Photographer { get; set; } = string.Empty;

    [System.Text.Json.Serialization.JsonPropertyName("photographer_url")]
    public string PhotographerUrl { get; set; } = string.Empty;

    [System.Text.Json.Serialization.JsonPropertyName("src")]
    public PexelsPhotoSrc Src { get; set; } = new();
}

public class PexelsPhotoSrc
{
    [System.Text.Json.Serialization.JsonPropertyName("original")]
    public string Original { get; set; } = string.Empty;

    [System.Text.Json.Serialization.JsonPropertyName("large")]
    public string Large { get; set; } = string.Empty;

    [System.Text.Json.Serialization.JsonPropertyName("medium")]
    public string Medium { get; set; } = string.Empty;
}
