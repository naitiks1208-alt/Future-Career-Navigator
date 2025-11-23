
export interface Career {
  id: string;
  title: string;
  industry: string;
  description: string;
  salaryRange: string;
  education: string;
  growthScore: number; // 0-100
  tags: string[];
  skills: string[];
  subjects: string[];
  tools: string[];
  personalityType: string;
  famousPeople: string[];
  imageUrl: string;
}

export interface QuizResult {
  topClusters: string[];
  strength: string;
  learningStyle: string;
  confidenceScore: number;
  recommendedCareers: string[]; // IDs
  recommendedStream: string;
  personalityDescription?: string; // Added for detailed aptitude description
  skillProfile?: {
    Communication: number;
    Creativity: number;
    Coding: number;
    Logic: number;
    Leadership: number;
    Collaboration: number;
  };
}

export interface UserProfile {
  name: string;
  grade: string;
  interests: string[];
  completedQuiz: boolean;
  quizResult?: QuizResult;
  savedCareers: string[];
  skillProgress: {
    Communication: number;
    Creativity: number;
    Coding: number;
    Logic: number;
    Leadership: number;
    Collaboration: number;
  };
  achievements: string[];
}

export interface Scholarship {
  id: string;
  name: string;
  category: 'Central' | 'State' | 'Private' | 'Exam'; 
  country: string; 
  amount: string;
  deadline: string;
  eligibility: string;
  link: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface ProjectIdea {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  careerId: string;
}

// Enum for Views
export enum AppView {
  DASHBOARD = 'DASHBOARD',
  QUIZ = 'QUIZ',
  LIBRARY = 'LIBRARY',
  PATHWAY = 'PATHWAY',
  CHAT = 'CHAT',
  SKILLS = 'SKILLS',
  SCHOLARSHIPS = 'SCHOLARSHIPS',
  PORTFOLIO = 'PORTFOLIO',
  ADMIN = 'ADMIN'
}
