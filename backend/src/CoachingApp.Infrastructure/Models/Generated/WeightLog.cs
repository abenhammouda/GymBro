using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Models.Generated;

[Index("AdherentId", Name = "IX_WeightLogs_AdherentId")]
public partial class WeightLog
{
    [Key]
    public int WeightLogId { get; set; }

    public int AdherentId { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal Weight { get; set; }

    public DateTime LogDate { get; set; }

    public string? Notes { get; set; }

    [ForeignKey("AdherentId")]
    [InverseProperty("WeightLogs")]
    public virtual Adherent Adherent { get; set; } = null!;
}
