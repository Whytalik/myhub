export type TrackingType = "weight_reps" | "bodyweight" | "duration" | "cardio";

export interface ExerciseData {
  id: string;
  userId: string;
  name: string;
  muscleGroup: string | null;
  equipment: string | null;
  trackingType: TrackingType;
  notes: string | null;
  explanation: string | null;
  technique: string | null;
  videoUrl: string | null;
  scientificInsight: string | null;
  progression: string | null;
  archived: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertExerciseInput {
  id?: string;
  name: string;
  muscleGroup?: string | null;
  equipment?: string | null;
  trackingType?: TrackingType;
  notes?: string | null;
  explanation?: string | null;
  technique?: string | null;
  videoUrl?: string | null;
  scientificInsight?: string | null;
  progression?: string | null;
  archived?: boolean;
  order?: number;
}

export interface TrainingDayExerciseData {
  id: string;
  userId: string;
  dayId: string;
  exerciseId: string;
  order: number;
  sets: number;
  targetReps: number | null;
  targetWeight: number | null;
  targetRpe: number | null;
  targetRir: number | null;
  restSeconds: number | null;
  targetDurationSeconds: number | null;
  targetDistanceMeters: number | null;
  notes: string | null;
  exercise: ExerciseData;
}

export interface UpsertDayExerciseInput {
  id?: string;
  dayId: string;
  exerciseId: string;
  order?: number;
  sets?: number;
  targetReps?: number | null;
  targetWeight?: number | null;
  targetRpe?: number | null;
  targetRir?: number | null;
  restSeconds?: number | null;
  targetDurationSeconds?: number | null;
  targetDistanceMeters?: number | null;
  notes?: string | null;
}

export interface TrainingDayData {
  id: string;
  userId: string;
  planId: string;
  name: string;
  notes: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  exercises: TrainingDayExerciseData[];
}

export interface UpsertTrainingDayInput {
  id?: string;
  planId: string;
  name: string;
  notes?: string | null;
  order?: number;
}

export interface TrainingPlanData {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  archived: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  days: TrainingDayData[];
}

export interface UpsertTrainingPlanInput {
  id?: string;
  name: string;
  description?: string | null;
  archived?: boolean;
  order?: number;
}

export interface SetLogData {
  id: string;
  userId: string;
  sessionId: string;
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  reps: number | null;
  weight: number | null;
  rpe: number | null;
  rir: number | null;
  restSeconds: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
  completed: boolean;
  isWarmup: boolean;
  skipped: boolean;
  skipReason: string | null;
  notes: string | null;
  order: number;
}

export interface UpdateSetLogInput {
  id: string;
  reps?: number | null;
  weight?: number | null;
  rpe?: number | null;
  rir?: number | null;
  restSeconds?: number | null;
  durationSeconds?: number | null;
  distanceMeters?: number | null;
  completed?: boolean;
  isWarmup?: boolean;
  notes?: string | null;
}

export type TrainingSessionStatus = "in_progress" | "completed";

export interface TrainingSessionData {
  id: string;
  userId: string;
  dayId: string | null;
  dayName: string;
  date: Date;
  status: TrainingSessionStatus;
  durationSeconds: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  setLogs: SetLogData[];
}

export interface TrainingSessionSummaryData {
  id: string;
  userId: string;
  dayId: string | null;
  dayName: string;
  date: Date;
  status: TrainingSessionStatus;
  durationSeconds: number | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: { setLogs: number };
}

export interface StartSessionInput {
  dayId: string;
}

export interface CompleteSessionInput {
  id: string;
  durationSeconds?: number | null;
  notes?: string | null;
}
