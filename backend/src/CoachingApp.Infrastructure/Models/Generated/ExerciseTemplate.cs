using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Models.Generated;

[Index("CoachId", Name = "IX_ExerciseTemplates_CoachId")]
public partial class ExerciseTemplate
{
    [Key]
    public int ExerciseTemplateId { get; set; }

    public int CoachId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public string Category { get; set; } = null!;

    public string? Equipment { get; set; }

    public string? VideoUrl { get; set; }

    public string? VideoFileName { get; set; }

    public string? ThumbnailUrl { get; set; }

    public int? Duration { get; set; }

    public string? Instructions { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public string? Category2 { get; set; }

    [ForeignKey("CoachId")]
    [InverseProperty("ExerciseTemplates")]
    public virtual Coach Coach { get; set; } = null!;

    [InverseProperty("ExerciseTemplate")]
    public virtual ICollection<WorkoutSessionExercise> WorkoutSessionExercises { get; set; } = new List<WorkoutSessionExercise>();
}
