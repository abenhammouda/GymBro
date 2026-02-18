using CoachingApp.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Services;

public class WorkoutImageAssignmentService
{
    private readonly MuscleGroupImageService _imageService;

    public WorkoutImageAssignmentService(MuscleGroupImageService imageService)
    {
        _imageService = imageService;
    }

    public async Task<string?> AssignCoverImageAsync(WorkoutSession session)
    {
        Console.WriteLine($"🖼️ AssignCoverImageAsync called for session {session.WorkoutSessionId}");
        
        if (session.Exercises == null || !session.Exercises.Any())
        {
            Console.WriteLine("⚠️ No exercises in session");
            return null;
        }

        Console.WriteLine($"📝 Analyzing {session.Exercises.Count} exercises");

        // Analyze exercise composition
        var categoryCount = new Dictionary<string, int>();

        foreach (var exercise in session.Exercises)
        {
            if (exercise.ExerciseTemplate == null)
            {
                Console.WriteLine($"⚠️ Exercise {exercise.ExerciseTemplateId} has no template loaded");
                continue;
            }

            var category = DeterminePrimaryCategory(exercise.ExerciseTemplate);
            Console.WriteLine($"  - Exercise: {exercise.ExerciseTemplate.Name} → Category: {category}");
            
            if (categoryCount.ContainsKey(category))
            {
                categoryCount[category]++;
            }
            else
            {
                categoryCount[category] = 1;
            }
        }

        // Find dominant category
        var dominantCategory = GetDominantCategory(categoryCount);
        Console.WriteLine($"✅ Dominant category: {dominantCategory}");

        // Get random image for that category
        var image = await _imageService.GetRandomImageByCategoryAsync(dominantCategory);
        
        if (image == null)
        {
            Console.WriteLine($"❌ No image found for category: {dominantCategory}");
        }
        else
        {
            Console.WriteLine($"✅ Image found: {image.ImageUrl}");
        }

        return image?.ImageUrl;
    }

    private string DeterminePrimaryCategory(ExerciseTemplate exercise)
    {
        // Map exercise categories to muscle group image categories
        return exercise.Category switch
        {
            "Pectoraux" => "Chest",
            "Épaules" => "Shoulders",
            "Dos" => "Back",
            "Jambes" => "LowerBody",
            "Core" => "Core",
            "Cardio" => "Cardio",
            "Flexibility" => "Flexibility",
            _ => exercise.Category2 ?? "UpperBody"
        };
    }

    private string GetDominantCategory(Dictionary<string, int> categoryCount)
    {
        if (categoryCount.Count == 0) return "UpperBody";

        // Priority order for ties
        var priorityOrder = new[] { "Cardio", "UpperBody", "LowerBody", "Core", "Flexibility", "Chest", "Shoulders", "Back" };

        // Get max count
        var maxCount = categoryCount.Values.Max();

        // Get all categories with max count
        var topCategories = categoryCount
            .Where(kvp => kvp.Value == maxCount)
            .Select(kvp => kvp.Key)
            .ToList();

        // If only one, return it
        if (topCategories.Count == 1)
        {
            return topCategories[0];
        }

        // If tie, use priority order
        foreach (var priority in priorityOrder)
        {
            if (topCategories.Contains(priority))
            {
                return priority;
            }
        }

        return topCategories[0];
    }
}
