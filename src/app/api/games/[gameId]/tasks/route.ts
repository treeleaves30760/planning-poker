import { NextRequest, NextResponse } from "next/server";
import { Game } from "@/types/game";
import { dbManager } from "@/lib/database";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ gameId: string }> }
) {
	try {
		const { gameId } = await params;
		const body = await request.json();
		const { tasks, action } = body;

		const game = dbManager.getGame(gameId);
		if (!game) {
			return NextResponse.json({ error: "Game not found" }, { status: 404 });
		}

		let updatedGame: Game;

		switch (action) {
			case "import":
				// Add tasks to the task queue
				updatedGame = {
					...game,
					taskQueue: [...(game.taskQueue || []), ...tasks],
				};
				break;

			case "reorder":
				// Reorder tasks in the queue
				const { fromIndex, toIndex } = body;
				const taskQueue = [...(game.taskQueue || [])];
				const [movedTask] = taskQueue.splice(fromIndex, 1);
				taskQueue.splice(toIndex, 0, movedTask);

				updatedGame = {
					...game,
					taskQueue,
				};
				break;

			case "select":
				// Move a task from queue to current task
				const { taskId } = body;
				const taskQueue2 = game.taskQueue || [];
				const selectedTask = taskQueue2.find((t) => t.id === taskId);

				if (!selectedTask) {
					return NextResponse.json(
						{ error: "Task not found in queue" },
						{ status: 404 }
					);
				}

				updatedGame = {
					...game,
					currentTask: selectedTask,
					tasks: [...game.tasks, selectedTask],
					taskQueue: taskQueue2.filter((t) => t.id !== taskId),
				};
				break;

			case "edit":
				// Edit a task in the queue
				const { taskId: editTaskId, description } = body;
				const editedTaskQueue = (game.taskQueue || []).map((task) =>
					task.id === editTaskId ? { ...task, description } : task
				);

				updatedGame = {
					...game,
					taskQueue: editedTaskQueue,
				};
				break;

			case "delete":
				// Delete a task from the queue
				const { taskId: deleteTaskId } = body;
				updatedGame = {
					...game,
					taskQueue: (game.taskQueue || []).filter(
						(t) => t.id !== deleteTaskId
					),
				};
				break;

			case "clear":
				// Clear all tasks from the queue
				updatedGame = {
					...game,
					taskQueue: [],
				};
				break;

			default:
				return NextResponse.json({ error: "Invalid action" }, { status: 400 });
		}

		const success = dbManager.updateGame(updatedGame);

		if (success) {
			return NextResponse.json({ success: true, game: updatedGame });
		} else {
			return NextResponse.json(
				{ error: "Failed to update game" },
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error("Error managing tasks:", error);
		return NextResponse.json(
			{ error: "Failed to manage tasks" },
			{ status: 500 }
		);
	}
}
