using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Models.Generated;

[Index("WorkoutSessionId", Name = "IX_Exercises_WorkoutSessionId")]
public partial class Exercise
{
    [Key]
    public int ExerciseId { get; set; }

    public int WorkoutSessionId { get; set; }

    public string ExerciseName { get; set; } = null!;

    public int? Sets { get; set; }

    public int? Reps { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal? WeightKg { get; set; }

    public int? RestSeconds { get; set; }

    public bool IsCompleted { get; set; }

    public string? Notes { get; set; }

    public int OrderIndex { get; set; }

    [ForeignKey("WorkoutSessionId")]
    [InverseProperty("Exercises")]
    public virtual WorkoutSession WorkoutSession { get; set; } = null!;
}
