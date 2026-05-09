using CoachingApp.Core.DTOs;
using CoachingApp.Core.Entities;
using CoachingApp.Core.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace CoachingApp.Infrastructure.Services;

/// <summary>
/// Main orchestrator service for AI-powered video exercise import.
/// Pipeline: Title Dictionary → (if needed) Gemini Vision AI → Create ExerciseTemplate
/// </summary>
public class VideoImportService
{
    private readonly IExerciseTemplateRepository _repository;
    private readonly ExerciseTemplateService _exerciseService;
    private readonly GeminiVisionService _geminiService;
    private readonly YouTubeMetadataService _youtubeService;
    private readonly GoogleDriveService _driveService;
    private readonly ILogger<VideoImportService> _logger;

    public VideoImportService(
        IExerciseTemplateRepository repository,
        ExerciseTemplateService exerciseService,
        GeminiVisionService geminiService,
        YouTubeMetadataService youtubeService,
        GoogleDriveService driveService,
        ILogger<VideoImportService> logger)
    {
        _repository = repository;
        _exerciseService = exerciseService;
        _geminiService = geminiService;
        _youtubeService = youtubeService;
        _driveService = driveService;
        _logger = logger;
    }

    /// <summary>
    /// Imports a single local video file: reads from temp path (stream already saved),
    /// runs AI detection, creates the template, moves the file to uploads.
    /// </summary>
    public async Task<VideoImportResult> ImportFromLocalFilePathAsync(
        string tempFilePath,
        string originalFileName,
        int coachId)
    {
        _logger.LogInformation("Importing local file: {File}", originalFileName);

        var title = Path.GetFileNameWithoutExtension(originalFileName)
            .Replace('-', ' ')
            .Replace('_', ' ');

        var ext = Path.GetExtension(originalFileName);

        // Step 1: try dictionary first (fast, no frames needed)
        var (dictCategory, dictName) = ExerciseDictionary.Detect(title);

        string detectedName;
        string detectedCategory;
        string detectionMethod;

        if (dictCategory != null)
        {
            detectedName = dictName ?? title;
            detectedCategory = dictCategory;
            detectionMethod = "dictionary";
            _logger.LogInformation("Dictionary match: {Name} → {Category}", detectedName, detectedCategory);
        }
        else
        {
            // Step 2: extract frames from the temp file and send to Gemini
            _logger.LogInformation("Title '{Title}' unclear, extracting frames for Gemini", title);
            var frames = await _youtubeService.ExtractFramesFromFileAsync(tempFilePath, 3);

            GeminiVisionService.DetectionResult? aiResult = null;
            if (frames.Count > 0)
                aiResult = await _geminiService.AnalyzeExerciseFramesAsync(frames, title);
            else
                aiResult = await _geminiService.AnalyzeExerciseFramesAsync(new List<string>(), title);

            if (aiResult != null)
            {
                detectedName = aiResult.ExerciseName;
                detectedCategory = aiResult.Category;
                detectionMethod = "gemini";
            }
            else
            {
                detectedName = title;
                detectedCategory = "Other";
                detectionMethod = "fallback";
            }
        }

        // Step 3: move temp file to uploads folder
        string videoUrl;
        try
        {
            var (url, _) = _exerciseService.SaveVideoFromTempPath(coachId, tempFilePath, ext);
            videoUrl = url;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to move temp file to uploads");
            return VideoImportResult.Failure(originalFileName, "Erreur lors de la sauvegarde du fichier vidéo");
        }

        // Step 4: create template with correct detected data
        try
        {
            var template = new ExerciseTemplate
            {
                CoachId = coachId,
                Name = detectedName,
                Category = detectedCategory,
                Category2 = GetCategory2(detectedCategory),
                VideoUrl = videoUrl,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            var created = await _repository.AddExerciseTemplateAsync(template);

            return VideoImportResult.Success(
                exerciseTemplateId: created.ExerciseTemplateId,
                name: detectedName,
                category: detectedCategory,
                videoUrl: videoUrl,
                thumbnailUrl: null,
                detectionMethod: detectionMethod
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create ExerciseTemplate for '{Name}'", detectedName);
            return VideoImportResult.Failure(originalFileName, "Erreur lors de la création dans la base de données");
        }
    }

    /// <summary>
    /// Imports a single video from a YouTube URL.
    /// </summary>
    public async Task<VideoImportResult> ImportFromYouTubeAsync(string url, int coachId)
    {
        _logger.LogInformation("Importing YouTube video: {Url}", url);

        // Step 1: Get video metadata
        var meta = await _youtubeService.GetVideoMetadataAsync(url);
        if (meta == null)
        {
            return VideoImportResult.Failure(url, "Impossible d'accéder à la vidéo YouTube");
        }

        return await AnalyzeAndCreateAsync(
            coachId: coachId,
            title: meta.Title,
            videoUrl: meta.Url,
            thumbnailUrl: meta.ThumbnailUrl,
            duration: meta.DurationSeconds,
            localFilePath: null,
            isYoutube: true
        );
    }

    /// <summary>
    /// Imports a single video from a Google Drive share URL.
    /// Downloads the file to temp storage, then runs through the same AI pipeline as local uploads.
    /// </summary>
    public async Task<VideoImportResult> ImportFromDriveAsync(string driveUrl, int coachId)
    {
        _logger.LogInformation("Importing Google Drive video: {Url}", driveUrl);

        var fileId = GoogleDriveService.ExtractFileId(driveUrl);
        if (string.IsNullOrEmpty(fileId))
            return VideoImportResult.Failure(driveUrl, "URL Google Drive invalide — vérifiez que le lien est correct");

        string? tempPath = null;
        try
        {
            var (path, fileName) = await _driveService.DownloadToTempAsync(fileId);
            tempPath = path;
            _logger.LogInformation("Drive file downloaded: {FileName} ({Path})", fileName, tempPath);

            // Reuse the same local-file pipeline (dictionary → Gemini → DB)
            return await ImportFromLocalFilePathAsync(tempPath, fileName, coachId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to import from Google Drive: {FileId}", fileId);
            return VideoImportResult.Failure(driveUrl,
                "Impossible de télécharger le fichier. Assurez-vous que le partage est public (\"Tous les utilisateurs avec le lien\").");
        }
        finally
        {
            if (tempPath != null)
                try { File.Delete(tempPath); } catch { }
        }
    }

    /// <summary>
    /// Lists all videos from a YouTube channel/playlist without downloading them.
    /// </summary>
    public async Task<List<ChannelVideoInfo>> ListChannelVideosAsync(string channelUrl, int maxVideos = 50)
    {
        var videos = await _youtubeService.GetPlaylistVideosAsync(channelUrl, maxVideos);
        return videos.Select(v => new ChannelVideoInfo
        {
            Url = v.Url,
            Title = v.Title,
            ThumbnailUrl = v.ThumbnailUrl,
            DurationSeconds = v.DurationSeconds
        }).ToList();
    }

    // ──────────────────────────────────────────────────────────
    // Core detection pipeline
    // ──────────────────────────────────────────────────────────

    private async Task<VideoImportResult> AnalyzeAndCreateAsync(
        int coachId,
        string title,
        string videoUrl,
        string? thumbnailUrl,
        int? duration,
        string? localFilePath,
        bool isYoutube)
    {
        string detectedName;
        string detectedCategory;
        string detectionMethod;

        // --- Strategy 1: Dictionary (fast, free) ---
        var (dictCategory, dictName) = ExerciseDictionary.Detect(title);
        if (dictCategory != null)
        {
            detectedName = dictName ?? title;
            detectedCategory = dictCategory;
            detectionMethod = "dictionary";
            _logger.LogInformation("Dictionary match: {Name} → {Category}", detectedName, detectedCategory);
        }
        else
        {
            // --- Strategy 2: Gemini AI ---
            _logger.LogInformation("Title '{Title}' unclear, using Gemini", title);
            detectionMethod = "gemini";

            // For YouTube: use title-only detection (avoids yt-dlp/ffmpeg subprocess instability).
            // For local files: extract frames with ffmpeg (fast, no network) then use both.
            List<string> frames = new List<string>();
            if (!isYoutube && localFilePath != null)
            {
                try
                {
                    frames = await _youtubeService.ExtractFramesFromFileAsync(localFilePath, 3);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Frame extraction failed (non-fatal), using title-only Gemini");
                }
            }

            var aiResult = await _geminiService.AnalyzeExerciseFramesAsync(frames, title);

            if (aiResult != null)
            {
                detectedName = aiResult.ExerciseName;
                detectedCategory = aiResult.Category;
                _logger.LogInformation("Gemini detection OK → '{Name}' / '{Category}' (frames={FrameCount})", detectedName, detectedCategory, frames.Count);
            }
            else
            {
                detectedName = title;
                detectedCategory = "Other";
                detectionMethod = "fallback";
                _logger.LogInformation("Gemini returned null, fallback to title '{Title}'", title);
            }
        }

        // --- Create ExerciseTemplate in DB ---
        _logger.LogInformation("Saving template → CoachId={CoachId} Name='{Name}' Category='{Category}' VideoUrl='{VideoUrl}'",
            coachId, detectedName, detectedCategory, videoUrl);
        try
        {
            var category2 = GetCategory2(detectedCategory);
            var template = new ExerciseTemplate
            {
                CoachId = coachId,
                Name = detectedName,
                Category = detectedCategory,
                Category2 = category2,
                VideoUrl = videoUrl,
                ThumbnailUrl = thumbnailUrl,
                Duration = duration,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            var created = await _repository.AddExerciseTemplateAsync(template);
            _logger.LogInformation("Template saved successfully with Id={Id}", created.ExerciseTemplateId);

            return VideoImportResult.Success(
                exerciseTemplateId: created.ExerciseTemplateId,
                name: detectedName,
                category: detectedCategory,
                videoUrl: videoUrl,
                thumbnailUrl: thumbnailUrl,
                detectionMethod: detectionMethod
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "DB save FAILED → CoachId={CoachId} Name='{Name}' ExType={ExType} InnerMsg='{Inner}'",
                coachId, detectedName, ex.GetType().Name, ex.InnerException?.Message ?? "none");
            return VideoImportResult.Failure(videoUrl, "Erreur lors de la création dans la base de données");
        }
    }

    private static string? GetCategory2(string category) => category switch
    {
        "Pectoraux" => "UpperBody",
        "Épaules" => "UpperBody",
        "Dos" => "UpperBody",
        "Bras" => "UpperBody",
        "Jambes" => "LowerBody",
        _ => null
    };
}
