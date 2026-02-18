using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Models.Generated;

[Index("ProgramId", Name = "IX_ProgressReports_ProgramId")]
public partial class ProgressReport
{
    [Key]
    public int ProgressReportId { get; set; }

    public int ProgramId { get; set; }

    public int AdherentId { get; set; }

    public DateTime ReportDate { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? CurrentWeight { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; }

    [InverseProperty("ProgressReport")]
    public virtual BodyMeasurement? BodyMeasurement { get; set; }

    [ForeignKey("ProgramId")]
    [InverseProperty("ProgressReports")]
    public virtual Program Program { get; set; } = null!;

    [InverseProperty("ProgressReport")]
    public virtual ICollection<ProgressPhoto> ProgressPhotos { get; set; } = new List<ProgressPhoto>();
}
