import { Vote } from "@/types/game";

interface VotingResultsProps {
	votes: Vote[];
	hasStatistics?: boolean;
}

export default function VotingResults({ votes, hasStatistics = false }: VotingResultsProps) {
	return (
		<div
			className={`bg-white rounded-lg shadow-md p-6 text-gray-900 ${
				hasStatistics ? "lg:col-span-3" : "lg:col-span-4"
			}`}
		>
			<h3 className="text-xl font-semibold mb-4">Voting Results</h3>
			{votes.length === 0 ? (
				<p className="text-gray-500 text-center py-4">
					No votes submitted yet
				</p>
			) : (
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
							{votes.map((vote) => (
								<tr key={vote.userId} className="border-b">
									<td className="py-2 font-medium">
										{vote.username}
									</td>
									<td className="text-center">
										<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
											{vote.uncertainty}
										</span>
									</td>
									<td className="text-center">
										<span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
											{vote.complexity}
										</span>
									</td>
									<td className="text-center">
										<span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
											{vote.effort}
										</span>
									</td>
									<td className="text-center font-bold">
										{vote.totalScore}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}