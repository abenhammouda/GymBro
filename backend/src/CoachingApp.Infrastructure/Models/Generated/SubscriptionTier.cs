using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Models.Generated;

public partial class SubscriptionTier
{
    [Key]
    public int SubscriptionTierId { get; set; }

    public int Name { get; set; }

    public int? MaxClients { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal MonthlyPrice { get; set; }

    public string? Features { get; set; }

    public bool IsActive { get; set; }

    [InverseProperty("SubscriptionTier")]
    public virtual ICollection<Coach> Coaches { get; set; } = new List<Coach>();

    [InverseProperty("SubscriptionTier")]
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
