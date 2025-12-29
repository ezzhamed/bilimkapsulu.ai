
export type TopicCategory =
  | 'Yapay Zeka'
  | 'Tıp'
  | 'Ekonomi'
  | 'Fizik'
  | 'Psikoloji'
  | 'Mühendislik'
  | 'Biyoloji'
  | 'Tarih'
  | 'Kimya'
  | 'Matematik'
  | 'Sosyoloji'
  | 'Felsefe'
  | 'Edebiyat'
  | 'Hukuk'
  | 'Siyaset Bilimi'
  | 'Astronomi'
  | 'Mimarlık'
  | 'Eğitim Bilimleri'
  | 'Çevre Bilimi'
  | 'Sanat Tarihi';

export interface Paper {
  id: string;
  title: string;
  originalTitle: string;
  authors: string[];
  university: string;
  publicationYear: number;
  journal: string;
  language: 'Türkçe (Çeviri)';
  abstract: string;
  documentType: 'PROJECT' | 'ARTICLE';
  keywords: string[];
  category: TopicCategory;
  pdfUrl?: string;
  doi?: string;
  citations: number;
  isOpenAccess?: boolean;
  readTimeMinutes: number;
  isWeeklySelection?: boolean;
  figures: string[];
  isExternal?: boolean;
}

export interface Comment {
  id: string;
  user: string;
  avatarUrl: string;
  content: string;
  timestamp: string;
  highlightedText?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum TabState {
  CHAT = 'CHAT',
  DISCUSSIONS = 'DISCUSSIONS',
  INFO = 'INFO'
}

// ==========================================
// Advanced Features Types
// ==========================================

// Personal Note for a paper
export interface PaperNote {
  id: string;
  paperId: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

// Text Highlight in a paper
export interface PaperHighlight {
  id: string;
  paperId: string;
  text: string;
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple';
  startOffset: number;
  endOffset: number;
  createdAt: number;
}

// Reading Session for tracking
export interface ReadingSession {
  id: string;
  paperId: string;
  paperTitle: string;
  category: TopicCategory;
  startTime: number;
  endTime: number;
  duration: number; // in seconds
  scrollPercentage: number;
  completed: boolean; // true if scrolled to 80%+
}

// Saved Paper for offline reading
export interface SavedPaper {
  id: string;
  paper: Paper;
  savedAt: number;
  notes: PaperNote[];
  highlights: PaperHighlight[];
  lastReadAt?: number;
  readingProgress: number; // 0-100
}

// Reading Statistics
export interface ReadingStats {
  totalPapersRead: number;
  totalReadingTime: number; // in seconds
  averageReadingTime: number;
  currentStreak: number; // consecutive days
  longestStreak: number;
  categoryBreakdown: Record<TopicCategory, number>;
  weeklyData: WeeklyReadingData[];
  monthlyData: MonthlyReadingData[];
}

export interface WeeklyReadingData {
  weekStart: string; // ISO date string
  papersRead: number;
  totalMinutes: number;
}

export interface MonthlyReadingData {
  month: string; // YYYY-MM
  papersRead: number;
  totalMinutes: number;
  topCategory: TopicCategory;
}

export interface DailyReadingData {
  date: string; // YYYY-MM-DD
  papersRead: number;
  minutes: number;
}
