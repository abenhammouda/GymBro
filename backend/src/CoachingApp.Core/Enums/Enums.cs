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
    Completed,
    Cancelled
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
