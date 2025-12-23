import { Task } from "@/types/game";

interface AddTaskCardProps {
	taskDescription: string;
	currentTask: Task | null;
	onTaskDescriptionChange: (description: string) => void;
	onAddTask: () => void;
	onRevealVotes: () => void;
	onAllowChanges: () => void;
	onNextQuestion: () => void;
}

export default function AddTaskCard({
	taskDescription,
	currentTask,
	onTaskDescriptionChange,
	onAddTask,
	onRevealVotes,
	onAllowChanges,
	onNextQuestion,
}: AddTaskCardProps) {
	return (
		<div className="bg-white rounded-lg shadow-md p-6 text-gray-900">
			<h2 className="text-xl font-semibold mb-4">Add Task</h2>

			<div className="mb-4">
				<textarea
					value={taskDescription}
					onChange={(e) => onTaskDescriptionChange(e.target.value)}
					placeholder="Enter task description..."
					className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
				/>
			</div>

			<button
				onClick={onAddTask}
				disabled={!taskDescription.trim()}
				className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
			>
				Add Task
			</button>

			{currentTask && (
				<div className="mt-6 p-4 bg-gray-50 rounded-lg text-gray-900">
					<h3 className="font-semibold mb-2">Current Task:</h3>
					<p className="text-gray-700 mb-4">{currentTask.description}</p>

					<div className="flex gap-2 flex-wrap">
						{!currentTask.revealed && (
							<button
								onClick={onRevealVotes}
								className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
							>
								Reveal Votes
							</button>
						)}

						{currentTask.revealed && (
							<>
								{!currentTask.allowChanges && (
									<button
										onClick={onAllowChanges}
										className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
									>
										Allow Changes
									</button>
								)}

								<button
									onClick={onNextQuestion}
									className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
								>
									Next Question
								</button>
							</>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
