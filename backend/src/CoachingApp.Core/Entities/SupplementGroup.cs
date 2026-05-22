namespace CoachingApp.Core.Entities;

public class SupplementGroup
{
    public int SupplementGroupId { get; set; }
    public int SupplementSetId { get; set; }
    public string Name { get; set; } = string.Empty;
    public int OrderIndex { get; set; }

    public SupplementSet Set { get; set; } = null!;
    public ICollection<SupplementSetItem> Items { get; set; } = new List<SupplementSetItem>();
}
