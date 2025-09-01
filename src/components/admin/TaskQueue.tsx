"use client";

import { useState } from "react";
import { Task } from "@/types/game";

interface TaskQueueProps {
	tasks: Task[];
	onTaskSelect: (task: Task) => void;
	onTaskEdit: (taskId: string, newDescription: string) => void;
	onTaskDelete: (taskId: string) => void;
	onTaskReorder: (fromIndex: number, toIndex: number) => void;
	onClearQueue: () => void;
	isLoading?: boolean;
}

export default function TaskQueue({
	tasks,
	onTaskSelect,
	onTaskEdit,
	onTaskDelete,
	onTaskReorder,
	onClearQueue,
	isLoading = false,
}: TaskQueueProps) {
	const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
	const [editDescription, setEditDescription] = useState("");
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

	const startEdit = (task: Task) => {
		setEditingTaskId(task.id);
		setEditDescription(task.description);
	};

	const saveEdit = () => {
		if (editingTaskId && editDescription.trim()) {
			onTaskEdit(editingTaskId, editDescription.trim());
		}
		setEditingTaskId(null);
		setEditDescription("");
	};

	const cancelEdit = () => {
		setEditingTaskId(null);
		setEditDescription("");
	};

	const handleDragStart = (e: React.DragEvent, index: number) => {
		setDraggedIndex(index);
		e.dataTransfer.effectAllowed = "move";
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "move";
	};

	const handleDrop = (e: React.DragEvent, dropIndex: number) => {
		e.preventDefault();
		if (draggedIndex !== null && draggedIndex !== dropIndex) {
			onTaskReorder(draggedIndex, dropIndex);
		}
		setDraggedIndex(null);
	};

	const handleDragEnd = () => {
		setDraggedIndex(null);
	};

	if (tasks.length === 0) {
		return (
			<div className="bg-white rounded-lg shadow-md p-6">
				<h3 className="text-lg font-semibold mb-4 text-gray-900">Task Queue</h3>
				<div className="text-center py-8">
					<svg
						className="mx-auto w-16 h-16 text-gray-300 mb-4"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
						/>
					</svg>
					<p className="text-gray-500">No tasks in the queue</p>
					<p className="text-sm text-gray-400 mt-1">
						Import tasks from a CSV file to get started
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-lg shadow-md p-6">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-lg font-semibold text-gray-900">
					Task Queue ({tasks.length} task{tasks.length === 1 ? "" : "s"})
				</h3>
				<div className="flex items-center gap-2">
					<button
						onClick={onClearQueue}
						disabled={isLoading}
						className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
					>
						Clear All
					</button>
				</div>
			</div>

			<div className="space-y-2">
				{tasks.map((task, index) => (
					<div
						key={task.id}
						draggable
						onDragStart={(e) => handleDragStart(e, index)}
						onDragOver={handleDragOver}
						onDrop={(e) => handleDrop(e, index)}
						onDragEnd={handleDragEnd}
						className={`border rounded-lg p-3 transition-all cursor-move ${
							draggedIndex === index
								? "opacity-50"
								: "hover:shadow-md hover:border-gray-300"
						} ${isLoading ? "opacity-50" : ""}`}
					>
						<div className="flex items-center gap-3">
							<div className="text-gray-400">
								<svg
									className="w-4 h-4"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
								</svg>
							</div>

							<div className="flex-1">
								{editingTaskId === task.id ? (
									<div className="flex items-center gap-2">
										<input
											type="text"
											value={editDescription}
											onChange={(e) => setEditDescription(e.target.value)}
											onKeyPress={(e) => {
												if (e.key === "Enter") saveEdit();
												if (e.key === "Escape") cancelEdit();
											}}
											className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											autoFocus
										/>
										<button
											onClick={saveEdit}
											className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
										>
											Save
										</button>
										<button
											onClick={cancelEdit}
											className="px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
										>
											Cancel
										</button>
									</div>
								) : (
									<div className="flex items-center justify-between">
										<div className="flex-1">
											<p className="text-gray-900 text-sm font-medium">
												#{index + 1}
											</p>
											<p className="text-gray-700">{task.description}</p>
										</div>
										<div className="flex items-center gap-1">
											<button
												onClick={() => onTaskSelect(task)}
												disabled={isLoading}
												className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
											>
												Use Now
											</button>
											<button
												onClick={() => startEdit(task)}
												disabled={isLoading}
												className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200 disabled:opacity-50"
											>
												Edit
											</button>
											<button
												onClick={() => onTaskDelete(task.id)}
												disabled={isLoading}
												className="px-2 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200 disabled:opacity-50"
											>
												Delete
											</button>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="mt-4 text-sm text-gray-500">
				<p>
					💡 Tip: Drag and drop tasks to reorder them. Click &quot;Use Now&quot;
					to start voting on a task immediately.
				</p>
			</div>
		</div>
	);
}
