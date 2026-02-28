
export interface Slide {
  title: string;
  bulletPoints: string[];
  teacherNotes: string;
  suggestedActivity: string;
  imageDescription: string;
  base64Image?: string;
  practicalExample?: {
    problem: string;
    solutionSteps: string[];
    base64Image?: string;
  };
  customElements?: DraggableElement[];
  imageCaption?: string;
  hideImage?: boolean;
  personalNotes?: string;
}

export type ElementType = 'text' | 'image' | 'sticker' | 'chart' | 'link' | 'video';

export interface DraggableElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  content: string;
  color?: string;
  scale?: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface GameQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface Activity {
  title: string;
  description: string;
  duration: string;
  materials: string[];
}

export type PresentationTheme = 'classic' | 'chalkboard' | 'playful' | 'nature';
export type LessonStructure = 'standard' | 'lecture' | 'workshop';

export interface DailyBoardData {
  heading: string;
  learning: string;
  reminders: string;
  schedule: string;
  drawingData?: string; // Base64 of the canvas
}

export interface LessonPlan {
  id: string;
  createdAt: string;
  topic: string;
  gradeLevel: string;
  province: string;
  subject: string;
  theme: PresentationTheme;
  structure: LessonStructure;
  learningObjectives: string[];
  curriculumExpectations: string;
  slides: Slide[];
  activities: Activity[];
  worksheetMarkdown?: string;
  answerSheetMarkdown?: string;
  quiz: QuizQuestion[];
  isWorksheet?: boolean;
  isDailyBoard?: boolean;
  boardData?: DailyBoardData;
}

export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  subject?: string;
  grade?: string;
  role: 'teaching' | 'non-teaching';
  status: 'active' | 'pending';
  joinedDate: string;
  lessonsCreated: number;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
}

export interface TeacherBookmark {
  id: string;
  title: string;
  url: string;
  dateAdded: string;
}

export type AnnouncementAudience = 'all' | 'teaching' | 'non-teaching' | 'selected';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
  author: string;
  targetAudience: AnnouncementAudience;
  targetTeacherIds?: string[];
}

// --- USER & SUBSCRIPTION TYPES ---

export type UserType = 'teacher' | 'school' | 'admin';

export type PlanId = 'starter' | 'pro' | 'school';

export interface SubscriptionDetails {
  status: 'active' | 'trial' | 'trialing' | 'cancelled' | 'expired';
  planId: PlanId;
  interval: 'month' | 'year';
  amount: number;
  startDate: string;
  nextBillingDate: string;
  trialEndDate?: string;
  paymentMethod?: {
    brand: string;
    last4: string;
  };
  imagesUsedThisMonth: number;
  imageLimit: number;
}

export interface UserProfile {
  id: string;
  name: string;
  type: UserType;
  email: string;
  role?: 'teaching' | 'non-teaching';
  subscription?: SubscriptionDetails;
}

// --- ADMIN SPECIFIC TYPES ---

export type FeedbackType = 'bug' | 'feature' | 'praise' | 'support' | 'billing';

export interface SystemFeedback {
  id: string;
  userName: string;
  userEmail: string;
  type: FeedbackType;
  content: string;
  status: 'open' | 'resolved';
  date: string;
  priority: 'low' | 'medium' | 'high';
  subject?: string;
}

export interface PlatformStats {
  totalRevenue: number;
  mrr: number;
  activeSchools: number;
  activeTeachers: number;
  totalLessonsGenerated: number;
  aiImagesGenerated: number;
}

// --- NEW GAME TYPES ---

export interface SortingGameData {
  categories: [string, string];
  items: { id: string; text: string; categoryIndex: number }[];
}

export interface StoryGameData {
  title: string;
  template: string;
  placeholders: { key: string; label: string }[];
}

export interface MemoryGameData {
  pairs: { id: string; item1: string; item2: string }[];
}

export interface MathBananaRound {
  target: number;
  targetDescription: string;
  bananas: { content: string; value: number; isCorrect: boolean }[];
}

export enum GradeLevel {
  K = "Kindergarten",
  G1 = "Grade 1",
  G2 = "Grade 2",
  G3 = "Grade 3",
  G4 = "Grade 4",
  G5 = "Grade 5",
  G6 = "Grade 6",
  G7 = "Grade 7",
  G8 = "Grade 8",
}

export enum Province {
  AB = "Alberta",
  BC = "British Columbia",
  MB = "Manitoba",
  NB = "New Brunswick",
  NL = "Newfoundland and Labrador",
  NS = "Nova Scotia",
  ON = "Ontario",
  PE = "Prince Edward Island",
  QC = "Quebec",
  SK = "Saskatchewan",
  NT = "Northwest Territories",
  NU = "Nunavut",
  YT = "Yukon",
}

export enum Subject {
  Math = "Mathematics",
  Science = "Science & Tech",
  Social = "Social Studies",
  Language = "Language / English",
  Health = "Health & PE",
  Arts = "The Arts",
  French = "French / FSL",
  Music = "Music"
}

export interface GenerationParams {
  topic: string;
  grade: GradeLevel;
  province: Province;
  subject: Subject;
  slideCount: number;
  theme: PresentationTheme;
  structure: LessonStructure;
}

// --- WORKSHEET MAKER TYPES ---

export type WorksheetStyle = 'standard' | 'vocabulary' | 'critical_thinking' | 'math_drill' | 'math_structured_questions' | 'mcq';

export interface GeneratedWorksheet {
  topic: string;
  style: WorksheetStyle;
  studentMarkdown: string;
  teacherMarkdown: string;
}

// --- WEEKLY PLANNER TYPES ---

export interface PlannerEntry {
  subject: string;
  notes: string;
  color?: string;
  presentationId?: string;
  externalUrl?: string;
  smartBoardData?: string;
}

export interface WeeklyPlanSlot extends PlannerEntry {
  id: string;
  day: string;
  time: string;
}

export interface DailyActivity {
  id: string;
  type: 'activity' | 'break';
  name: string;
  duration: number; // in minutes
}

export type WeeklyPlanData = Record<string, WeeklyPlanSlot[]>;
