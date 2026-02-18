using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Models.Generated;

[Index("ProgramId", Name = "IX_ProgramDays_ProgramId")]
public partial class ProgramDay
{
    [Key]
    public int ProgramDayId { get; set; }

    public int ProgramId { get; set; }

    public DateTime Date { get; set; }

    public int DayIndex { get; set; }

    [InverseProperty("ProgramDay")]
    public virtual ICollection<MealPlan> MealPlans { get; set; } = new List<MealPlan>();

    [ForeignKey("ProgramId")]
    [InverseProperty("ProgramDays")]
    public virtual Program Program { get; set; } = null!;

    [InverseProperty("ProgramDay")]
    public virtual ICollection<WorkoutSession> WorkoutSessions { get; set; } = new List<WorkoutSession>();
}
