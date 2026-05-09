namespace CoachingApp.Core.Entities;

/// <summary>
/// Plan de macros défini par le coach pour un adhérent.
/// Un seul plan actif à la fois (EndDate == null = actif).
/// Le coach peut en créer un nouveau pour clore l'ancien (à la fin du programme).
/// </summary>
public class MacroPlan
{
    public int MacroPlanId { get; set; }
    public int CoachClientId { get; set; }

    // Macros nutritionnelles
    public int Calories { get; set; }
    public decimal ProteinGrams { get; set; }      // g
    public decimal CarbsGrams { get; set; }        // g
    public decimal FatGrams { get; set; }          // g

    // Durée du programme correspondant
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }         // null = plan actif en ce moment

    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public CoachClient CoachClient { get; set; } = null!;
}
