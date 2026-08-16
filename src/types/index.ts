// Master Tile Identifiers
export type MasterTileId =
  | 'ai'
  | 'coding-dsa'
  | 'system-design'
  | 'market-updates'
  | 'open-source'
  | 'life-sutras'
  | 'health'
  | 'finance'
  | 'apply-job'
  | 'tools';

export interface MasterTileInfo {
  id: MasterTileId;
  title: string;
  subtitle: string;
  iconName: string;
  colorAccent: string;
}

export type LinkCategory = 'all' | 'social' | 'productivity' | 'ai' | 'media' | 'spiritual' | 'custom';

export interface DeepLinkItem {
  id: string;
  masterTileId?: MasterTileId;
  title: string;
  url: string;
  category: LinkCategory;
  description?: string;
  isPinned: boolean;
  orderIndex: number;
  iconType: 'favicon' | 'lucide' | 'custom';
  iconValue?: string;
  tags: string[];
  badge?: string;
  accentColor?: string;
  clickCount: number;
  lastVisited?: string;
  createdAt: string;
}

export type RevisionDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type RevisionCategory = 'All' | 'AI & Deep Learning' | 'System Design' | 'DSA & Algorithms' | 'Python & Backend' | 'Core CS' | 'Spiritual Wisdom';
export type MasteryStatus = 'learning' | 'reviewing' | 'mastered';

export interface RevisionFlashcardItem {
  id: string;
  masterTileId?: MasterTileId;
  category: RevisionCategory;
  question: string;
  difficulty: RevisionDifficulty;
  hint: string;
  tags: string[];
  answerSummary: string;
  answerMarkdown: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
  keyTakeaways: string[];
  masteryStatus: MasteryStatus;
  reviewCount: number;
  lastReviewed?: string;
  createdAt: string;
}

// Tree Hierarchy Node for Notes & Courses (e.g. 1., 1.1, 1.1.1)
export interface CourseTreeNode {
  id: string;
  masterTileId: MasterTileId;
  subTrack: string;        // e.g. "LLM", "Dynamic Programming", "HLD", "Quotes"
  code: string;            // e.g. "1.", "1.1", "1.1.1", "1.2", "2.", "2.1"
  title: string;           // e.g. "Attention Mechanism & Transformers"
  url: string;             // Google Docs URL or Notes Link
  notesSnippet?: string;
  createdAt: string;
}

// Activity & Click Logging Item
export interface ActivityLogItem {
  id: string;
  title: string;
  url: string;
  category: string;
  type: 'link' | 'doc_tree' | 'flashcard';
  timestamp: string;      // ISO string
  dateStr: string;        // YYYY-MM-DD
  timeStr: string;        // HH:MM:SS
}

export interface TechNewsItem {
  id: string;
  source: 'ArXiv AI' | 'Hacker News' | 'Engineering Blog' | 'Market Pulse' | 'Open Source';
  title: string;
  summary: string;
  url: string;
  tag: string;
  timestamp: string;
  readTime: string;
  impactScore: number;
}

export interface DailyVoiceEntry {
  id: string; // e.g. "voice-2026-08-16"
  dateKey: string; // "YYYY-MM-DD"
  fullDateHeading: string; // e.g. "Sunday, 16 August 2026"
  content: string; // Aggregated notes for the day
  sessionsCount: number; // Number of dictation sessions that day
  createdAt: string;
  updatedAt: string;
}

export type ThemeMode = 'obsidian' | 'midnight' | 'cyber' | 'sunset' | 'paper';

export interface DrishtiSettings {
  theme: ThemeMode;
  uiScale: number; // 80 to 125
  enable3DTilt: boolean;
  enableAnimations: boolean;
  dailyGoalFocusMinutes: number;
}
