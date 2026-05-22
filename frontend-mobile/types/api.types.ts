// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  emailOrPhone: string;
  password: string;
  userType: 'Adherent' | 'Coach';
}

export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  userType: 'Adherent' | 'Coach';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
  userType: 'Adherent' | 'Coach';
}

// ─── Coach-Client ─────────────────────────────────────────────────────────────

export interface CoachClientInfo {
  coachClientId: string;
  coachId: string;
  adherentId: string;
  status: 'Active' | 'Paused' | 'Inactive';
  startDate: string;
}

// ─── Scheduled Workouts ───────────────────────────────────────────────────────

export interface WorkoutSessionExercise {
  exerciseTemplateId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  restSeconds: number;
  notes?: string;
  orderIndex: number;
  videoUrl?: string;
}

export interface WorkoutSessionDetail {
  workoutSessionId: string;
  name: string;
  category: string;
  duration: number;
  exercises: WorkoutSessionExercise[];
}

export interface ScheduledWorkoutResponse {
  scheduledWorkoutSessionId: string;
  workoutSessionId: string;
  adherentId: string;
  scheduledDate: string; // ISO date
  scheduledTime?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  workoutSession?: WorkoutSessionDetail;
}

// ─── Scheduled Meals ─────────────────────────────────────────────────────────

export interface MealIngredientDetail {
  mealIngredientId: string;
  name: string;
  quantityGrams: number;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
}

export interface MealDetail {
  mealId: string;
  name: string;
  imageUrl?: string;
  ingredients: MealIngredientDetail[];
  totalCalories: number;
  totalProteins: number;
  totalCarbs: number;
  totalFats: number;
}

export interface ScheduledMealResponse {
  scheduledMealId: string;
  mealId: string;
  adherentId: string;
  scheduledDate: string;
  scheduledTime?: string;
  status: 'scheduled' | 'completed' | 'skipped';
  meal?: MealDetail;
}

// ─── Macro Plans ──────────────────────────────────────────────────────────────

export interface MacroPlanDto {
  macroPlanId: string;
  coachClientId: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  startDate: string;
  endDate?: string;
  notes?: string;
  isActive: boolean;
}

// ─── Weekly Progress ─────────────────────────────────────────────────────────

export interface ProgressPhoto {
  progressPhotoId: string;
  photoUrl: string;
  photoType: 'Front' | 'Side' | 'Back';
}

export interface WeeklyProgressDto {
  progressReportId: string;
  coachClientId: string;
  weekNumber: number;
  reportDate: string;
  currentWeight: number;
  notes?: string;
  photos: ProgressPhoto[];
}

export interface SubmitProgressRequest {
  coachClientId: string;
  weekNumber: number;
  currentWeight: number;
  notes?: string;
  photos?: { photoUrl: string; photoType: 'Front' | 'Side' | 'Back' }[];
}

// ─── Messages ────────────────────────────────────────────────────────────────

export interface MessageResponse {
  messageId: string;
  conversationId: string;
  senderId: string;
  senderType: 'Coach' | 'Adherent';
  messageText: string;
  isRead: boolean;
  sentAt: string;
  readAt?: string;
}

export interface ConversationInfo {
  conversationId: string;
  coachId: string;
  adherentId: string;
  coachName: string;
  adherentName: string;
  lastMessage?: MessageResponse;
  unreadCount: number;
  createdAt: string;
}
