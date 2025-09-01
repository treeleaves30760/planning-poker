import { Task, ScoreConfig } from "@/types/game";
import { calculateScore } from "@/utils/scoreCalculation";

interface TaskHistoryProps {
	tasks: Task[];
	scoreConfig: ScoreConfig;
	isCollapsed: boolean;
	onToggleCollapse: () => void;
}

export default function TaskHistory({
	tasks,
	scoreConfig,
	isCollapsed,
	onToggleCollapse,
}: TaskHistoryProps) {
	if (!tasks || tasks.length === 0) {
		return null;
	}

	return (
		<div className="bg-white rounded-lg shadow-md p-6 text-gray-900">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-xl font-semibold">Task History</h3>
				<button
					onClick={onToggleCollapse}
					className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
				>
					<span>{isCollapsed ? "Show" : "Hide"}</span>
					<svg
						className={`w-4 h-4 transform transition-transform ${
							isCollapsed ? "rotate-0" : "rotate-180"
						}`}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</button>
			</div>

			{!isCollapsed && (
				<div className="space-y-4">
					{tasks.slice().map((task, index) => (
						<div key={task.id} className="border rounded-lg p-4 bg-gray-50">
							<div className="flex justify-between items-start mb-2">
								<h4 className="font-semibold">Task #{index + 1}</h4>
								<span className="text-sm text-gray-500">
									{task.completedAt
										? new Date(task.completedAt).toLocaleString()
										: "Recently completed"}
								</span>
							</div>
							<p className="text-gray-700 mb-3">{task.description}</p>

							{task.votes.length > 0 && (
								<div className="overflow-x-auto">
									<table className="w-full text-sm">
										<thead>
											<tr className="border-b">
												<th className="text-left py-1">User</th>
												<th className="text-center py-1">Uncertainty</th>
												<th className="text-center py-1">Complexity</th>
												<th className="text-center py-1">Effort</th>
												<th className="text-center py-1">Total</th>
											</tr>
										</thead>
										<tbody>
											{task.votes.map((vote) => (
												<tr key={vote.userId} className="border-b">
													<td className="py-1 font-medium">{vote.username}</td>
													<td className="text-center">
														<span className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
															{vote.uncertainty}
														</span>
													</td>
													<td className="text-center">
														<span className="px-1 py-0.5 bg-green-100 text-green-800 rounded text-xs">
															{vote.complexity}
														</span>
													</td>
													<td className="text-center">
														<span className="px-1 py-0.5 bg-purple-100 text-purple-800 rounded text-xs">
															{vote.effort}
														</span>
													</td>
													<td className="text-center font-bold">
														{calculateScore(
															vote.uncertainty,
															vote.complexity,
															vote.effort,
															scoreConfig
														)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
									<div className="mt-2 flex items-center justify-between text-sm text-gray-600">
										<span>
											Average Score:{" "}
											{Math.round(
												(task.votes.reduce(
													(sum, vote) =>
														sum +
														calculateScore(
															vote.uncertainty,
															vote.complexity,
															vote.effort,
															scoreConfig
														),
													0
												) /
													task.votes.length) *
													10
											) / 10}
										</span>
										{task.finalScore && (
											<span className="font-bold text-green-700 text-lg">
												Final Score: {task.finalScore}
											</span>
										)}
									</div>
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
