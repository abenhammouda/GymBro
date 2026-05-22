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

    // Intake Photos (photos souscription)
    public DbSet<IntakePhoto> IntakePhotos { get; set; }

    // Macro Plans (macros nutritionnelles par programme)
    public DbSet<MacroPlan> MacroPlans { get; set; }

    // Supplement Sets (compléments organisés par timing)
    public DbSet<SupplementSet> SupplementSets { get; set; }
    public DbSet<SupplementGroup> SupplementGroups { get; set; }
    public DbSet<SupplementSetItem> SupplementSetItems { get; set; }

    // Meal overrides / exceptions (free meal, replacement, skip)
    public DbSet<MealOverride> MealOverrides { get; set; }

    // Nutrition reference + AI alias cache
    public DbSet<NutritionFood> NutritionFoods { get; set; }
    public DbSet<FoodAliasCache> FoodAliasCaches { get; set; }

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
        modelBuilder.Entity<IntakePhoto>().HasKey(ip => ip.IntakePhotoId);
        modelBuilder.Entity<MacroPlan>().HasKey(mp => mp.MacroPlanId);

        // Configure IntakePhoto relationships
        modelBuilder.Entity<IntakePhoto>()
            .HasOne(ip => ip.Adherent)
            .WithMany(a => a.IntakePhotos)
            .HasForeignKey(ip => ip.AdherentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure MacroPlan relationships
        modelBuilder.Entity<MacroPlan>()
            .HasOne(mp => mp.CoachClient)
            .WithMany(cc => cc.MacroPlans)
            .HasForeignKey(mp => mp.CoachClientId)
            .OnDelete(DeleteBehavior.Cascade);

        // Configure MacroPlan decimal precision
        modelBuilder.Entity<MacroPlan>()
            .Property(mp => mp.ProteinGrams).HasPrecision(6, 2);
        modelBuilder.Entity<MacroPlan>()
            .Property(mp => mp.CarbsGrams).HasPrecision(6, 2);
        modelBuilder.Entity<MacroPlan>()
            .Property(mp => mp.FatGrams).HasPrecision(6, 2);

        // Configure ProgressReport -> CoachClient relationship
        modelBuilder.Entity<ProgressReport>()
            .HasOne(pr => pr.CoachClient)
            .WithMany()
            .HasForeignKey(pr => pr.CoachClientId)
            .OnDelete(DeleteBehavior.Restrict);

        // Index on ProgressReport.CoachClientId for fast weekly progress queries
        modelBuilder.Entity<ProgressReport>()
            .HasIndex(pr => pr.CoachClientId);

        // Configure Adherent new decimal fields
        modelBuilder.Entity<Adherent>()
            .Property(a => a.InitialWeight).HasPrecision(5, 2);

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

        // Configure MealOverride relationships
        modelBuilder.Entity<MealOverride>()
            .HasOne(mo => mo.ScheduledMeal)
            .WithOne(sm => sm.Override)
            .HasForeignKey<MealOverride>(mo => mo.ScheduledMealId)
            .OnDelete(DeleteBehavior.ClientCascade);

        modelBuilder.Entity<MealOverride>()
            .HasOne(mo => mo.ReplacementMeal)
            .WithMany()
            .HasForeignKey(mo => mo.ReplacementMealId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<MealOverride>()
            .Property(mo => mo.ActionType)
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

        // Macros precision (nullable decimals)
        modelBuilder.Entity<MealIngredient>().Property(mi => mi.Calories).HasPrecision(8, 2);
        modelBuilder.Entity<MealIngredient>().Property(mi => mi.Proteins).HasPrecision(8, 2);
        modelBuilder.Entity<MealIngredient>().Property(mi => mi.Carbs).HasPrecision(8, 2);
        modelBuilder.Entity<MealIngredient>().Property(mi => mi.Fats).HasPrecision(8, 2);

        // Link ingredient -> NutritionFood (optional). SetNull keeps ingredient if food reference is removed.
        modelBuilder.Entity<MealIngredient>()
            .HasOne(mi => mi.NutritionFood)
            .WithMany()
            .HasForeignKey(mi => mi.NutritionFoodId)
            .OnDelete(DeleteBehavior.SetNull);

        // NutritionFood
        modelBuilder.Entity<NutritionFood>().HasKey(nf => nf.NutritionFoodId);
        modelBuilder.Entity<NutritionFood>().Property(nf => nf.CanonicalName)
            .IsRequired().HasMaxLength(200);
        modelBuilder.Entity<NutritionFood>().Property(nf => nf.CanonicalNameFr).HasMaxLength(200);
        modelBuilder.Entity<NutritionFood>().Property(nf => nf.Source).HasMaxLength(32);
        modelBuilder.Entity<NutritionFood>().Property(nf => nf.CaloriesPer100g).HasPrecision(8, 2);
        modelBuilder.Entity<NutritionFood>().Property(nf => nf.ProteinsPer100g).HasPrecision(8, 2);
        modelBuilder.Entity<NutritionFood>().Property(nf => nf.CarbsPer100g).HasPrecision(8, 2);
        modelBuilder.Entity<NutritionFood>().Property(nf => nf.FatsPer100g).HasPrecision(8, 2);
        modelBuilder.Entity<NutritionFood>().HasIndex(nf => nf.CanonicalName);
        modelBuilder.Entity<NutritionFood>().HasIndex(nf => nf.CanonicalNameFr);

        // FoodAliasCache
        modelBuilder.Entity<FoodAliasCache>().HasKey(fac => fac.FoodAliasCacheId);
        modelBuilder.Entity<FoodAliasCache>().Property(fac => fac.NormalizedInput)
            .IsRequired().HasMaxLength(200);
        modelBuilder.Entity<FoodAliasCache>().HasIndex(fac => fac.NormalizedInput).IsUnique();
        modelBuilder.Entity<FoodAliasCache>()
            .HasOne(fac => fac.NutritionFood)
            .WithMany()
            .HasForeignKey(fac => fac.NutritionFoodId)
            .OnDelete(DeleteBehavior.SetNull);

        // Configure SupplementSet primary key & relationships
        modelBuilder.Entity<SupplementSet>().HasKey(ss => ss.SupplementSetId);

        modelBuilder.Entity<SupplementSet>()
            .HasOne(ss => ss.Coach)
            .WithMany()
            .HasForeignKey(ss => ss.CoachId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SupplementSet>()
            .HasIndex(ss => new { ss.CoachId, ss.Timing, ss.Index })
            .IsUnique();

        // Configure SupplementGroup primary key & relationships
        modelBuilder.Entity<SupplementGroup>().HasKey(sg => sg.SupplementGroupId);

        modelBuilder.Entity<SupplementGroup>()
            .HasOne(sg => sg.Set)
            .WithMany(ss => ss.Groups)
            .HasForeignKey(sg => sg.SupplementSetId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SupplementGroup>()
            .Property(sg => sg.Name)
            .IsRequired()
            .HasMaxLength(120);

        // Configure SupplementSetItem primary key & relationships
        modelBuilder.Entity<SupplementSetItem>().HasKey(ssi => ssi.SupplementSetItemId);

        modelBuilder.Entity<SupplementSetItem>()
            .HasOne(ssi => ssi.Group)
            .WithMany(sg => sg.Items)
            .HasForeignKey(ssi => ssi.SupplementGroupId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<SupplementSetItem>()
            .Property(ssi => ssi.Name)
            .IsRequired()
            .HasMaxLength(120);

        modelBuilder.Entity<SupplementSetItem>()
            .Property(ssi => ssi.Unit)
            .IsRequired()
            .HasMaxLength(16);

        modelBuilder.Entity<SupplementSetItem>()
            .Property(ssi => ssi.Quantity)
            .HasPrecision(10, 3);

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
