using CoachingApp.Core.Enums;

namespace CoachingApp.Core.Entities;

/// <summary>
/// Photos prises lors de la souscription (Front / Side / Back).
/// </summary>
public class IntakePhoto
{
    public int IntakePhotoId { get; set; }
    public int AdherentId { get; set; }
    public string PhotoUrl { get; set; } = string.Empty;
    public PhotoType PhotoType { get; set; }          // Front, Side, Back
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Adherent Adherent { get; set; } = null!;
}
