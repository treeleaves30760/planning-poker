export interface ScoreConfig {
  uncertainty: {
    low: number;
    mid: number;
    high: number;
  };
  complexity: {
    low: number;
    mid: number;
    high: number;
  };
  effort: {
    low: number;
    mid: number;
    high: number;
  };
}

export interface User {
  id: string;
  username: string;
  isAdmin: boolean;
}

export interface Vote {
  userId: string;
  username: string;
  uncertainty: 'low' | 'mid' | 'high';
  complexity: 'low' | 'mid' | 'high';
  effort: 'low' | 'mid' | 'high';
  totalScore: number;
}

export interface Task {
  id: string;
  description: string;
  votes: Vote[];
  revealed: boolean;
  allowChanges: boolean;
}

export interface Game {
  id: string;
  name: string;
  adminId: string;
  scoreConfig: ScoreConfig;
  users: User[];
  currentTask: Task | null;
  tasks: Task[];
  isActive: boolean;
  createdAt: Date;
}