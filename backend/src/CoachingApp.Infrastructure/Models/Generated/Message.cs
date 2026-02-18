using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Models.Generated;

[Index("ConversationId", Name = "IX_Messages_ConversationId")]
public partial class Message
{
    [Key]
    public int MessageId { get; set; }

    public int ConversationId { get; set; }

    public int SenderId { get; set; }

    public int SenderType { get; set; }

    public string MessageText { get; set; } = null!;

    public bool IsRead { get; set; }

    public DateTime SentAt { get; set; }

    public DateTime? ReadAt { get; set; }

    [ForeignKey("ConversationId")]
    [InverseProperty("Messages")]
    public virtual Conversation Conversation { get; set; } = null!;

    [InverseProperty("Message")]
    public virtual ICollection<MessageAttachment> MessageAttachments { get; set; } = new List<MessageAttachment>();
}
