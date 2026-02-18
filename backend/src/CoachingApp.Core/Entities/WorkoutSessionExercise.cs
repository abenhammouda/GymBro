namespace CoachingApp.Core.Entities;

public class WorkoutSessionExercise
{
    public int WorkoutSessionExerciseId { get; set; }
    public int WorkoutSessionId { get; set; }
    public int ExerciseTemplateId { get; set; }
    public int OrderIndex { get; set; } // Ordre d'affichage dans la séance
    public int Sets { get; set; } // Nombre de séries
    public int Reps { get; set; } // Nombre de répétitions
    public int RestSeconds { get; set; } = 60; // Temps de repos en secondes
    public string? Notes { get; set; }

    // Navigation properties
    public WorkoutSession WorkoutSession { get; set; } = null!;
    public ExerciseTemplate ExerciseTemplate { get; set; } = null!;
}
