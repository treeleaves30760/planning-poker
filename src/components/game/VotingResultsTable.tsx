import { Task, Vote, ScoreConfig } from "@/types/game";
import { getScoreForVote, getModeScore } from "@/utils/scoreCalculation";
import FinalScoreInput from "./FinalScoreInput";

interface VotingResultsTableProps {
	task: Task;
	scoreConfig: ScoreConfig;
	onSetFinalScore: (taskId: string, score: number) => void;
}

export default function VotingResultsTable({
	task,
	scoreConfig,
	onSetFinalScore,
}: VotingResultsTableProps) {
	const getVoteScore = (vote: Vote) => {
		return getScoreForVote(vote, scoreConfig);
	};

	if (task.votes.length === 0) {
		return (
			<div className="mt-6 bg-white rounded-lg shadow-md p-6 text-gray-900">
				<h2 className="text-xl font-semibold mb-4">Voting Results</h2>
				<p className="text-gray-500 text-center py-4">
					No votes submitted yet
				</p>
			</div>
		);
	}

	const modeScore = getModeScore(task.votes, scoreConfig);

	return (
		<div className="mt-6 bg-white rounded-lg shadow-md p-6 text-gray-900">
			<h2 className="text-xl font-semibold mb-4">Voting Results</h2>

			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b">
							<th className="text-left py-2">User</th>
							<th className="text-center py-2">Uncertainty</th>
							<th className="text-center py-2">Complexity</th>
							<th className="text-center py-2">Effort</th>
							<th className="text-center py-2">Total Score</th>
						</tr>
					</thead>
					<tbody>
						{task.votes.map((vote) => (
							<tr key={vote.userId} className="border-b">
								<td className="py-2 font-medium">{vote.username}</td>
								<td className="text-center">
									{task.revealed ? (
										<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
											{vote.uncertainty}
										</span>
									) : (
										<span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-sm">
											Hidden
										</span>
									)}
								</td>
								<td className="text-center">
									{task.revealed ? (
										<span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
											{vote.complexity}
										</span>
									) : (
										<span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-sm">
											Hidden
										</span>
									)}
								</td>
								<td className="text-center">
									{task.revealed ? (
										<span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
											{vote.effort}
										</span>
									) : (
										<span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-sm">
											Hidden
										</span>
									)}
								</td>
								<td className="text-center font-bold">
									{task.revealed ? getVoteScore(vote) : "?"}
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{task.revealed && (
					<FinalScoreInput
						taskId={task.id}
						modeScore={modeScore}
						currentFinalScore={task.finalScore}
						onSetFinalScore={onSetFinalScore}
						variant="primary"
					/>
				)}
			</div>
		</div>
	);
}
