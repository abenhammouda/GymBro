using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Models.Generated;

[Index("MealPlanId", Name = "IX_Meals_MealPlanId")]
public partial class Meal
{
    [Key]
    public int MealId { get; set; }

    public int MealPlanId { get; set; }

    public int MealType { get; set; }

    public TimeOnly? MealTime { get; set; }

    public string? Description { get; set; }

    public int? Calories { get; set; }

    public bool IsCompleted { get; set; }

    public int OrderIndex { get; set; }

    [ForeignKey("MealPlanId")]
    [InverseProperty("Meals")]
    public virtual MealPlan MealPlan { get; set; } = null!;
}
