<<<<<<< HEAD
=======

>>>>>>> c69ff7959d130581df48d7160275444f9cabdc03
export interface Slide {
  title: string;
  bulletPoints: string[];
  teacherNotes: string;
  suggestedActivity: string;
  imageDescription: string;
<<<<<<< HEAD
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
=======
  base64Image?: string; // For the AI generated image
  practicalExample?: { // New field for "Show by solving"
    problem: string;
    solutionSteps: string[];
    base64Image?: string; // Specific visual for the example
  };
  customElements?: DraggableElement[]; // New field for drag-and-drop items
  imageCaption?: string; // Teacher's custom text under the image
>>>>>>> c69ff7959d130581df48d7160275444f9cabdc03
}

export type ElementType = 'text' | 'image' | 'sticker' | 'chart' | 'link' | 'video';

export interface DraggableElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
<<<<<<< HEAD
  content: string;
  color?: string;
=======
  content: string; // Text content or image URL or sticker name
  color?: string; // For stickers/shapes
>>>>>>> c69ff7959d130581df48d7160275444f9cabdc03
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

<<<<<<< HEAD
export type PresentationTheme = 'classic' | 'chalkboard' | 'playful' | 'nature';
export type LessonStructure = 'standard' | 'lecture' | 'workshop';

export interface LessonPlan {
  id: string;
  createdAt: string;
=======
export interface LessonPlan {
  id: string;
  createdAt: string; // ISO Date string
>>>>>>> c69ff7959d130581df48d7160275444f9cabdc03
  topic: string;
  gradeLevel: string;
  province: string;
  subject: string;
<<<<<<< HEAD
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
=======
  learningObjectives: string[];
  curriculumExpectations: string; // Specific curriculum links
  slides: Slide[];
  activities: Activity[]; // Class activity ideas
  worksheetMarkdown: string; // Printable worksheet content
  answerSheetMarkdown?: string; // Teacher Answer Key
  quiz: QuizQuestion[];
>>>>>>> c69ff7959d130581df48d7160275444f9cabdc03
}

export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  subject?: string;
  grade?: string;
<<<<<<< HEAD
  role: 'teaching' | 'non-teaching';
=======
>>>>>>> c69ff7959d130581df48d7160275444f9cabdc03
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

<<<<<<< HEAD
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
  status: 'active' | 'trial' | 'cancelled' | 'expired';
  planId: PlanId;
=======
// --- USER & SUBSCRIPTION TYPES ---

export type UserType = 'teacher' | 'school';

export interface SubscriptionDetails {
  status: 'active' | 'trial' | 'cancelled' | 'expired';
  planId: string; // 'elite'
>>>>>>> c69ff7959d130581df48d7160275444f9cabdc03
  interval: 'month' | 'year';
  amount: number;
  startDate: string;
  nextBillingDate: string;
  trialEndDate?: string;
  paymentMethod?: {
    brand: string;
    last4: string;
  };
<<<<<<< HEAD
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
=======
}

export interface UserProfile {
  name: string;
  type: UserType;
  email: string;
  subscription?: SubscriptionDetails;
}

// --- NEW GAME TYPES ---

export interface SortingGameData {
  categories: [string, string]; // e.g. ["Magnetic", "Non-Magnetic"]
>>>>>>> c69ff7959d130581df48d7160275444f9cabdc03
  items: { id: string; text: string; categoryIndex: number }[];
}

export interface StoryGameData {
  title: string;
<<<<<<< HEAD
  template: string;
  placeholders: { key: string; label: string }[];
}

export interface MemoryGameData {
  pairs: { id: string; item1: string; item2: string }[];
=======
  template: string; // Story text with placeholders like {0}, {1}
  placeholders: { key: string; label: string }[]; // e.g. { key: "{0}", label: "Adjective" }
}

export interface MemoryGameData {
  pairs: { id: string; item1: string; item2: string }[]; // e.g. "Chien" - "Dog"
>>>>>>> c69ff7959d130581df48d7160275444f9cabdc03
}

export interface MathBananaRound {
  target: number;
<<<<<<< HEAD
  targetDescription: string;
=======
  targetDescription: string; // e.g. "Sums of 10"
>>>>>>> c69ff7959d130581df48d7160275444f9cabdc03
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
<<<<<<< HEAD
  slideCount: number;
  theme: PresentationTheme;
  structure: LessonStructure;
=======
  slideCount: number; // Added field
>>>>>>> c69ff7959d130581df48d7160275444f9cabdc03
}

// --- WORKSHEET MAKER TYPES ---

<<<<<<< HEAD
export type WorksheetStyle = 'standard' | 'vocabulary' | 'critical_thinking' | 'math_drill' | 'math_structured_questions' | 'mcq';
=======
export type WorksheetStyle = 'standard' | 'vocabulary' | 'critical_thinking' | 'math_drill';
>>>>>>> c69ff7959d130581df48d7160275444f9cabdc03

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
<<<<<<< HEAD
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

export type WeeklyPlanData = Record<string, WeeklyPlanSlot[]>;
=======
  color?: string; // Hex code or Tailwind class reference
  presentationId?: string; // ID of the linked LessonPlan
  externalUrl?: string; // Link to external resources
  smartBoardData?: string; // NEW: Stores JSON string of {bg, notes} for launching SB directly
}

// Key format: "Day-Period" (e.g., "Mon-1", "Fri-4")
export type WeeklyPlanData = Record<string, PlannerEntry>;
>>>>>>> c69ff7959d130581df48d7160275444f9cabdc03
