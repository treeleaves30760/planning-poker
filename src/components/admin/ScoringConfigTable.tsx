import { ScoreConfig } from "@/types/game";
import LevelBadge from "./LevelBadge";

const levels = ["low", "mid", "high"] as const;

interface ScoringConfigTableProps {
	scoreConfig: ScoreConfig;
	onScoreChange: (combination: string, value: number) => void;
	onResetToDefaults: () => void;
}

export default function ScoringConfigTable({
	scoreConfig,
	onScoreChange,
	onResetToDefaults,
}: ScoringConfigTableProps) {
	const getCombinationKey = (
		uncertainty: string,
		complexity: string,
		effort: string
	) => {
		return `${uncertainty}-${complexity}-${effort}`;
	};

	const getCombinationScore = (
		uncertainty: string,
		complexity: string,
		effort: string
	) => {
		const key = getCombinationKey(uncertainty, complexity, effort);
		return scoreConfig.combinations?.[key] || 1;
	};

	return (
		<div className="bg-white rounded-lg shadow-md p-6 mb-6">
			<h2 className="text-xl font-semibold mb-4 text-gray-900">
				Fibonacci Scoring Configuration
			</h2>
			<p className="text-gray-600 mb-6">
				Configure scores for all 27 combinations of Uncertainty, Complexity,
				and Effort levels. Default values follow Fibonacci sequence (1, 2,
				3, 5, 8, 13, 21).
			</p>

			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b bg-gray-50">
							<th className="text-left py-3 px-2 font-semibold text-gray-900">
								Uncertainty
							</th>
							<th className="text-left py-3 px-2 font-semibold text-gray-900">
								Complexity
							</th>
							<th className="text-left py-3 px-2 font-semibold text-gray-900">
								Effort
							</th>
							<th className="text-center py-3 px-2 font-semibold text-gray-900">
								Score
							</th>
						</tr>
					</thead>
					<tbody>
						{levels.map((uncertainty) =>
							levels.map((complexity) =>
								levels.map((effort) => {
									const key = getCombinationKey(
										uncertainty,
										complexity,
										effort
									);
									return (
										<tr key={key} className="border-b hover:bg-gray-50">
											<td className="py-2 px-2">
												<LevelBadge level={uncertainty} dimension="uncertainty" />
											</td>
											<td className="py-2 px-2">
												<LevelBadge level={complexity} dimension="complexity" />
											</td>
											<td className="py-2 px-2">
												<LevelBadge level={effort} dimension="effort" />
											</td>
											<td className="py-2 px-2 text-center text-gray-900">
												<input
													type="number"
													min="0"
													max="100"
													value={getCombinationScore(
														uncertainty,
														complexity,
														effort
													)}
													onChange={(e) =>
														onScoreChange(
															key,
															parseInt(e.target.value) || 0
														)
													}
													className="w-16 p-1 border border-gray-300 rounded text-center"
												/>
											</td>
										</tr>
									);
								})
							)
						)}
					</tbody>
				</table>
			</div>

			<div className="mt-6 flex gap-4">
				<button
					onClick={onResetToDefaults}
					className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
				>
					Reset to Fibonacci Defaults
				</button>
			</div>
		</div>
	);
}
