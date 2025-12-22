export interface ScoreConfig {
	// Legacy format for backward compatibility
	uncertainty?: {
		low: number;
		mid: number;
		high: number;
	};
	complexity?: {
		low: number;
		mid: number;
		high: number;
	};
	effort?: {
		low: number;
		mid: number;
		high: number;
	};
	// New combination-based scoring system
	combinations?: {
		[key: string]: number; // Key format: "uncertainty-complexity-effort" (e.g., "low-mid-high")
	};
}

export type UserStatus = "active" | "away";

export interface User {
	id: string;
	username: string;
	isAdmin: boolean;
	status?: UserStatus; // active = online, away = temporarily disconnected
}

export interface Vote {
	userId: string;
	username: string;
	uncertainty: "low" | "mid" | "high";
	complexity: "low" | "mid" | "high";
	effort: "low" | "mid" | "high";
	totalScore: number;
}

export interface Task {
	id: string;
	description: string;
	votes: Vote[];
	revealed: boolean;
	allowChanges: boolean;
	completedAt?: Date;
	finalScore?: number;
}

export interface Game {
	id: string;
	name: string;
	adminId: string;
	adminPassword: string;
	scoreConfig: ScoreConfig;
	users: User[];
	currentTask: Task | null;
	tasks: Task[];
	completedTasks: Task[];
	taskQueue: Task[];
	isActive: boolean;
	createdAt: Date;
}
