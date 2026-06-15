export type CategoryKey =
  | 'phishing'
  | 'fake_shopping'
  | 'investment_scams'
  | 'social_engineering'
  | 'otp_scams'
  | 'ai_scams'
  | 'romance_scams'
  | 'data_harvesting'
  | 'smishing'
  | 'other';

export type Difficulty = 'beginner' | 'popular' | 'advanced';

export interface User {
  id: string;
  username: string;
  email: string;
  totalXP: number;
  xp?: number;
  levelXPGoal?: number;
  level: number;
  rank: string;
  dayStreak: number;
  weekStreak: number;
  badges: string[];
  avatar: string;
  completedModules?: string[];
  quizzesCompleted: number;
  accuracy: number;
}

export interface LearningModule {
  _id: string;
  title: string;
  category: CategoryKey;
  difficulty: Difficulty;
  icon: string;
  description?: string;
  completionXP: number;
  percentComplete?: number;
  attempts?: number;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  scenarioType: string;
  scenarioTitle?: string;
  scenarioSubtitle?: string;
  message?: {
    from: string;
    to: string;
    brand: string;
    body: string;
    cta: string;
  };
  options: string[];
  xpReward: number;
  correctIndex?: number;
  explanation?: string;
}

export interface Mission {
  id: string;
  label: string;
  target: number;
  progress: number;
  xp: number;
  complete?: boolean;
}

export interface LeaderboardEntry {
  id: string;
  rankNumber: number;
  username: string;
  avatar: string;
  totalXP: number;
  level: number;
  rank: string;
}

export interface BattleEnemy {
  id: string;
  name: string;
  title: string;
  image: string;
  weakness: string;
  maxHP: number;
}

export interface Flashcard {
  id: string;
  category: CategoryKey;
  front: string;
  back: string;
  hint: string;
}
