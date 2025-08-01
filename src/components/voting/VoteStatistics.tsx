import { Vote } from "@/types/game";

export interface VoteStatisticsData {
	uncertainty: { low: number; mid: number; high: number };
	complexity: { low: number; mid: number; high: number };
	effort: { low: number; mid: number; high: number };
	totalVotes: number;
	averageScore: number;
}

interface VoteStatisticsProps {
	votes: Vote[];
}

export function getVoteStatistics(votes: Vote[]): VoteStatisticsData | null {
	if (!votes || votes.length === 0) {
		return null;
	}

	const stats: VoteStatisticsData = {
		uncertainty: { low: 0, mid: 0, high: 0 },
		complexity: { low: 0, mid: 0, high: 0 },
		effort: { low: 0, mid: 0, high: 0 },
		totalVotes: votes.length,
		averageScore:
			Math.round(
				(votes.reduce((sum, vote) => sum + vote.totalScore, 0) /
					votes.length) *
					10
			) / 10,
	};

	votes.forEach((vote) => {
		stats.uncertainty[vote.uncertainty]++;
		stats.complexity[vote.complexity]++;
		stats.effort[vote.effort]++;
	});

	return stats;
}

export default function VoteStatistics({ votes }: VoteStatisticsProps) {
	const stats = getVoteStatistics(votes);

	if (!stats) {
		return null;
	}

	return (
		<div className="bg-white rounded-lg shadow-md p-6 text-gray-900">
			<h3 className="text-lg font-semibold mb-4">Vote Statistics</h3>
			<div className="space-y-4">
				<div className="text-center">
					<div className="text-2xl font-bold text-blue-600">
						{stats.averageScore}
					</div>
					<div className="text-sm text-gray-500">Average Score</div>
					<div className="text-xs text-gray-400">
						({stats.totalVotes} votes)
					</div>
				</div>

				<div className="space-y-3">
					<div>
						<div className="text-sm font-medium text-blue-600 mb-1">
							Uncertainty
						</div>
						<div className="flex justify-between text-xs">
							<span>Low: {stats.uncertainty.low}</span>
							<span>Mid: {stats.uncertainty.mid}</span>
							<span>High: {stats.uncertainty.high}</span>
						</div>
					</div>

					<div>
						<div className="text-sm font-medium text-green-600 mb-1">
							Complexity
						</div>
						<div className="flex justify-between text-xs">
							<span>Low: {stats.complexity.low}</span>
							<span>Mid: {stats.complexity.mid}</span>
							<span>High: {stats.complexity.high}</span>
						</div>
					</div>

					<div>
						<div className="text-sm font-medium text-purple-600 mb-1">
							Effort
						</div>
						<div className="flex justify-between text-xs">
							<span>Low: {stats.effort.low}</span>
							<span>Mid: {stats.effort.mid}</span>
							<span>High: {stats.effort.high}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}