# Plan d'implémentation : Séances d'entraînement (Workout Sessions)

## Vue d'ensemble
Créer une fonctionnalité complète pour gérer les séances d'entraînement avec sélection d'exercices, configuration des séries/répétitions, et support de messages vocaux.

## Structure de données

### Entités Backend

#### 1. WorkoutSession (à modifier)
```csharp
public class WorkoutSession
{
    public int WorkoutSessionId { get; set; }
    public int CoachId { get; set; }
    public string Name { get; set; }
    public string? Description { get; set; }
    public string? VoiceMessageUrl { get; set; }
    public string? VoiceMessageFileName { get; set; }
    public string? CoverImageUrl { get; set; }
    public string Category { get; set; } // UpperBody, LowerBody, Core, Cardio, etc.
    public string Status { get; set; } // Active, Draft, Archived
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Navigation
    public Coach Coach { get; set; }
    public ICollection<WorkoutSessionExercise> Exercises { get; set; }
}
```

#### 2. WorkoutSessionExercise (nouvelle entité)
```csharp
public class WorkoutSessionExercise
{
    public int WorkoutSessionExerciseId { get; set; }
    public int WorkoutSessionId { get; set; }
    public int ExerciseTemplateId { get; set; }
    public int OrderIndex { get; set; } // Ordre d'affichage
    public int Sets { get; set; } // Nombre de séries
    public int Reps { get; set; } // Nombre de répétitions
    public int? RestSeconds { get; set; } // Temps de repos en secondes (ex: 60)
    public string? Notes { get; set; }
    
    // Navigation
    public WorkoutSession WorkoutSession { get; set; }
    public ExerciseTemplate ExerciseTemplate { get; set; }
}
```

## Backend - Modifications nécessaires

### 1. Entités
- [x] Vérifier WorkoutSession existant
- [ ] Modifier WorkoutSession pour ajouter les champs nécessaires
- [ ] Créer WorkoutSessionExercise
- [ ] Créer migration pour les nouvelles tables/colonnes

### 2. DTOs
- [ ] CreateWorkoutSessionRequest
- [ ] UpdateWorkoutSessionRequest
- [ ] WorkoutSessionResponse
- [ ] WorkoutSessionExerciseDto

### 3. Repository
- [ ] IWorkoutSessionRepository
- [ ] WorkoutSessionRepository

### 4. Service
- [ ] WorkoutSessionService

### 5. Controller
- [ ] WorkoutSessionsController

## Frontend - Modifications nécessaires

### 1. Types TypeScript
- [ ] WorkoutSession interface
- [ ] WorkoutSessionExercise interface

### 2. Services
- [ ] workoutSession.service.ts

### 3. Pages
- [ ] WorkoutSessionsPage.tsx

### 4. Composants
- [ ] WorkoutSessionModal.tsx
- [ ] ExerciseSelectionModal.tsx
- [ ] WorkoutSessionCard.tsx

## Ordre d'implémentation

### Phase 1 : Backend
1. Créer/modifier entités
2. Créer migration
3. Créer DTOs
4. Créer repository
5. Créer service
6. Créer controller

### Phase 2 : Frontend
1. Créer types TypeScript
2. Créer service API
3. Créer page WorkoutSessions
4. Créer modals
