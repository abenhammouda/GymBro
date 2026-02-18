using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Models.Generated;

[Index("ProgramDayId", Name = "IX_MealPlans_ProgramDayId")]
public partial class MealPlan
{
    [Key]
    public int MealPlanId { get; set; }

    public int ProgramDayId { get; set; }

    public int CaloriesTarget { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal? ProteinGrams { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal? CarbsGrams { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal? FatGrams { get; set; }

    public bool IsCompleted { get; set; }

    [InverseProperty("MealPlan")]
    public virtual ICollection<Meal> Meals { get; set; } = new List<Meal>();

    [ForeignKey("ProgramDayId")]
    [InverseProperty("MealPlans")]
    public virtual ProgramDay ProgramDay { get; set; } = null!;
}
