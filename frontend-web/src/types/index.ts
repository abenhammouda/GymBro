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

export type ExerciseCategory =
    | 'UpperBody'
    | 'LowerBody'
    | 'Back'
    | 'Core'
    | 'Cardio'
    | 'Flexibility'
    | 'Other';

export interface ExerciseTemplate {
    exerciseTemplateId: number;
    name: string;
    description?: string;
    category: ExerciseCategory;
    equipment?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    duration: number; // in seconds
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

