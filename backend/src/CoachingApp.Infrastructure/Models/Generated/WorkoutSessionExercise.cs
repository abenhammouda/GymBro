using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Models.Generated;

[Index("ExerciseTemplateId", Name = "IX_WorkoutSessionExercises_ExerciseTemplateId")]
[Index("WorkoutSessionId", Name = "IX_WorkoutSessionExercises_WorkoutSessionId")]
public partial class WorkoutSessionExercise
{
    [Key]
    public int WorkoutSessionExerciseId { get; set; }

    public int WorkoutSessionId { get; set; }

    public int ExerciseTemplateId { get; set; }

    public int OrderIndex { get; set; }

    public int Sets { get; set; }

    public int Reps { get; set; }

    public int RestSeconds { get; set; }

    public string? Notes { get; set; }

    [ForeignKey("ExerciseTemplateId")]
    [InverseProperty("WorkoutSessionExercises")]
    public virtual ExerciseTemplate ExerciseTemplate { get; set; } = null!;

    [ForeignKey("WorkoutSessionId")]
    [InverseProperty("WorkoutSessionExercises")]
    public virtual WorkoutSession WorkoutSession { get; set; } = null!;
}
