import { Task, User, Vote, ScoreConfig } from "@/types/game";
import { getScoreForVote, getModeScore } from "@/utils/scoreCalculation";
import FinalScoreInput from "./FinalScoreInput";

interface TaskHistoryCardProps {
	completedTasks: Task[];
	users: User[];
	scoreConfig: ScoreConfig;
	onSetFinalScore: (taskId: string, score: number) => void;
}

export default function TaskHistoryCard({
	completedTasks,
	users,
	scoreConfig,
	onSetFinalScore,
}: TaskHistoryCardProps) {
	const getVoteScore = (vote: Vote) => {
		return getScoreForVote(vote, scoreConfig);
	};

	if (!completedTasks || completedTasks.length === 0) {
		return null;
	}

	const totalVotes = completedTasks.reduce(
		(sum, task) => sum + task.votes.length,
		0
	);

	const avgScore =
		completedTasks.length > 0
			? Math.round(
					(completedTasks.reduce(
						(taskSum, task) =>
							taskSum +
							(task.votes.length > 0
								? task.votes.reduce(
										(voteSum, vote) => voteSum + getVoteScore(vote),
										0
									) / task.votes.length
								: 0),
						0
					) /
						completedTasks.length) *
						10
				) / 10
			: 0;

	return (
		<div className="mt-6 bg-white rounded-lg shadow-md p-6 text-gray-900">
			<h2 className="text-xl font-semibold mb-4">Task History</h2>

			{/* Summary Statistics */}
			<div className="mb-6 p-4 bg-blue-50 rounded-lg">
				<h3 className="font-semibold mb-2">Session Summary</h3>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
					<div>
						<span className="text-gray-600">Tasks Completed:</span>
						<div className="font-bold text-lg">{completedTasks.length}</div>
					</div>
					<div>
						<span className="text-gray-600">Total Votes:</span>
						<div className="font-bold text-lg">{totalVotes}</div>
					</div>
					<div>
						<span className="text-gray-600">Avg. Score:</span>
						<div className="font-bold text-lg">{avgScore}</div>
					</div>
					<div>
						<span className="text-gray-600">Participants:</span>
						<div className="font-bold text-lg">{users.length}</div>
					</div>
				</div>
			</div>

			<div className="space-y-4">
				{completedTasks.map((task, index) => {
					const modeScore = getModeScore(task.votes, scoreConfig);
					const taskAvgScore =
						task.votes.length > 0
							? Math.round(
									(task.votes.reduce(
										(sum, vote) => sum + getVoteScore(vote),
										0
									) /
										task.votes.length) *
										10
								) / 10
							: 0;

					return (
						<div key={task.id} className="border rounded-lg p-4 bg-gray-50">
							<div className="flex justify-between items-start mb-2">
								<h3 className="font-semibold">
									Task #{completedTasks.length - index}
								</h3>
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
														{getVoteScore(vote)}
													</td>
												</tr>
											))}
										</tbody>
									</table>
									<div className="mt-2 flex items-center justify-between text-sm text-gray-600">
										<span>Average Score: {taskAvgScore}</span>
										{task.finalScore && (
											<span className="font-bold text-green-700">
												Final Score: {task.finalScore}
											</span>
										)}
									</div>

									<FinalScoreInput
										taskId={task.id}
										modeScore={modeScore}
										currentFinalScore={task.finalScore}
										onSetFinalScore={onSetFinalScore}
										variant="secondary"
									/>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
