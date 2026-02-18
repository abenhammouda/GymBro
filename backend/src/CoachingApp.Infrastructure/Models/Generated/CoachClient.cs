using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Models.Generated;

[Index("AdherentId", Name = "IX_CoachClients_AdherentId")]
[Index("CoachId", Name = "IX_CoachClients_CoachId")]
public partial class CoachClient
{
    [Key]
    public int CoachClientId { get; set; }

    public int CoachId { get; set; }

    public int AdherentId { get; set; }

    public int Status { get; set; }

    public DateTime StartDate { get; set; }

    public string? GoalSummary { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    [ForeignKey("AdherentId")]
    [InverseProperty("CoachClients")]
    public virtual Adherent Adherent { get; set; } = null!;

    [InverseProperty("CoachClient")]
    public virtual ICollection<CalendarItem> CalendarItems { get; set; } = new List<CalendarItem>();

    [ForeignKey("CoachId")]
    [InverseProperty("CoachClients")]
    public virtual Coach Coach { get; set; } = null!;

    [InverseProperty("CoachClient")]
    public virtual ICollection<Conversation> Conversations { get; set; } = new List<Conversation>();

    [InverseProperty("CoachClient")]
    public virtual ICollection<Program> Programs { get; set; } = new List<Program>();
}
