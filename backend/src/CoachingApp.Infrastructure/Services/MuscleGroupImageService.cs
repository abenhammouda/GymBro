using CoachingApp.Core.Entities;
using CoachingApp.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Services;

public class MuscleGroupImageService
{
    private readonly CoachingDbContext _context;
    private readonly PexelsImageService _pexelsService;

    public MuscleGroupImageService(CoachingDbContext context, PexelsImageService pexelsService)
    {
        _context = context;
        _pexelsService = pexelsService;
    }

    public async Task FetchAndStoreImagesAsync()
    {
        var categories = new Dictionary<string, string>
        {
            { "UpperBody", "upper body workout gym" },
            { "LowerBody", "leg workout gym squat" },
            { "Chest", "chest workout bench press" },
            { "Shoulders", "shoulder workout gym" },
            { "Back", "back workout gym" },
            { "Core", "core workout abs" },
            { "Cardio", "cardio workout running" },
            { "Flexibility", "stretching flexibility yoga" }
        };

        foreach (var (category, query) in categories)
        {
            // Check if we already have images for this category
            var existingCount = await _context.MuscleGroupImages
                .CountAsync(img => img.Category == category);

            if (existingCount >= 2)
            {
                Console.WriteLine($"Category {category} already has {existingCount} images, skipping...");
                continue;
            }

            try
            {
                // Search for images on Pexels
                var photos = await _pexelsService.SearchPhotosAsync(query, 3);

                // Download and store first 2 images
                var imagesToStore = photos.Take(2).ToList();

                foreach (var photo in imagesToStore)
                {
                    // Download image
                    var localPath = await _pexelsService.DownloadImageAsync(photo.Src.Large, category);

                    // Store in database
                    var muscleGroupImage = new MuscleGroupImage
                    {
                        Category = category,
                        ImageUrl = localPath,
                        ImageFileName = Path.GetFileName(localPath),
                        Source = "Pexels",
                        SourceUrl = photo.Src.Original,
                        PexelsId = photo.Id,
                        Photographer = photo.Photographer,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.MuscleGroupImages.Add(muscleGroupImage);
                }

                await _context.SaveChangesAsync();
                Console.WriteLine($"Successfully fetched and stored {imagesToStore.Count} images for {category}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching images for {category}: {ex.Message}");
            }
        }
    }

    public async Task<List<MuscleGroupImage>> GetImagesByCategoryAsync(string category)
    {
        return await _context.MuscleGroupImages
            .Where(img => img.Category == category)
            .ToListAsync();
    }

    public async Task<MuscleGroupImage?> GetRandomImageByCategoryAsync(string category)
    {
        var images = await GetImagesByCategoryAsync(category);
        if (images.Count == 0) return null;

        var random = new Random();
        return images[random.Next(images.Count)];
    }

    public async Task<List<MuscleGroupImage>> GetAllImagesAsync()
    {
        return await _context.MuscleGroupImages.ToListAsync();
    }
}
