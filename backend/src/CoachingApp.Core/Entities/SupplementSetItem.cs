namespace CoachingApp.Core.Entities;

public class SupplementSetItem
{
    public int SupplementSetItemId { get; set; }
    public int SupplementSetId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = "g";
    public int OrderIndex { get; set; }

    public SupplementSet Set { get; set; } = null!;
}
