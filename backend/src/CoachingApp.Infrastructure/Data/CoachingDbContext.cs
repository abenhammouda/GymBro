using Microsoft.EntityFrameworkCore;
using CoachingApp.Core.Entities;

namespace CoachingApp.Infrastructure.Data;

public class CoachingDbContext : DbContext
{
    public CoachingDbContext(DbContextOptions<CoachingDbContext> options) : base(options)
    {
    }

    // User Management
    public DbSet<Coach> Coaches { get; set; }
    public DbSet<Adherent> Adherents { get; set; }
    public DbSet<CoachClient> CoachClients { get; set; }

    // Payment System
    public DbSet<SubscriptionTier> SubscriptionTiers { get; set; }
    public DbSet<Payment> Payments { get; set; }

    // Programs
    public DbSet<Program> Programs { get; set; }
    public DbSet<ProgramDay> ProgramDays { get; set; }
    public DbSet<WorkoutSession> WorkoutSessions { get; set; }
    public DbSet<Exercise> Exercises { get; set; }
    public DbSet<MealPlan> MealPlans { get; set; }
    public DbSet<Meal> Meals { get; set; }
    public DbSet<MealTab> MealTabs { get; set; }
    public DbSet<MealIngredient> MealIngredients { get; set; }

    // Progress Tracking
    public DbSet<ProgressReport> ProgressReports { get; set; }
    public DbSet<ProgressPhoto> ProgressPhotos { get; set; }
    public DbSet<WeightLog> WeightLogs { get; set; }
    public DbSet<BodyMeasurements> BodyMeasurements { get; set; }

    // Messaging
    public DbSet<Conversation> Conversations { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<MessageAttachment> MessageAttachments { get; set; }

    // Calendar
    public DbSet<CalendarItem> CalendarItems { get; set; }

    // Authentication
    public DbSet<RefreshToken> RefreshTokens { get; set; }

    // Exercise Library
    public DbSet<ExerciseTemplate> ExerciseTemplates { get; set; }

    // Program Templates
    public DbSet<ProgramTemplate> ProgramTemplates { get; set; }

    // Workout Session Exercises
    public DbSet<WorkoutSessionExercise> WorkoutSessionExercises { get; set; }

    // Workout Session Clients
    public DbSet<WorkoutSessionClient> WorkoutSessionClients { get; set; }

    // Scheduled Workout Sessions
    public DbSet<ScheduledWorkoutSession> ScheduledWorkoutSessions { get; set; }

    // Scheduled Meals
    public DbSet<ScheduledMeal> ScheduledMeals { get; set; }

    // Muscle Group Images
    public DbSet<MuscleGroupImage> MuscleGroupImages { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure relationships and constraints
        modelBuilder.Entity<CoachClient>()
            .HasOne(cc => cc.Coach)
            .WithMany(c => c.CoachClients)
            .HasForeignKey(cc => cc.CoachId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<CoachClient>()
            .HasOne(cc => cc.Adherent)
            .WithMany(a => a.CoachClients)
            .HasForeignKey(cc => cc.AdherentId)
            .OnDelete(DeleteBehavior.Restrict);

        // Configure decimal precision
        modelBuilder.Entity<Payment>()
            .Property(p => p.Amount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<SubscriptionTier>()
            .Property(st => st.MonthlyPrice)
            .HasPrecision(18, 2);

        modelBuilder.Entity<ProgressReport>()
            .Property(pr => pr.CurrentWeight)
            .HasPrecision(5, 2);

        modelBuilder.Entity<WeightLog>()
            .Property(wl => wl.Weight)
            .HasPrecision(5, 2);

        // Configure BodyMeasurements primary key and decimal precision
        modelBuilder.Entity<BodyMeasurements>()
            .HasKey(bm => bm.MeasurementId);

        modelBuilder.Entity<BodyMeasurements>()
            .Property(bm => bm.Chest)
            .HasPrecision(5, 2);

        modelBuilder.Entity<BodyMeasurements>()
            .Property(bm => bm.Waist)
            .HasPrecision(5, 2);

        modelBuilder.Entity<BodyMeasurements>()
            .Property(bm => bm.Hips)
            .HasPrecision(5, 2);

        modelBuilder.Entity<BodyMeasurements>()
            .Property(bm => bm.Thighs)
            .HasPrecision(5, 2);

        modelBuilder.Entity<BodyMeasurements>()
            .Property(bm => bm.Arms)
            .HasPrecision(5, 2);

        // Configure all primary keys explicitly
        modelBuilder.Entity<Coach>().HasKey(c => c.CoachId);
        modelBuilder.Entity<Adherent>().HasKey(a => a.AdherentId);
        modelBuilder.Entity<CoachClient>().HasKey(cc => cc.CoachClientId);
        modelBuilder.Entity<SubscriptionTier>().HasKey(st => st.SubscriptionTierId);
        modelBuilder.Entity<Payment>().HasKey(p => p.PaymentId);
        modelBuilder.Entity<Program>().HasKey(p => p.ProgramId);
        modelBuilder.Entity<ProgramDay>().HasKey(pd => pd.ProgramDayId);
        modelBuilder.Entity<WorkoutSession>().HasKey(ws => ws.WorkoutSessionId);
        modelBuilder.Entity<Exercise>().HasKey(e => e.ExerciseId);
        modelBuilder.Entity<MealPlan>().HasKey(mp => mp.MealPlanId);
        modelBuilder.Entity<Meal>().HasKey(m => m.MealId);
        modelBuilder.Entity<ProgressReport>().HasKey(pr => pr.ProgressReportId);
        modelBuilder.Entity<ProgressPhoto>().HasKey(pp => pp.ProgressPhotoId);
        modelBuilder.Entity<WeightLog>().HasKey(wl => wl.WeightLogId);
        modelBuilder.Entity<Conversation>().HasKey(c => c.ConversationId);
        modelBuilder.Entity<Message>().HasKey(m => m.MessageId);
        modelBuilder.Entity<MessageAttachment>().HasKey(ma => ma.AttachmentId);
        modelBuilder.Entity<CalendarItem>().HasKey(ci => ci.CalendarItemId);
        modelBuilder.Entity<RefreshToken>().HasKey(rt => rt.RefreshTokenId);
        modelBuilder.Entity<ExerciseTemplate>().HasKey(et => et.ExerciseTemplateId);
        modelBuilder.Entity<ProgramTemplate>().HasKey(pt => pt.ProgramTemplateId);
        modelBuilder.Entity<WorkoutSessionExercise>().HasKey(wse => wse.WorkoutSessionExerciseId);
        modelBuilder.Entity<WorkoutSessionClient>().HasKey(wsc => wsc.WorkoutSessionClientId);
        modelBuilder.Entity<MuscleGroupImage>().HasKey(mgi => mgi.MuscleGroupImageId);

        // Configure WorkoutSessionClient relationships
        modelBuilder.Entity<WorkoutSessionClient>()
            .HasOne(wsc => wsc.WorkoutSession)
            .WithMany(ws => ws.AssignedClients)
            .HasForeignKey(wsc => wsc.WorkoutSessionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<WorkoutSessionClient>()
            .HasOne(wsc => wsc.Adherent)
            .WithMany()
            .HasForeignKey(wsc => wsc.AdherentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure ScheduledWorkoutSession relationships
        modelBuilder.Entity<ScheduledWorkoutSession>().HasKey(sws => sws.ScheduledWorkoutSessionId);
        
        modelBuilder.Entity<ScheduledWorkoutSession>()
            .HasOne(sws => sws.WorkoutSession)
            .WithMany()
            .HasForeignKey(sws => sws.WorkoutSessionId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ScheduledWorkoutSession>()
            .HasOne(sws => sws.Adherent)
            .WithMany()
            .HasForeignKey(sws => sws.AdherentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ScheduledWorkoutSession>()
            .Property(sws => sws.Status)
            .HasMaxLength(50);

        // Configure ScheduledMeal relationships
        modelBuilder.Entity<ScheduledMeal>().HasKey(sm => sm.ScheduledMealId);
        
        modelBuilder.Entity<ScheduledMeal>()
            .HasOne(sm => sm.Meal)
            .WithMany()
            .HasForeignKey(sm => sm.MealId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ScheduledMeal>()
            .HasOne(sm => sm.Adherent)
            .WithMany()
            .HasForeignKey(sm => sm.AdherentId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ScheduledMeal>()
            .Property(sm => sm.Status)
            .HasMaxLength(50);

        // Configure MealTab primary key
        modelBuilder.Entity<MealTab>().HasKey(mt => mt.MealTabId);

        // Configure MealTab relationships
        modelBuilder.Entity<MealTab>()
            .HasOne(mt => mt.Coach)
            .WithMany()
            .HasForeignKey(mt => mt.CoachId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure Meal relationships
        modelBuilder.Entity<Meal>()
            .HasOne(m => m.MealTab)
            .WithMany(mt => mt.Meals)
            .HasForeignKey(m => m.MealTabId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure MealIngredient relationships
        modelBuilder.Entity<MealIngredient>()
            .HasOne(mi => mi.Meal)
            .WithMany(m => m.Ingredients)
            .HasForeignKey(mi => mi.MealId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure decimal precision for ingredient quantity
        modelBuilder.Entity<MealIngredient>()
            .Property(mi => mi.QuantityGrams)
            .HasPrecision(8, 2);

        // Seed initial data
        modelBuilder.Entity<SubscriptionTier>().HasData(
            new SubscriptionTier
            {
                SubscriptionTierId = 1,
                Name = CoachingApp.Core.Enums.SubscriptionTierName.Starter,
                MaxClients = 5,
                MonthlyPrice = 29.99m,
                Features = "{\"messaging\": true, \"templates\": true, \"analytics\": false}",
                IsActive = true
            },
            new SubscriptionTier
            {
                SubscriptionTierId = 2,
                Name = CoachingApp.Core.Enums.SubscriptionTierName.Pro,
                MaxClients = 20,
                MonthlyPrice = 79.99m,
                Features = "{\"messaging\": true, \"templates\": true, \"analytics\": true}",
                IsActive = true
            },
            new SubscriptionTier
            {
                SubscriptionTierId = 3,
                Name = CoachingApp.Core.Enums.SubscriptionTierName.Premium,
                MaxClients = null,
                MonthlyPrice = 149.99m,
                Features = "{\"messaging\": true, \"templates\": true, \"analytics\": true, \"priority_support\": true}",
                IsActive = true
            }
        );
    }
}
