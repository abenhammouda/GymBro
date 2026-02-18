using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Models.Generated;

[Index("CoachId", Name = "IX_ProgramTemplates_CoachId")]
public partial class ProgramTemplate
{
    [Key]
    public int ProgramTemplateId { get; set; }

    public int CoachId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public int Status { get; set; }

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public int Duration { get; set; }

    public int? CurrentWeek { get; set; }

    public string? CoverImageUrl { get; set; }

    public string? CoverImageFileName { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    [ForeignKey("CoachId")]
    [InverseProperty("ProgramTemplates")]
    public virtual Coach Coach { get; set; } = null!;
}
