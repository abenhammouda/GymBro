using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Models.Generated;

[Index("CoachClientId", Name = "IX_Programs_CoachClientId")]
public partial class Program
{
    [Key]
    public int ProgramId { get; set; }

    public int CoachClientId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public int Status { get; set; }

    public DateTime CreatedAt { get; set; }

    [ForeignKey("CoachClientId")]
    [InverseProperty("Programs")]
    public virtual CoachClient CoachClient { get; set; } = null!;

    [InverseProperty("Program")]
    public virtual ICollection<ProgramDay> ProgramDays { get; set; } = new List<ProgramDay>();

    [InverseProperty("Program")]
    public virtual ICollection<ProgressReport> ProgressReports { get; set; } = new List<ProgressReport>();
}
