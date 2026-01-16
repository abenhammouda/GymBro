using CoachingApp.Core.Enums;

namespace CoachingApp.Core.Entities;

public class MessageAttachment
{
    public int AttachmentId { get; set; }
    public int MessageId { get; set; }
    public string FileUrl { get; set; } = string.Empty;
    public FileType FileType { get; set; }
    public string? FileName { get; set; }
    public long? FileSize { get; set; }
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Message Message { get; set; } = null!;
}
