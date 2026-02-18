using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Models.Generated;

public partial class Adherent
{
    [Key]
    public int AdherentId { get; set; }

    public string Name { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? PhoneNumber { get; set; }

    public string PasswordHash { get; set; } = null!;

    public string? ProfilePicture { get; set; }

    public DateTime? DateOfBirth { get; set; }

    public string? Gender { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal? Height { get; set; }

    public bool IsEmailVerified { get; set; }

    public string? VerificationCode { get; set; }

    public DateTime? VerificationCodeExpiry { get; set; }

    public DateTime CreatedAt { get; set; }

    public bool IsActive { get; set; }

    [InverseProperty("Adherent")]
    public virtual ICollection<CoachClient> CoachClients { get; set; } = new List<CoachClient>();

    [InverseProperty("Adherent")]
    public virtual ICollection<WeightLog> WeightLogs { get; set; } = new List<WeightLog>();

    [InverseProperty("Adherent")]
    public virtual ICollection<WorkoutSessionClient> WorkoutSessionClients { get; set; } = new List<WorkoutSessionClient>();
}
