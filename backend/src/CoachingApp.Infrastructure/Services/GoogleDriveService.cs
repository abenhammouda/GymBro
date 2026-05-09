using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;

namespace CoachingApp.Infrastructure.Services;

/// <summary>
/// Downloads publicly-shared Google Drive video files to a local temp path.
/// Supports all common Drive share URL formats.
/// </summary>
public class GoogleDriveService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<GoogleDriveService> _logger;

    public GoogleDriveService(IHttpClientFactory httpClientFactory, ILogger<GoogleDriveService> logger)
    {
        _httpClient = httpClientFactory.CreateClient();
        _httpClient.Timeout = TimeSpan.FromMinutes(10);
        _httpClient.DefaultRequestHeaders.Add("User-Agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
        _logger = logger;
    }

    /// <summary>
    /// Extracts the Drive file ID from any supported Google Drive URL.
    /// </summary>
    public static string? ExtractFileId(string url)
    {
        // /file/d/{id}/view  or  /file/d/{id}
        var fileMatch = Regex.Match(url, @"/file/d/([a-zA-Z0-9_-]+)");
        if (fileMatch.Success) return fileMatch.Groups[1].Value;

        // ?id={id}  or  &id={id}
        var idMatch = Regex.Match(url, @"[?&]id=([a-zA-Z0-9_-]+)");
        if (idMatch.Success) return idMatch.Groups[1].Value;

        return null;
    }

    /// <summary>
    /// Downloads a Drive file to a temp path and returns (tempPath, originalFileName).
    /// Tries the modern usercontent endpoint first, falls back to the legacy /uc endpoint.
    /// Handles the large-file virus-scan confirmation page automatically.
    /// </summary>
    public async Task<(string TempPath, string FileName)> DownloadToTempAsync(string fileId)
    {
        _logger.LogInformation("Downloading Drive file {FileId}", fileId);

        // Modern endpoint (2024+): drive.usercontent.google.com
        var candidates = new[]
        {
            $"https://drive.usercontent.google.com/download?id={fileId}&export=download&authuser=0",
            $"https://drive.google.com/uc?export=download&id={fileId}&confirm=1",
        };

        foreach (var url in candidates)
        {
            _logger.LogInformation("Trying Drive download URL: {Url}", url);
            using var response = await _httpClient.GetAsync(url, HttpCompletionOption.ResponseHeadersRead);

            var contentType = response.Content.Headers.ContentType?.MediaType ?? "";

            // Non-HTML response → the file itself
            if (!contentType.Contains("text/html"))
            {
                response.EnsureSuccessStatusCode();
                return await SaveToTempAsync(response, fileId);
            }

            // HTML page → either a sign-in wall or a large-file virus-scan warning
            var html = await response.Content.ReadAsStringAsync();

            if (IsSignInPage(html))
            {
                // No point retrying other URLs for an auth-gated file
                throw new InvalidOperationException(
                    "Ce fichier Google Drive nécessite une connexion. " +
                    "Ouvrez le fichier dans Drive → cliquez sur l'icône de partage → " +
                    "choisissez \"Tous les utilisateurs avec le lien\" → Lecteur → Enregistrer.");
            }

            // Virus-scan confirmation page
            var confirmUrl = ExtractConfirmToken(html, fileId);
            if (confirmUrl != null)
            {
                _logger.LogInformation("Drive large-file confirm token found, retrying");
                using var confirmed = await _httpClient.GetAsync(confirmUrl, HttpCompletionOption.ResponseHeadersRead);
                confirmed.EnsureSuccessStatusCode();
                return await SaveToTempAsync(confirmed, fileId);
            }

            _logger.LogWarning("Drive URL {Url} returned unexpected HTML, trying next candidate", url);
        }

        throw new InvalidOperationException(
            "Impossible de télécharger le fichier Google Drive. " +
            "Vérifiez que le partage est réglé sur \"Tous les utilisateurs avec le lien\".");
    }

    // ──────────────────────────────────────────────────────────

    private async Task<(string TempPath, string FileName)> SaveToTempAsync(
        HttpResponseMessage response, string fileId)
    {
        var fileName = GetFileNameFromResponse(response) ?? $"drive_{fileId}.mp4";
        var ext = Path.GetExtension(fileName);
        if (string.IsNullOrEmpty(ext)) ext = ".mp4";

        var tempPath = Path.Combine(Path.GetTempPath(), $"drive_{Guid.NewGuid()}{ext}");

        await using var stream = await response.Content.ReadAsStreamAsync();
        await using var fs = new FileStream(tempPath, FileMode.Create, FileAccess.Write, FileShare.None,
            bufferSize: 81920, useAsync: true);
        await stream.CopyToAsync(fs);

        var fileSize = new FileInfo(tempPath).Length;
        _logger.LogInformation("Drive file saved to {Path} ({Size} bytes)", tempPath, fileSize);

        return (tempPath, fileName);
    }

    private static string? GetFileNameFromResponse(HttpResponseMessage response)
    {
        var cd = response.Content.Headers.ContentDisposition;
        if (cd == null) return null;
        return (cd.FileNameStar ?? cd.FileName)?.Trim('"');
    }

    /// <summary>
    /// Returns true if the HTML page is a Google sign-in / auth wall.
    /// </summary>
    private static bool IsSignInPage(string html) =>
        html.Contains("accounts.google.com/ServiceLogin") ||
        html.Contains("accounts.google.com/signin") ||
        html.Contains("Sign in") && html.Contains("Google Account") ||
        html.Contains("identifierNext") ||   // sign-in button id
        html.Contains("gaia_loginform");

    /// <summary>
    /// Extracts the full confirmed download URL from Drive's virus-scan warning HTML.
    /// </summary>
    private static string? ExtractConfirmToken(string html, string fileId)
    {
        // Modern Drive usercontent form action
        var actionMatch = Regex.Match(html, @"action=""(https://drive\.usercontent\.google\.com[^""]+)""");
        if (actionMatch.Success)
            return System.Web.HttpUtility.HtmlDecode(actionMatch.Groups[1].Value);

        // Legacy Drive: action="/uc?id=..."
        var ucMatch = Regex.Match(html, @"action=""(/uc[^""]+)""");
        if (ucMatch.Success)
        {
            var action = System.Web.HttpUtility.HtmlDecode(ucMatch.Groups[1].Value);
            return "https://drive.google.com" + action;
        }

        // confirm=t or confirm=<token>
        var confirmMatch = Regex.Match(html, @"confirm=([0-9A-Za-z_-]+)");
        if (confirmMatch.Success)
        {
            var token = confirmMatch.Groups[1].Value;
            return $"https://drive.usercontent.google.com/download?id={fileId}&export=download&confirm={token}&authuser=0";
        }

        return null;
    }
}
