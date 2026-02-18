using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Models.Generated;

[Index("ProgressReportId", Name = "IX_BodyMeasurements_ProgressReportId", IsUnique = true)]
public partial class BodyMeasurement
{
    [Key]
    public int MeasurementId { get; set; }

    public int ProgressReportId { get; set; }

    public int AdherentId { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? Chest { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? Waist { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? Hips { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? Thighs { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? Arms { get; set; }

    public DateTime MeasurementDate { get; set; }

    [ForeignKey("ProgressReportId")]
    [InverseProperty("BodyMeasurement")]
    public virtual ProgressReport ProgressReport { get; set; } = null!;
}
