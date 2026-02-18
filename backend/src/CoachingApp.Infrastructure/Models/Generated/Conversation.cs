using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Models.Generated;

[Index("CoachClientId", Name = "IX_Conversations_CoachClientId")]
public partial class Conversation
{
    [Key]
    public int ConversationId { get; set; }

    public int CoachClientId { get; set; }

    public DateTime? LastMessageAt { get; set; }

    public DateTime CreatedAt { get; set; }

    [ForeignKey("CoachClientId")]
    [InverseProperty("Conversations")]
    public virtual CoachClient CoachClient { get; set; } = null!;

    [InverseProperty("Conversation")]
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
}
