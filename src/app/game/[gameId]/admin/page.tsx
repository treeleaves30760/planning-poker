"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Task } from "@/types/game";
import { useGameState } from "@/hooks/useGameState";
import { useSocket } from "@/hooks/useSocket";
import TaskImport from "@/components/admin/TaskImport";
import TaskQueue from "@/components/admin/TaskQueue";
import AdminAuthForm from "@/components/game/AdminAuthForm";
import GameHeader from "@/components/game/GameHeader";
import AddTaskCard from "@/components/game/AddTaskCard";
import ActivePlayersCard from "@/components/game/ActivePlayersCard";
import VotingResultsTable from "@/components/game/VotingResultsTable";
import TaskHistoryCard from "@/components/game/TaskHistoryCard";

export default function AdminGamePage() {
	const params = useParams();
	const gameId = params.gameId as string;
	const { game, isLoading, error, loadGame, saveGame } = useGameState(gameId);
	const [taskDescription, setTaskDescription] = useState("");
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [password, setPassword] = useState("");
	const [authError, setAuthError] = useState("");
	const [taskOperationLoading, setTaskOperationLoading] = useState(false);

	// Get admin user ID for WebSocket
	const [adminUserId, setAdminUserId] = useState<string>("");

	useEffect(() => {
		// Generate or retrieve admin user ID
		let storedAdminId = sessionStorage.getItem(`admin-user-id-${gameId}`);
		if (!storedAdminId) {
			storedAdminId = `admin-${Math.random().toString(36).substring(2, 11)}`;
			sessionStorage.setItem(`admin-user-id-${gameId}`, storedAdminId);
		}
		setAdminUserId(storedAdminId);
	}, [gameId]);

	// Socket.io connection for real-time updates
	const { isConnected, activeUsers, notifyGameUpdate } = useSocket({
		gameId,
		userId: adminUserId,
		username: "Admin",
		isAdmin: true,
		onUserJoined: useCallback(() => loadGame(), [loadGame]),
		onUserLeft: useCallback(() => loadGame(), [loadGame]),
		onGameStateChanged: useCallback(() => loadGame(), [loadGame]),
		onConnect: useCallback(
			() => console.log("Admin connected to Socket.io"),
			[]
		),
		onDisconnect: useCallback(
			() => console.log("Admin disconnected from Socket.io"),
			[]
		),
	});

	useEffect(() => {
		if (adminUserId) {
			// Reduce polling frequency since we have WebSocket updates
			const pollInterval = isConnected ? 5000 : 2000;
			const interval = setInterval(loadGame, pollInterval);
			return () => clearInterval(interval);
		}
	}, [loadGame, adminUserId, isConnected]);

	const verifyPassword = async () => {
		if (!password.trim()) {
			setAuthError("Please enter a password");
			return;
		}

		try {
			const response = await fetch(`/api/games/${gameId}/verify-admin`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ password }),
			});

			const result = await response.json();

			if (result.valid) {
				setIsAuthenticated(true);
				setAuthError("");
				sessionStorage.setItem(`admin-auth-${gameId}`, "true");
			} else {
				setAuthError("Invalid password");
			}
		} catch (error) {
			setAuthError("Failed to verify password");
		}
	};

	useEffect(() => {
		const isStoredAuth = sessionStorage.getItem(`admin-auth-${gameId}`);
		if (isStoredAuth === "true") {
			setIsAuthenticated(true);
		}
	}, [gameId]);

	const logout = () => {
		sessionStorage.removeItem(`admin-auth-${gameId}`);
		setIsAuthenticated(false);
		setPassword("");
	};

	const addTask = async () => {
		if (!taskDescription.trim() || !game) return;

		const newTask: Task = {
			id: Math.random().toString(36).substr(2, 9),
			description: taskDescription,
			votes: [],
			revealed: false,
			allowChanges: false,
		};

		const updatedGame = {
			...game,
			currentTask: newTask,
			tasks: [...game.tasks, newTask],
		};

		await saveGame(updatedGame);
		notifyGameUpdate();
		setTaskDescription("");
	};

	const revealVotes = async () => {
		if (!game?.currentTask) return;

		const updatedTask = { ...game.currentTask, revealed: true };
		const updatedGame = {
			...game,
			currentTask: updatedTask,
			tasks: game.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
		};

		await saveGame(updatedGame);
		notifyGameUpdate();
	};

	const allowChanges = async () => {
		if (!game?.currentTask) return;

		const updatedTask = { ...game.currentTask, allowChanges: true };
		const updatedGame = {
			...game,
			currentTask: updatedTask,
			tasks: game.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
		};

		await saveGame(updatedGame);
		notifyGameUpdate();
	};

	const nextQuestion = async () => {
		if (!game || !game.currentTask) return;

		// Mark current task as completed and move to history
		const completedTask = {
			...game.currentTask,
			completedAt: new Date(),
		};

		const updatedGame = {
			...game,
			currentTask: null,
			completedTasks: [...(game.completedTasks || []), completedTask],
		};

		await saveGame(updatedGame);
		notifyGameUpdate();
		setTaskDescription("");
	};

	const setFinalScore = async (taskId: string, finalScore: number) => {
		if (!game) return;

		const updatedTasks = game.tasks.map((task) =>
			task.id === taskId ? { ...task, finalScore } : task
		);

		const updatedCompletedTasks =
			game.completedTasks?.map((task) =>
				task.id === taskId ? { ...task, finalScore } : task
			) || [];

		const updatedGame = {
			...game,
			tasks: updatedTasks,
			completedTasks: updatedCompletedTasks,
		};

		await saveGame(updatedGame);
		notifyGameUpdate();
	};

	const handleTasksImported = async (tasks: Task[]) => {
		if (!game) return;

		setTaskOperationLoading(true);
		try {
			const response = await fetch(`/api/games/${gameId}/tasks`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					action: "import",
					tasks,
				}),
			});

			const result = await response.json();
			if (result.success) {
				await loadGame();
				notifyGameUpdate();
			} else {
				console.error("Failed to import tasks:", result.error);
			}
		} catch (error) {
			console.error("Error importing tasks:", error);
		} finally {
			setTaskOperationLoading(false);
		}
	};

	const handleTaskSelect = async (task: Task) => {
		if (!game) return;

		setTaskOperationLoading(true);
		try {
			const response = await fetch(`/api/games/${gameId}/tasks`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					action: "select",
					taskId: task.id,
				}),
			});

			const result = await response.json();
			if (result.success) {
				await loadGame();
				notifyGameUpdate();
			} else {
				console.error("Failed to select task:", result.error);
			}
		} catch (error) {
			console.error("Error selecting task:", error);
		} finally {
			setTaskOperationLoading(false);
		}
	};

	const handleTaskEdit = async (taskId: string, description: string) => {
		if (!game) return;

		setTaskOperationLoading(true);
		try {
			const response = await fetch(`/api/games/${gameId}/tasks`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					action: "edit",
					taskId,
					description,
				}),
			});

			const result = await response.json();
			if (result.success) {
				await loadGame();
				notifyGameUpdate();
			} else {
				console.error("Failed to edit task:", result.error);
			}
		} catch (error) {
			console.error("Error editing task:", error);
		} finally {
			setTaskOperationLoading(false);
		}
	};

	const handleTaskDelete = async (taskId: string) => {
		if (!game) return;

		setTaskOperationLoading(true);
		try {
			const response = await fetch(`/api/games/${gameId}/tasks`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					action: "delete",
					taskId,
				}),
			});

			const result = await response.json();
			if (result.success) {
				await loadGame();
				notifyGameUpdate();
			} else {
				console.error("Failed to delete task:", result.error);
			}
		} catch (error) {
			console.error("Error deleting task:", error);
		} finally {
			setTaskOperationLoading(false);
		}
	};

	const handleTaskReorder = async (fromIndex: number, toIndex: number) => {
		if (!game) return;

		setTaskOperationLoading(true);
		try {
			const response = await fetch(`/api/games/${gameId}/tasks`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					action: "reorder",
					fromIndex,
					toIndex,
				}),
			});

			const result = await response.json();
			if (result.success) {
				await loadGame();
				notifyGameUpdate();
			} else {
				console.error("Failed to reorder tasks:", result.error);
			}
		} catch (error) {
			console.error("Error reordering tasks:", error);
		} finally {
			setTaskOperationLoading(false);
		}
	};

	const handleClearQueue = async () => {
		if (!game) return;

		if (!confirm("Are you sure you want to clear all tasks from the queue?")) {
			return;
		}

		setTaskOperationLoading(true);
		try {
			const response = await fetch(`/api/games/${gameId}/tasks`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					action: "clear",
				}),
			});

			const result = await response.json();
			if (result.success) {
				await loadGame();
				notifyGameUpdate();
			} else {
				console.error("Failed to clear queue:", result.error);
			}
		} catch (error) {
			console.error("Error clearing queue:", error);
		} finally {
			setTaskOperationLoading(false);
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				Loading...
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				Error: {error}
			</div>
		);
	}

	if (!game) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				Game not found
			</div>
		);
	}

	if (!isAuthenticated) {
		return (
			<AdminAuthForm
				gameName={game.name}
				password={password}
				authError={authError}
				onPasswordChange={setPassword}
				onSubmit={verifyPassword}
			/>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<GameHeader
					gameName={game.name}
					gameId={gameId}
					activeUsers={activeUsers}
					isConnected={isConnected}
					onLogout={logout}
				/>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<AddTaskCard
						taskDescription={taskDescription}
						currentTask={game.currentTask}
						onTaskDescriptionChange={setTaskDescription}
						onAddTask={addTask}
						onRevealVotes={revealVotes}
						onAllowChanges={allowChanges}
						onNextQuestion={nextQuestion}
					/>

					<ActivePlayersCard users={game.users} />
				</div>

				{/* Task Import and Queue Management */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
					<TaskImport
						onTasksImported={handleTasksImported}
						isLoading={taskOperationLoading}
					/>
					<TaskQueue
						tasks={game.taskQueue || []}
						onTaskSelect={handleTaskSelect}
						onTaskEdit={handleTaskEdit}
						onTaskDelete={handleTaskDelete}
						onTaskReorder={handleTaskReorder}
						onClearQueue={handleClearQueue}
						isLoading={taskOperationLoading}
					/>
				</div>

				{game.currentTask && (
					<VotingResultsTable
						task={game.currentTask}
						scoreConfig={game.scoreConfig}
						onSetFinalScore={setFinalScore}
					/>
				)}

				<TaskHistoryCard
					completedTasks={game.completedTasks || []}
					users={game.users}
					scoreConfig={game.scoreConfig}
					onSetFinalScore={setFinalScore}
				/>
			</div>
		</div>
	);
}
