namespace CoachingApp.Core.Enums;

public enum SubscriptionTierName
{
    Starter,
    Pro,
    Premium
}

public enum CoachClientStatus
{
    Active,
    Paused,
    Inactive,
    Completed,
    Cancelled
}

public enum WorkNature
{
    Sedentary,          // bureau, télétravail sédentaire
    LightActivity,      // travail léger debout
    ModerateActivity,   // travail modéré (manutention légère)
    ActiveWork,         // travail physique intense
    VeryActive          // travail très physique (BTP, agriculture...)
}

public enum GoalType
{
    WeightLoss,
    MuscleGain,
    Maintenance,
    Endurance,
    Flexibility
}

public enum ProgramStatus
{
    Draft,
    Active,
    Completed,
    Cancelled
}

public enum PaymentStatus
{
    Pending,
    Completed,
    Failed,
    Refunded
}

public enum MealType
{
    Breakfast,
    Lunch,
    Dinner,
    Snack
}

public enum PhotoType
{
    Front,
    Side,
    Back
}

public enum CalendarItemType
{
    Appointment,
    Reminder,
    CheckIn
}

public enum SenderType
{
    Coach,
    Adherent
}

public enum FileType
{
    Image,
    Video,
    Document
}

public enum SupplementTiming
{
    PreMeal,
    PostMeal,
    PreWorkout,
    PostWorkout
}

public enum NutritionGoal
{
    Deficit,
    Maintenance,
    Surplus
}
