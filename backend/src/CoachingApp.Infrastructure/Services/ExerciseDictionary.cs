namespace CoachingApp.Infrastructure.Services;

/// <summary>
/// Static keyword dictionary to detect exercise category from a video title.
/// Returns the category name or null if no match found.
/// </summary>
public static class ExerciseDictionary
{
    private static readonly List<(string[] Keywords, string Category, string? DetectedName)> Rules = new()
    {
        // Pectoraux
        (new[] { "bench press", "développé couché", "pec", "pectoraux", "chest", "chest fly", "chest press", "pompe", "push up", "dips", "cable fly", "incline press", "decline press", "butterfly", "pec deck" }, "Pectoraux", null),

        // Dos (conventional deadlift = back-dominant)
        (new[] { "deadlift", "soulevé de terre", "pull up", "traction", "lat pulldown",
                 "rowing", "row", "back", "dos", "trapèze", "trapezius", "rhomboid", "rhomboide",
                 "face pull", "pull down", "hyperextension" }, "Dos", null),

        // Épaules
        (new[] { "shoulder", "épaule", "epaule", "military press", "overhead press", "ohp", "lateral raise", "front raise", "rear delt", "upright row", "arnold press", "deltoïde", "deltoid" }, "Épaules", null),

        // Bras
        (new[] { "curl", "biceps", "triceps", "bras", "arm", "hammer curl", "preacher curl", "skull crusher", "tricep extension", "pushdown", "dip" }, "Bras", null),

        // Jambes
        (new[] { "squat", "lunge", "fente", "leg press", "leg curl", "leg extension", "jambe", "quadriceps", "quads", "hamstring", "ischio", "glute", "fessier", "hip thrust", "romanian deadlift", "rdl", "step up", "calf", "mollet", "sumo", "goblet squat" }, "Jambes", null),

        // Core
        (new[] { "plank", "crunch", "abdos", "abdominal", "core", "gainage", "russian twist", "sit up", "leg raise", "vacuum", "oblique", "mountain climber" }, "Core", null),

        // Cardio
        (new[] { "cardio", "run", "running", "sprint", "jump", "jumping", "burpee", "hiit", "treadmill", "cycling", "vélo", "bike", "elliptical", "box jump", "skipping", "corde à sauter", "rowing machine", "rameur" }, "Cardio", null),

        // Flexibility
        (new[] { "stretch", "étirement", "yoga", "mobilité", "mobility", "flexibility", "souplesse", "foam roll", "recovery", "récupération" }, "Flexibility", null),
    };

    /// <summary>
    /// Attempts to detect exercise category and name from a video title.
    /// Returns (category, detectedName) or (null, null) if no match.
    /// </summary>
    public static (string? Category, string? DetectedName) Detect(string title)
    {
        if (string.IsNullOrWhiteSpace(title)) return (null, null);

        var lower = title.ToLowerInvariant();

        foreach (var (keywords, category, detectedName) in Rules)
        {
            var matchedKeyword = keywords.FirstOrDefault(k => lower.Contains(k));
            if (matchedKeyword != null)
            {
                // Try to use the title as exercise name (cleaned up)
                var cleanTitle = CleanTitle(title);
                return (category, detectedName ?? cleanTitle);
            }
        }

        return (null, null);
    }

    private static string CleanTitle(string title)
    {
        // Remove common noise words from titles
        var noiseWords = new[] { "tutorial", "tutoriel", "how to", "comment faire", "beginner", "débutant", "advanced", "avancé",
            "workout", "exercise", "exercice", "technique", "form", "guide", "tips", "tuto", "#shorts", "#short", "#fitness",
            "#gym", "#workout", "| ", "- ", "• " };

        var clean = title;
        foreach (var noise in noiseWords)
            clean = clean.Replace(noise, "", StringComparison.OrdinalIgnoreCase);

        // Capitalize first letter and trim
        clean = clean.Trim(' ', '-', '|', '•', '#', '(', ')');
        if (clean.Length > 0)
            clean = char.ToUpperInvariant(clean[0]) + clean.Substring(1);

        return clean.Length > 3 ? clean : title;
    }
}
