using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Models.Generated;

[Index("SubscriptionTierId", Name = "IX_Coaches_SubscriptionTierId")]
public partial class Coach
{
    [Key]
    public int CoachId { get; set; }

    public string Name { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? PhoneNumber { get; set; }

    public string PasswordHash { get; set; } = null!;

    public string? ProfilePicture { get; set; }

    public string? Bio { get; set; }

    public string? Specialization { get; set; }

    public int? SubscriptionTierId { get; set; }

    public DateTime? SubscriptionStartDate { get; set; }

    public DateTime? SubscriptionEndDate { get; set; }

    public bool IsEmailVerified { get; set; }

    public bool IsPhoneVerified { get; set; }

    public string? VerificationCode { get; set; }

    public DateTime? VerificationCodeExpiry { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool IsActive { get; set; }

    [InverseProperty("Coach")]
    public virtual ICollection<CoachClient> CoachClients { get; set; } = new List<CoachClient>();

    [InverseProperty("Coach")]
    public virtual ICollection<ExerciseTemplate> ExerciseTemplates { get; set; } = new List<ExerciseTemplate>();

    [InverseProperty("Coach")]
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    [InverseProperty("Coach")]
    public virtual ICollection<ProgramTemplate> ProgramTemplates { get; set; } = new List<ProgramTemplate>();

    [ForeignKey("SubscriptionTierId")]
    [InverseProperty("Coaches")]
    public virtual SubscriptionTier? SubscriptionTier { get; set; }

    [InverseProperty("Coach")]
    public virtual ICollection<WorkoutSession> WorkoutSessions { get; set; } = new List<WorkoutSession>();
}
