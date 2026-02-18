using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Models.Generated;

public partial class MuscleGroupImage
{
    [Key]
    public int MuscleGroupImageId { get; set; }

    public string Category { get; set; } = null!;

    public string ImageUrl { get; set; } = null!;

    public string ImageFileName { get; set; } = null!;

    public string Source { get; set; } = null!;

    public string? SourceUrl { get; set; }

    public int? PexelsId { get; set; }

    public string? Photographer { get; set; }

    public DateTime CreatedAt { get; set; }
}
