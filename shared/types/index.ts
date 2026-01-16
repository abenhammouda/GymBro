// Shared TypeScript types for the coaching app
// These types are used by both web and mobile frontends

export interface User {
  id: number;
  name: string;
  email: string;
  profilePicture?: string;
}

export interface Coach extends User {
  bio?: string;
  specialization?: string;
  subscriptionTier?: SubscriptionTier;
}

export interface Adherent extends User {
  dateOfBirth?: string;
  gender?: string;
  height?: number;
}

export interface SubscriptionTier {
  id: number;
  name: 'Starter' | 'Pro' | 'Premium';
  maxClients?: number;
  monthlyPrice: number;
  features: string;
}

export interface Program {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  status: 'Active' | 'Completed' | 'Cancelled';
}

export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  senderType: 'Coach' | 'Adherent';
  messageText: string;
  isRead: boolean;
  sentAt: string;
  readAt?: string;
}

export interface Conversation {
  id: number;
  coachClientId: number;
  lastMessageAt?: string;
  messages?: Message[];
}

export interface ProgressReport {
  id: number;
  programId: number;
  adherentId: number;
  reportDate: string;
  currentWeight?: number;
  notes?: string;
  photos?: ProgressPhoto[];
}

export interface ProgressPhoto {
  id: number;
  photoUrl: string;
  photoType: 'Front' | 'Side' | 'Back';
  uploadedAt: string;
}

export interface WorkoutSession {
  id: number;
  title: string;
  description?: string;
  isCompleted: boolean;
  exercises?: Exercise[];
}

export interface Exercise {
  id: number;
  exerciseName: string;
  sets?: number;
  reps?: number;
  weightKg?: number;
  isCompleted: boolean;
}

export interface MealPlan {
  id: number;
  caloriesTarget: number;
  proteinGrams?: number;
  carbsGrams?: number;
  fatGrams?: number;
  meals?: Meal[];
}

export interface Meal {
  id: number;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  description?: string;
  calories?: number;
  isCompleted: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Coach | Adherent;
  userType: 'Coach' | 'Adherent';
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  userType: 'Coach' | 'Adherent';
}
