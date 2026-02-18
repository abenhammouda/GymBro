using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Models.Generated;

[Index("CoachClientId", Name = "IX_CalendarItems_CoachClientId")]
public partial class CalendarItem
{
    [Key]
    public int CalendarItemId { get; set; }

    public int CoachClientId { get; set; }

    public int ItemType { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime? EndDate { get; set; }

    public bool IsCompleted { get; set; }

    [ForeignKey("CoachClientId")]
    [InverseProperty("CalendarItems")]
    public virtual CoachClient CoachClient { get; set; } = null!;
}
