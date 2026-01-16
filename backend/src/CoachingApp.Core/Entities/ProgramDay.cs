namespace CoachingApp.Core.Entities;

public class ProgramDay
{
    public int ProgramDayId { get; set; }
    public int ProgramId { get; set; }
    public DateTime Date { get; set; }
    public int DayIndex { get; set; }

    // Navigation properties
    public Program Program { get; set; } = null!;
    public ICollection<WorkoutSession> WorkoutSessions { get; set; } = new List<WorkoutSession>();
    public ICollection<MealPlan> MealPlans { get; set; } = new List<MealPlan>();
}
