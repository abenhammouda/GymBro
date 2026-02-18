using System;
using System.Collections.Generic;
using CoachingApp.Infrastructure.Models.Generated;
using Microsoft.EntityFrameworkCore;

namespace CoachingApp.Infrastructure.Data;

public partial class CoachingAppDbContext : DbContext
{
    public CoachingAppDbContext()
    {
    }

    public CoachingAppDbContext(DbContextOptions<CoachingAppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Adherent> Adherents { get; set; }

    public virtual DbSet<BodyMeasurement> BodyMeasurements { get; set; }

    public virtual DbSet<CalendarItem> CalendarItems { get; set; }

    public virtual DbSet<Coach> Coaches { get; set; }

    public virtual DbSet<CoachClient> CoachClients { get; set; }

    public virtual DbSet<Conversation> Conversations { get; set; }

    public virtual DbSet<Exercise> Exercises { get; set; }

    public virtual DbSet<ExerciseTemplate> ExerciseTemplates { get; set; }

    public virtual DbSet<Meal> Meals { get; set; }

    public virtual DbSet<MealPlan> MealPlans { get; set; }

    public virtual DbSet<Message> Messages { get; set; }

    public virtual DbSet<MessageAttachment> MessageAttachments { get; set; }

    public virtual DbSet<MuscleGroupImage> MuscleGroupImages { get; set; }

    public virtual DbSet<Payment> Payments { get; set; }

    public virtual DbSet<Program> Programs { get; set; }

    public virtual DbSet<ProgramDay> ProgramDays { get; set; }

    public virtual DbSet<ProgramTemplate> ProgramTemplates { get; set; }

    public virtual DbSet<ProgressPhoto> ProgressPhotos { get; set; }

    public virtual DbSet<ProgressReport> ProgressReports { get; set; }

    public virtual DbSet<RefreshToken> RefreshTokens { get; set; }

    public virtual DbSet<SubscriptionTier> SubscriptionTiers { get; set; }

    public virtual DbSet<WeightLog> WeightLogs { get; set; }

    public virtual DbSet<WorkoutSession> WorkoutSessions { get; set; }

    public virtual DbSet<WorkoutSessionClient> WorkoutSessionClients { get; set; }

    public virtual DbSet<WorkoutSessionExercise> WorkoutSessionExercises { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Name=ConnectionStrings:DefaultConnection");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CoachClient>(entity =>
        {
            entity.HasOne(d => d.Adherent).WithMany(p => p.CoachClients).OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.Coach).WithMany(p => p.CoachClients).OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<WorkoutSession>(entity =>
        {
            entity.Property(e => e.Category).HasDefaultValue("");
            entity.Property(e => e.Name).HasDefaultValue("");

            entity.HasOne(d => d.Coach).WithMany(p => p.WorkoutSessions).OnDelete(DeleteBehavior.ClientSetNull);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
