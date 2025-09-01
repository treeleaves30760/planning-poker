import Database from "better-sqlite3";
import path from "path";
import { Game } from "@/types/game";

const DB_PATH = path.join(process.cwd(), "data", "games.db");
let db: Database.Database | null = null;

export function getDb(): Database.Database {
	if (!db) {
		db = new Database(DB_PATH);
		db.pragma("journal_mode = WAL");
		initializeSchema(db);
	}
	return db;
}

function initializeSchema(database: Database.Database) {
	// Games table
	database.exec(`
    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      admin_id TEXT NOT NULL,
      admin_password TEXT NOT NULL,
      score_config TEXT NOT NULL,
      current_task TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

	// Users table - tracks active connections
	database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT NOT NULL,
      game_id TEXT NOT NULL,
      username TEXT NOT NULL,
      is_admin BOOLEAN DEFAULT 0,
      last_heartbeat DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id, game_id),
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `);

	// Tasks table
	database.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      game_id TEXT NOT NULL,
      description TEXT NOT NULL,
      votes TEXT DEFAULT '[]',
      revealed BOOLEAN DEFAULT 0,
      allow_changes BOOLEAN DEFAULT 0,
      completed_at DATETIME,
      final_score REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `);

	// Create indexes for performance
	database.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_game_id ON users(game_id);
    CREATE INDEX IF NOT EXISTS idx_users_heartbeat ON users(last_heartbeat);
    CREATE INDEX IF NOT EXISTS idx_tasks_game_id ON tasks(game_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed_at);
  `);

	// Create task_queue table for storing imported tasks
	database.exec(`
    CREATE TABLE IF NOT EXISTS task_queue (
      id TEXT PRIMARY KEY,
      game_id TEXT NOT NULL,
      description TEXT NOT NULL,
      queue_position INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE
    )
  `);

	// Create index for task_queue
	database.exec(`
    CREATE INDEX IF NOT EXISTS idx_task_queue_game_id ON task_queue(game_id);
    CREATE INDEX IF NOT EXISTS idx_task_queue_position ON task_queue(queue_position);
  `);

	// Migration: Add final_score column if it doesn't exist
	try {
		database.exec(`ALTER TABLE tasks ADD COLUMN final_score REAL`);
	} catch {
		// Column already exists, ignore error
	}
}

export interface UserConnection {
	id: string;
	gameId: string;
	username: string;
	isAdmin: boolean;
	lastHeartbeat: Date;
}

export class DatabaseManager {
	private db: Database.Database;

	constructor() {
		this.db = getDb();
	}

	// Game operations
	createGame(game: Game): boolean {
		const transaction = this.db.transaction(() => {
			const stmt = this.db.prepare(`
        INSERT INTO games (id, name, admin_id, admin_password, score_config, current_task, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

			stmt.run(
				game.id,
				game.name,
				game.adminId,
				game.adminPassword,
				JSON.stringify(game.scoreConfig),
				game.currentTask ? JSON.stringify(game.currentTask) : null,
				game.isActive ? 1 : 0,
				game.createdAt instanceof Date
					? game.createdAt.toISOString()
					: new Date(game.createdAt).toISOString()
			);

			// Initialize empty task queue
			const insertQueueStmt = this.db.prepare(`
        INSERT INTO task_queue (id, game_id, description, queue_position)
        VALUES (?, ?, ?, ?)
      `);

			for (let i = 0; i < (game.taskQueue || []).length; i++) {
				const task = game.taskQueue[i];
				insertQueueStmt.run(task.id, game.id, task.description, i);
			}
		});

		try {
			transaction();
			return true;
		} catch (error) {
			console.error("Error creating game:", error);
			return false;
		}
	}

	getGame(gameId: string): Game | null {
		const gameStmt = this.db.prepare("SELECT * FROM games WHERE id = ?");
		const gameRow = gameStmt.get(gameId) as
			| {
					id: string;
					name: string;
					admin_id: string;
					admin_password: string;
					score_config: string;
					current_task: string | null;
					is_active: number;
					created_at: string;
			  }
			| undefined;

		if (!gameRow) return null;

		// Get active users (heartbeat within last 30 seconds)
		const usersStmt = this.db.prepare(`
      SELECT * FROM users 
      WHERE game_id = ? AND datetime(last_heartbeat) > datetime('now', '-30 seconds')
    `);
		const userRows = usersStmt.all(gameId) as {
			id: string;
			game_id: string;
			username: string;
			is_admin: number;
			last_heartbeat: string;
		}[];

		// Get tasks
		const tasksStmt = this.db.prepare(`
      SELECT * FROM tasks 
      WHERE game_id = ? AND completed_at IS NULL 
      ORDER BY created_at DESC
    `);
		const taskRows = tasksStmt.all(gameId) as {
			id: string;
			game_id: string;
			description: string;
			votes: string;
			revealed: number;
			allow_changes: number;
			completed_at: string | null;
			final_score: number | null;
			created_at: string;
		}[];

		// Get completed tasks
		const completedTasksStmt = this.db.prepare(`
      SELECT * FROM tasks 
      WHERE game_id = ? AND completed_at IS NOT NULL 
      ORDER BY completed_at DESC
    `);
		const completedTaskRows = completedTasksStmt.all(gameId) as {
			id: string;
			game_id: string;
			description: string;
			votes: string;
			revealed: number;
			allow_changes: number;
			completed_at: string | null;
			final_score: number | null;
			created_at: string;
		}[];

		// Get task queue
		const taskQueueStmt = this.db.prepare(`
      SELECT * FROM task_queue 
      WHERE game_id = ? 
      ORDER BY queue_position ASC, created_at ASC
    `);
		const taskQueueRows = taskQueueStmt.all(gameId) as {
			id: string;
			game_id: string;
			description: string;
			queue_position: number;
			created_at: string;
		}[];

		const game: Game = {
			id: gameRow.id,
			name: gameRow.name,
			adminId: gameRow.admin_id,
			adminPassword: gameRow.admin_password,
			scoreConfig: JSON.parse(gameRow.score_config),
			currentTask: gameRow.current_task
				? JSON.parse(gameRow.current_task)
				: null,
			users: userRows.map((row) => ({
				id: row.id,
				username: row.username,
				isAdmin: row.is_admin === 1,
			})),
			tasks: taskRows.map((row) => ({
				id: row.id,
				description: row.description,
				votes: JSON.parse(row.votes || "[]"),
				revealed: row.revealed === 1,
				allowChanges: row.allow_changes === 1,
				completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
				finalScore: row.final_score || undefined,
			})),
			completedTasks: completedTaskRows.map((row) => ({
				id: row.id,
				description: row.description,
				votes: JSON.parse(row.votes || "[]"),
				revealed: row.revealed === 1,
				allowChanges: row.allow_changes === 1,
				completedAt: row.completed_at ? new Date(row.completed_at) : new Date(),
				finalScore: row.final_score || undefined,
			})),
			taskQueue: taskQueueRows.map((row) => ({
				id: row.id,
				description: row.description,
				votes: [],
				revealed: false,
				allowChanges: false,
			})),
			isActive: gameRow.is_active === 1,
			createdAt: new Date(gameRow.created_at),
		};

		return game;
	}

	updateGame(game: Game): boolean {
		const transaction = this.db.transaction(() => {
			// Update game
			const gameStmt = this.db.prepare(`
        UPDATE games 
        SET name = ?, admin_id = ?, admin_password = ?, score_config = ?, 
            current_task = ?, is_active = ?
        WHERE id = ?
      `);

			gameStmt.run(
				game.name,
				game.adminId,
				game.adminPassword,
				JSON.stringify(game.scoreConfig),
				game.currentTask ? JSON.stringify(game.currentTask) : null,
				game.isActive ? 1 : 0,
				game.id
			);

			// Update or insert tasks
			const upsertTaskStmt = this.db.prepare(`
        INSERT OR REPLACE INTO tasks 
        (id, game_id, description, votes, revealed, allow_changes, completed_at, final_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

			// Handle regular tasks
			for (const task of game.tasks) {
				upsertTaskStmt.run(
					task.id,
					game.id,
					task.description,
					JSON.stringify(task.votes),
					task.revealed ? 1 : 0,
					task.allowChanges ? 1 : 0,
					task.completedAt
						? task.completedAt instanceof Date
							? task.completedAt.toISOString()
							: new Date(task.completedAt).toISOString()
						: null,
					task.finalScore || null
				);
			}

			// Handle completed tasks
			for (const task of game.completedTasks || []) {
				upsertTaskStmt.run(
					task.id,
					game.id,
					task.description,
					JSON.stringify(task.votes),
					task.revealed ? 1 : 0,
					task.allowChanges ? 1 : 0,
					task.completedAt
						? task.completedAt instanceof Date
							? task.completedAt.toISOString()
							: new Date(task.completedAt).toISOString()
						: null,
					task.finalScore || null
				);
			}

			// Handle task queue - first clear existing queue for this game
			const clearQueueStmt = this.db.prepare(
				`DELETE FROM task_queue WHERE game_id = ?`
			);
			clearQueueStmt.run(game.id);

			// Insert new queue items
			const insertQueueStmt = this.db.prepare(`
        INSERT INTO task_queue (id, game_id, description, queue_position)
        VALUES (?, ?, ?, ?)
      `);

			for (let i = 0; i < (game.taskQueue || []).length; i++) {
				const task = game.taskQueue[i];
				insertQueueStmt.run(task.id, game.id, task.description, i);
			}
		});

		try {
			transaction();
			return true;
		} catch (error) {
			console.error("Error updating game:", error);
			return false;
		}
	}

	// User connection operations
	updateUserHeartbeat(
		userId: string,
		gameId: string,
		username: string,
		isAdmin: boolean = false
	): boolean {
		const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO users (id, game_id, username, is_admin, last_heartbeat)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

		try {
			stmt.run(userId, gameId, username, isAdmin ? 1 : 0);
			return true;
		} catch (error) {
			console.error("Error updating user heartbeat:", error);
			return false;
		}
	}

	removeUser(userId: string, gameId: string): boolean {
		const stmt = this.db.prepare(
			"DELETE FROM users WHERE id = ? AND game_id = ?"
		);

		try {
			stmt.run(userId, gameId);
			return true;
		} catch (error) {
			console.error("Error removing user:", error);
			return false;
		}
	}

	getActiveUsers(gameId: string): UserConnection[] {
		const stmt = this.db.prepare(`
      SELECT * FROM users 
      WHERE game_id = ? AND datetime(last_heartbeat) > datetime('now', '-30 seconds')
      ORDER BY username
    `);

		const rows = stmt.all(gameId) as {
			id: string;
			game_id: string;
			username: string;
			is_admin: number;
			last_heartbeat: string;
		}[];
		return rows.map((row) => ({
			id: row.id,
			gameId: row.game_id,
			username: row.username,
			isAdmin: row.is_admin === 1,
			lastHeartbeat: new Date(row.last_heartbeat),
		}));
	}

	getActivePlayersCount(gameId: string): number {
		const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM users 
      WHERE game_id = ? 
        AND datetime(last_heartbeat) > datetime('now', '-30 seconds')
        AND is_admin = 0
    `);

		const result = stmt.get(gameId) as { count: number };
		return result.count;
	}

	cleanupInactiveUsers(): number {
		const stmt = this.db.prepare(`
      DELETE FROM users 
      WHERE datetime(last_heartbeat) < datetime('now', '-60 seconds')
    `);

		try {
			const result = stmt.run();
			return result.changes;
		} catch (error) {
			console.error("Error cleaning up inactive users:", error);
			return 0;
		}
	}

	close(): void {
		if (this.db) {
			this.db.close();
		}
	}
}

// Export singleton instance
export const dbManager = new DatabaseManager();
