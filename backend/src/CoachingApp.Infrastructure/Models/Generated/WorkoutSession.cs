using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Models.Generated;

[Index("CoachId", Name = "IX_WorkoutSessions_CoachId")]
[Index("ProgramDayId", Name = "IX_WorkoutSessions_ProgramDayId")]
public partial class WorkoutSession
{
    [Key]
    public int WorkoutSessionId { get; set; }

    public int? ProgramDayId { get; set; }

    public string Status { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime? StartDate { get; set; }

    public string? VoiceMessageUrl { get; set; }

    public string Category { get; set; } = null!;

    public int CoachId { get; set; }

    public string? CoverImageFileName { get; set; }

    public string? CoverImageUrl { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? EndDate { get; set; }

    public string Name { get; set; } = null!;

    public DateTime UpdatedAt { get; set; }

    public string? VoiceMessageFileName { get; set; }

    public int? Duration { get; set; }

    [ForeignKey("CoachId")]
    [InverseProperty("WorkoutSessions")]
    public virtual Coach Coach { get; set; } = null!;

    [InverseProperty("WorkoutSession")]
    public virtual ICollection<Exercise> Exercises { get; set; } = new List<Exercise>();

    [ForeignKey("ProgramDayId")]
    [InverseProperty("WorkoutSessions")]
    public virtual ProgramDay? ProgramDay { get; set; }

    [InverseProperty("WorkoutSession")]
    public virtual ICollection<WorkoutSessionClient> WorkoutSessionClients { get; set; } = new List<WorkoutSessionClient>();

    [InverseProperty("WorkoutSession")]
    public virtual ICollection<WorkoutSessionExercise> WorkoutSessionExercises { get; set; } = new List<WorkoutSessionExercise>();
}
