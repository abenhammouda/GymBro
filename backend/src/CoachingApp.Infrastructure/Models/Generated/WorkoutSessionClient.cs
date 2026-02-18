using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Models.Generated;

[Index("AdherentId", Name = "IX_WorkoutSessionClients_AdherentId")]
[Index("WorkoutSessionId", Name = "IX_WorkoutSessionClients_WorkoutSessionId")]
public partial class WorkoutSessionClient
{
    [Key]
    public int WorkoutSessionClientId { get; set; }

    public int WorkoutSessionId { get; set; }

    public int AdherentId { get; set; }

    public DateTime AssignedAt { get; set; }

    [ForeignKey("AdherentId")]
    [InverseProperty("WorkoutSessionClients")]
    public virtual Adherent Adherent { get; set; } = null!;

    [ForeignKey("WorkoutSessionId")]
    [InverseProperty("WorkoutSessionClients")]
    public virtual WorkoutSession WorkoutSession { get; set; } = null!;
}
