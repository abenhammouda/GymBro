using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Models.Generated;

[Index("ProgressReportId", Name = "IX_ProgressPhotos_ProgressReportId")]
public partial class ProgressPhoto
{
    [Key]
    public int ProgressPhotoId { get; set; }

    public int ProgressReportId { get; set; }

    public string PhotoUrl { get; set; } = null!;

    public int PhotoType { get; set; }

    public DateTime UploadedAt { get; set; }

    [ForeignKey("ProgressReportId")]
    [InverseProperty("ProgressPhotos")]
    public virtual ProgressReport ProgressReport { get; set; } = null!;
}
