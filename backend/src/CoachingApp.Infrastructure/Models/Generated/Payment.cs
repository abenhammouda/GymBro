using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Models.Generated;

[Index("CoachId", Name = "IX_Payments_CoachId")]
[Index("SubscriptionTierId", Name = "IX_Payments_SubscriptionTierId")]
public partial class Payment
{
    [Key]
    public int PaymentId { get; set; }

    public int CoachId { get; set; }

    public int SubscriptionTierId { get; set; }

    [Column(TypeName = "decimal(18, 2)")]
    public decimal Amount { get; set; }

    public string Currency { get; set; } = null!;

    public DateTime PaymentDate { get; set; }

    public string? PaymentMethod { get; set; }

    public int Status { get; set; }

    public string? TransactionId { get; set; }

    public DateTime CreatedAt { get; set; }

    [ForeignKey("CoachId")]
    [InverseProperty("Payments")]
    public virtual Coach Coach { get; set; } = null!;

    [ForeignKey("SubscriptionTierId")]
    [InverseProperty("Payments")]
    public virtual SubscriptionTier SubscriptionTier { get; set; } = null!;
}
