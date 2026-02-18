using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Models.Generated;

[Index("MessageId", Name = "IX_MessageAttachments_MessageId")]
public partial class MessageAttachment
{
    [Key]
    public int AttachmentId { get; set; }

    public int MessageId { get; set; }

    public string FileUrl { get; set; } = null!;

    public int FileType { get; set; }

    public string? FileName { get; set; }

    public long? FileSize { get; set; }

    public DateTime UploadedAt { get; set; }

    [ForeignKey("MessageId")]
    [InverseProperty("MessageAttachments")]
    public virtual Message Message { get; set; } = null!;
}
