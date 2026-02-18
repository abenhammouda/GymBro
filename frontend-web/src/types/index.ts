// ==========================================
// TypeScript Type Definitions
// ==========================================

export interface User {
    id: number;
    email: string;
    phoneNumber?: string;
    firstName: string;
    lastName: string;
    role: 'Coach' | 'Adherent';
    createdAt: string;
}

export interface Coach extends User {
    role: 'Coach';
    specialization?: string;
    bio?: string;
    profilePictureUrl?: string;
}

export interface Adherent {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: 'Male' | 'Female' | 'Other';
    height?: number; // in cm
    currentWeight?: number; // in kg
    goalWeight?: number; // in kg
    goal?: string;
    notes?: string;
    profilePictureUrl?: string;
    coachId: number;
    status: 'Active' | 'Inactive' | 'Pending';
    createdAt: string;
    updatedAt: string;
}

export type ProgramStatus = 'Active' | 'Draft' | 'Completed' | 'Cancelled';

export interface Program {
    programId: number;
    name: string;
    description?: string;
    status: ProgramStatus;
    startDate?: string;
    endDate?: string;
    duration: number; // in weeks
    currentWeek?: number;
    coverImageUrl?: string;
    coachId: number;
    clientsAssigned: number;
    createdAt: string;
    updatedAt: string;
}

export interface Exercise {
    id: number;
    name: string;
    description?: string;
    category: 'UpperBody' | 'LowerBody' | 'Cardio' | 'Core' | 'Flexibility' | 'Other';
    equipment?: string;
    videoUrl?: string;
    imageUrl?: string;
    instructions?: string;
    createdAt: string;
}

export interface ProgressReport {
    id: number;
    adherentId: number;
    date: string;
    weight?: number;
    measurements?: {
        chest?: number;
        waist?: number;
        hips?: number;
        arms?: number;
        thighs?: number;
    };
    notes?: string;
    photos?: string[];
    createdAt: string;
}

export interface CalendarEvent {
    id: number;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    type: 'Session' | 'CheckIn' | 'Meal' | 'Other';
    adherentId?: number;
    coachId: number;
    location?: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    createdAt: string;
}

// ==========================================
// Authentication Types
// ==========================================

export interface LoginRequest {
    emailOrPhone: string;
    password: string;
    userType: 'Coach' | 'Adherent';
}

export interface RegisterCoachRequest {
    name: string;
    email?: string;
    phoneNumber?: string;
    password: string;
    bio?: string;
    specialization?: string;
}

export interface RegisterAdherentRequest {
    name: string;
    email: string;
    password: string;
    dateOfBirth?: string;
    gender?: 'Male' | 'Female' | 'Other';
    height?: number;
}

export interface VerifyCodeRequest {
    emailOrPhone: string;
    verificationCode: string;
    userType: 'Coach' | 'Adherent';
}

export interface SendVerificationCodeRequest {
    emailOrPhone: string;
    userType: 'Coach' | 'Adherent';
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: any;
    userType: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

// ==========================================
// API Response Types
// ==========================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: string[];
}

export interface PaginatedResponse<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

// ==========================================
// UI State Types
// ==========================================

export type ClientFilter = 'Active' | 'All' | 'Inactive';
export type CalendarView = 'Month' | 'Week' | 'Day';
export type SortDirection = 'asc' | 'desc';

export interface ClientListState {
    clients: Adherent[];
    filter: ClientFilter;
    searchQuery: string;
    sortBy: 'name' | 'weight' | 'lastActivity';
    sortDirection: SortDirection;
    selectedClient?: Adherent;
}

export interface CalendarState {
    events: CalendarEvent[];
    view: CalendarView;
    selectedDate: Date;
    selectedEvent?: CalendarEvent;
}

// ==========================================
// Messaging Types
// ==========================================

export interface Message {
    messageId: number;
    conversationId: number;
    senderId: number;
    senderType: 'Coach' | 'Adherent';
    messageText: string;
    isRead: boolean;
    sentAt: string;
    readAt?: string;
}

export interface Conversation {
    conversationId: number;
    coachClientId: number;
    lastMessageAt?: string;
    createdAt: string;
    participantName?: string;
    lastMessage?: Message;
    unreadCount?: number;
}

export interface SendMessageRequest {
    conversationId: number;
    messageText: string;
}

export interface ConversationListItem {
    conversationId: number;
    participantName: string;
    lastMessage?: Message;
    unreadCount: number;
    lastMessageAt?: string;
}

// ==========================================
// Exercise Library Types
// ==========================================
// Exercise Template Types
export type ExerciseCategory =
    | 'Pectoraux'
    | 'Épaules'
    | 'Dos'
    | 'Jambes'
    | 'Core'
    | 'Cardio'
    | 'Flexibility'
    | 'Other';

export type ExerciseCategory2 = 'UpperBody' | 'LowerBody' | null;

export interface ExerciseTemplate {
    exerciseTemplateId: number;
    name: string;
    description?: string;
    category: ExerciseCategory;
    category2?: ExerciseCategory2;
    equipment?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    duration?: number; // in seconds
    instructions?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateExerciseTemplateRequest {
    name: string;
    category: ExerciseCategory;
    description?: string;
    equipment?: string;
    instructions?: string;
    videoUrl?: string;
}

export interface UpdateExerciseTemplateRequest {
    name: string;
    category: ExerciseCategory;
    description?: string;
    equipment?: string;
    instructions?: string;
    videoUrl?: string;
}

export interface ExerciseSuggestion {
    name: string;
    category?: string;
}

// ==========================================
// Program DTOs
// ==========================================

export interface CreateProgramRequest {
    name: string;
    description?: string;
    status: ProgramStatus;
    startDate?: string;
    endDate?: string;
    duration: number;
}

export interface UpdateProgramRequest {
    name: string;
    description?: string;
    status: ProgramStatus;
    startDate?: string;
    endDate?: string;
    duration: number;
}


// ==========================================
// Workout Session Types
// ==========================================

export type WorkoutSessionStatus = 'Active' | 'Draft' | 'Archived';

export interface WorkoutSessionExercise {
    workoutSessionExerciseId: number;
    exerciseTemplateId: number;
    exerciseName: string;
    exerciseCategory?: string;
    exerciseVideoUrl?: string;
    exerciseThumbnailUrl?: string;
    orderIndex: number;
    sets: number;
    reps: number;
    restSeconds: number;
    notes?: string;
}

export interface WorkoutSession {
    workoutSessionId: number;
    name: string;
    description?: string;
    voiceMessageUrl?: string;
    coverImageUrl?: string;
    category: string;
    status: WorkoutSessionStatus;
    duration?: number;
    startDate?: string;
    endDate?: string;
    exerciseCount: number;
    exercises: WorkoutSessionExercise[];
    assignedClients?: AssignedClient[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateWorkoutSessionExerciseRequest {
    exerciseTemplateId: number;
    orderIndex: number;
    sets: number;
    reps: number;
    restSeconds: number;
    notes?: string;
}

export interface CreateWorkoutSessionRequest {
    name: string;
    description?: string;
    category: string;
    status: WorkoutSessionStatus;
    startDate?: string;
    endDate?: string;
    exercises: CreateWorkoutSessionExerciseRequest[];
}

export interface UpdateWorkoutSessionRequest {
    name: string;
    description?: string;
    category: string;
    status: WorkoutSessionStatus;
    startDate?: string;
    endDate?: string;
    exercises: CreateWorkoutSessionExerciseRequest[];
}

// ==========================================
// Client Assignment Types
// ==========================================

export interface AssignedClient {
    adherentId: number;
    name: string;
    email: string;
    phoneNumber?: string;
    profilePicture?: string;
    age?: number;
    goal?: string;
}

export interface AssignClientsRequest {
    adherentIds: number[];
}

// ==========================================
// Calendar Types
// ==========================================

export interface ScheduledWorkoutSession {
    scheduledWorkoutSessionId: number;
    workoutSessionId: number;
    adherentId: number;
    scheduledDate: string; // ISO date string
    scheduledTime?: string; // HH:mm format
    status: 'scheduled' | 'completed' | 'cancelled';
    workoutSession?: WorkoutSession;
    adherent?: AssignedClient;
}

export interface CreateScheduledWorkoutRequest {
    workoutSessionId: number;
    adherentId: number;
    scheduledDate: string;
    scheduledTime?: string;
}

export interface UpdateScheduledWorkoutRequest {
    scheduledDate: string;
    scheduledTime?: string;
    status?: 'scheduled' | 'completed' | 'cancelled';
}

// ==========================================
// Scheduled Meal Types
// ==========================================

export interface ScheduledMeal {
    scheduledMealId: number;
    mealId: number;
    adherentId: number;
    scheduledDate: string; // ISO date string
    scheduledTime?: string; // HH:mm format
    status: 'scheduled' | 'completed' | 'cancelled';
    meal?: Meal;
    adherent?: AssignedClient;
}

export interface CreateScheduledMealRequest {
    mealId: number;
    adherentId: number;
    scheduledDate: string;
    scheduledTime?: string;
}

export interface UpdateScheduledMealRequest {
    scheduledDate: string;
    scheduledTime?: string;
    status?: 'scheduled' | 'completed' | 'cancelled';
}

// ==========================================
// Unified Calendar Event Types
// ==========================================

export type CalendarEventType = ScheduledWorkoutSession | ScheduledMeal;

// Type guards for calendar events
export function isScheduledWorkout(event: CalendarEventType): event is ScheduledWorkoutSession {
    return 'scheduledWorkoutSessionId' in event && 'workoutSessionId' in event;
}

export function isScheduledMeal(event: CalendarEventType): event is ScheduledMeal {
    return 'scheduledMealId' in event && 'mealId' in event;
}

// ==========================================
// Meal Tab Types
// ==========================================

export interface MealTab {
    mealTabId: number;
    name: string;
    orderIndex: number;
    mealCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateMealTabRequest {
    name: string;
    orderIndex: number;
}

// ==========================================
// Meal Types
// ==========================================

export interface MealIngredient {
    name: string;
    quantityGrams: number;
    type: 'Aliment' | 'Complement';
    orderIndex: number;
}

export interface Meal {
    mealId: number;
    mealTabId: number;
    name: string;
    description?: string;
    imageUrl?: string;
    orderIndex: number;
    ingredients: MealIngredient[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateMealRequest {
    mealTabId: number;
    name: string;
    description?: string;
    ingredients: MealIngredient[];
    orderIndex: number;
}

export interface UpdateMealRequest {
    name: string;
    description?: string;
    ingredients: MealIngredient[];
}
