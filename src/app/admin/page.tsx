"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScoreConfig } from "@/types/game";
import defaultFibonacciScores from "@/data/defaultFibonacciScores.json";

const levels = ["low", "mid", "high"] as const;

export default function AdminFibonacciPage() {
	const router = useRouter();
	const [scoreConfig, setScoreConfig] = useState<ScoreConfig>(
		defaultFibonacciScores
	);
	const [gameName, setGameName] = useState("");

	const handleScoreChange = (combination: string, value: number) => {
		setScoreConfig((prev) => ({
			...prev,
			combinations: {
				...prev.combinations,
				[combination]: value,
			},
		}));
	};

	const resetToDefaults = () => {
		setScoreConfig(defaultFibonacciScores);
	};

	const createGame = async () => {
		if (!gameName.trim()) {
			alert("Please enter a game name");
			return;
		}

		const gameId = Math.random().toString(36).substring(2, 11);
		const adminId = Math.random().toString(36).substring(2, 11);

		const gameData = {
			id: gameId,
			name: gameName,
			adminId,
			scoreConfig,
			users: [],
			currentTask: null,
			tasks: [],
			completedTasks: [],
			isActive: true,
			createdAt: new Date(),
		};

		try {
			const response = await fetch("/api/games", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(gameData),
			});

			if (response.ok) {
				localStorage.setItem("currentAdminId", adminId);
				router.push(`/game/${gameId}/admin`);
			} else {
				alert("Failed to create game. Please try again.");
			}
		} catch (error) {
			alert("Failed to create game. Please try again.");
		}
	};

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
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
					Story Point Party - Scoring Setup
				</h1>

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
														<span
															className={`px-2 py-1 rounded text-xs font-medium ${
																uncertainty === "low"
																	? "bg-blue-100 text-blue-800"
																	: uncertainty === "mid"
																	? "bg-blue-200 text-blue-800"
																	: "bg-blue-300 text-blue-800"
															}`}
														>
															{uncertainty}
														</span>
													</td>
													<td className="py-2 px-2">
														<span
															className={`px-2 py-1 rounded text-xs font-medium ${
																complexity === "low"
																	? "bg-green-100 text-green-800"
																	: complexity === "mid"
																	? "bg-green-200 text-green-800"
																	: "bg-green-300 text-green-800"
															}`}
														>
															{complexity}
														</span>
													</td>
													<td className="py-2 px-2">
														<span
															className={`px-2 py-1 rounded text-xs font-medium ${
																effort === "low"
																	? "bg-purple-100 text-purple-800"
																	: effort === "mid"
																	? "bg-purple-200 text-purple-800"
																	: "bg-purple-300 text-purple-800"
															}`}
														>
															{effort}
														</span>
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
																handleScoreChange(
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
							onClick={resetToDefaults}
							className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
						>
							Reset to Fibonacci Defaults
						</button>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow-md p-6">
					<h2 className="text-xl font-semibold mb-4 text-gray-900">
						Create New Game
					</h2>

					<div className="mb-4">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Game Name
						</label>
						<input
							type="text"
							value={gameName}
							onChange={(e) => setGameName(e.target.value)}
							placeholder="Enter game name..."
							className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
						/>
					</div>

					<button
						onClick={createGame}
						className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
					>
						Create Game with Fibonacci Scoring
					</button>
				</div>
			</div>
		</div>
	);
}
