using System.Diagnostics;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace CoachingApp.Infrastructure.Services;

/// <summary>
/// Service to extract metadata from YouTube URLs using yt-dlp CLI.
/// Supports single videos, Shorts, playlists, and channel sections.
/// </summary>
public class YouTubeMetadataService
{
    private readonly ILogger<YouTubeMetadataService> _logger;
    private static readonly string YtDlpPath = FindYtDlp();

    public YouTubeMetadataService(ILogger<YouTubeMetadataService> logger)
    {
        _logger = logger;
    }

    private static string FindYtDlp()
    {
        // Check common locations: scoop shims, PATH, local folder
        var candidates = new[]
        {
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "scoop", "shims", "yt-dlp.exe"),
            "yt-dlp.exe",
            "yt-dlp",
        };
        return candidates.FirstOrDefault(File.Exists) ?? "yt-dlp";
    }

    public record VideoMetadata(string Url, string Title, string? ThumbnailUrl, int? DurationSeconds, bool IsPlaylist);

    /// <summary>
    /// Gets metadata for a single video or Short.
    /// </summary>
    public async Task<VideoMetadata?> GetVideoMetadataAsync(string url)
    {
        try
        {
            var json = await RunYtDlpAsync($"--dump-json --no-playlist --quiet \"{url}\"");
            if (string.IsNullOrWhiteSpace(json)) return null;

            var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;

            var title = root.TryGetProperty("title", out var t) ? t.GetString() : null;
            var thumbnail = root.TryGetProperty("thumbnail", out var th) ? th.GetString() : null;
            var duration = root.TryGetProperty("duration", out var d) && d.ValueKind == JsonValueKind.Number
                ? (int?)d.GetInt32()
                : null;

            return new VideoMetadata(url, title ?? url, thumbnail, duration, false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "yt-dlp failed for URL {Url}", url);
            return null;
        }
    }

    /// <summary>
    /// Lists all video URLs from a channel, playlist, or section (flat, no download).
    /// </summary>
    public async Task<List<VideoMetadata>> GetPlaylistVideosAsync(string url, int maxVideos = 50)
    {
        var results = new List<VideoMetadata>();
        try
        {
            var json = await RunYtDlpAsync($"--flat-playlist --dump-json --quiet --playlist-end {maxVideos} \"{url}\"");
            if (string.IsNullOrWhiteSpace(json)) return results;

            // yt-dlp outputs one JSON object per line for playlists
            foreach (var line in json.Split('\n', StringSplitOptions.RemoveEmptyEntries))
            {
                try
                {
                    var doc = JsonDocument.Parse(line.Trim());
                    var root = doc.RootElement;

                    var videoId = root.TryGetProperty("id", out var id) ? id.GetString() : null;
                    var title = root.TryGetProperty("title", out var t) ? t.GetString() : null;
                    var thumbnail = root.TryGetProperty("thumbnail", out var th) ? th.GetString() : null;
                    var duration = root.TryGetProperty("duration", out var d) && d.ValueKind == JsonValueKind.Number
                        ? (int?)d.GetInt32()
                        : null;

                    if (videoId != null)
                    {
                        var videoUrl = $"https://www.youtube.com/watch?v={videoId}";
                        results.Add(new VideoMetadata(videoUrl, title ?? videoId, thumbnail, duration, false));
                    }
                }
                catch { /* skip malformed lines */ }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "yt-dlp playlist extraction failed for URL {Url}", url);
        }
        return results;
    }

    /// <summary>
    /// Downloads a few frames from a YouTube video for AI visual analysis.
    /// Returns paths to temporary frame image files.
    /// </summary>
    public async Task<List<string>> ExtractFramesFromYouTubeAsync(string url, int frameCount = 3)
    {
        var tempDir = Path.Combine(Path.GetTempPath(), "gymbro_frames_" + Guid.NewGuid().ToString("N")[..8]);
        Directory.CreateDirectory(tempDir);
        var framePaths = new List<string>();

        try
        {
            // Download just a short segment (first 30 seconds) and extract frames
            var videoPath = Path.Combine(tempDir, "clip.mp4");

            // Download low quality short clip
            await RunYtDlpAsync($"--format \"worst[ext=mp4]/worst\" --download-sections \"*0:00-0:30\" -o \"{videoPath}\" --quiet \"{url}\"");

            if (File.Exists(videoPath))
            {
                framePaths = await ExtractFramesFromFileAsync(videoPath, frameCount);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Frame extraction failed for URL {Url}", url);
        }

        return framePaths;
    }

    /// <summary>
    /// Extracts frames from a local video file using FFmpeg.
    /// </summary>
    public async Task<List<string>> ExtractFramesFromFileAsync(string videoPath, int frameCount = 3)
    {
        var tempDir = Path.Combine(Path.GetTempPath(), "gymbro_frames_" + Guid.NewGuid().ToString("N")[..8]);
        Directory.CreateDirectory(tempDir);
        var framePaths = new List<string>();

        try
        {
            // Use FFmpeg to extract `frameCount` evenly-spaced frames
            var outputPattern = Path.Combine(tempDir, "frame_%02d.jpg");
            var ffmpegPath = FindFfmpeg();
            var args = $"-v quiet -i \"{videoPath}\" -vf \"fps=1/{GetFrameInterval(videoPath)}\" -vframes {frameCount} -q:v 2 \"{outputPattern}\" -y";

            await RunProcessAsync(ffmpegPath, args);

            for (int i = 1; i <= frameCount; i++)
            {
                var framePath = Path.Combine(tempDir, $"frame_{i:D2}.jpg");
                if (File.Exists(framePath))
                    framePaths.Add(framePath);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "FFmpeg frame extraction failed for {Path}", videoPath);
        }

        return framePaths;
    }

    private static int GetFrameInterval(string videoPath)
    {
        // Spread 3 frames across the video: interval ≈ duration/4
        // Default to 10 seconds if we can't read duration
        return 10;
    }

    private static string FindFfmpeg()
    {
        var candidates = new[]
        {
            Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "scoop", "shims", "ffmpeg.exe"),
            "ffmpeg.exe",
            "ffmpeg",
        };
        return candidates.FirstOrDefault(File.Exists) ?? "ffmpeg";
    }

    private async Task<string> RunYtDlpAsync(string args)
    {
        return await RunProcessAsync(YtDlpPath, args);
    }

    private Task<string> RunProcessAsync(string executable, string args, int timeoutSeconds = 120)
    {
        // Run entirely on a dedicated thread-pool thread (Task.Run) to avoid
        // Process.WaitForExitAsync() bugs in .NET 9 that corrupt the host state.
        return Task.Run(() =>
        {
            var psi = new ProcessStartInfo
            {
                FileName = executable,
                Arguments = args,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            };

            using var process = new Process { StartInfo = psi };
            process.Start();

            // Read stdout and stderr concurrently to prevent pipe-buffer deadlock.
            var stdoutTask = process.StandardOutput.ReadToEndAsync();
            var stderrTask = process.StandardError.ReadToEndAsync();

            bool finished = process.WaitForExit(timeoutSeconds * 1000);
            if (!finished)
            {
                _logger.LogWarning("Process '{Executable}' timed out after {Timeout}s, killing it", executable, timeoutSeconds);
                try { process.Kill(); } catch { }
            }

            // Ensure both streams are fully drained before returning.
            Task.WhenAll(stdoutTask, stderrTask).GetAwaiter().GetResult();
            return stdoutTask.Result;
        });
    }
}
