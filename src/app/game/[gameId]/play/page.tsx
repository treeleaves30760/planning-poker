"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Vote } from "@/types/game";
import { useGameState } from "@/hooks/useGameState";
import { calculateScore } from "@/utils/scoreCalculation";

export default function PlayGamePage() {
	const params = useParams();
	const router = useRouter();
	const gameId = params.gameId as string;
	const { game, isLoading, error, loadGame, saveGame } = useGameState(gameId);
	const [userId, setUserId] = useState<string | null>(null);
	const [username, setUsername] = useState<string | null>(null);
	const [currentVote, setCurrentVote] = useState<{
		uncertainty: "low" | "mid" | "high" | null;
		complexity: "low" | "mid" | "high" | null;
		effort: "low" | "mid" | "high" | null;
	}>({
		uncertainty: null,
		complexity: null,
		effort: null,
	});
	const [hasVoted, setHasVoted] = useState(false);
	const [isVoting, setIsVoting] = useState(false);
	const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(true);
	const lastTaskIdRef = useRef<string | null>(null);
	const voteLoadedRef = useRef(false);

	// Handle task changes and vote loading
	useEffect(() => {
		if (game?.currentTask && userId) {
			const currentTaskId = game.currentTask.id;

			// Check if task changed
			if (lastTaskIdRef.current !== currentTaskId) {
				lastTaskIdRef.current = currentTaskId;
				voteLoadedRef.current = false;
				// Reset everything for new task
				setCurrentVote({
					uncertainty: null,
					complexity: null,
					effort: null,
				});
				setHasVoted(false);
				setIsVoting(false);
				return; // Exit early to avoid loading vote in same render
			}

			const existingVote = game.currentTask.votes.find(
				(v: Vote) => v.userId === userId
			);

			if (existingVote && !voteLoadedRef.current) {
				// User has a saved vote - load it only once
				setCurrentVote({
					uncertainty: existingVote.uncertainty,
					complexity: existingVote.complexity,
					effort: existingVote.effort,
				});
				setHasVoted(true);
				setIsVoting(false);
				voteLoadedRef.current = true;
			}
		}
	}, [game?.currentTask?.id, game?.currentTask?.votes, userId]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		const storedUserId = localStorage.getItem("currentUserId");
		const storedUsername = localStorage.getItem("currentUsername");

		if (!storedUserId) {
			router.push(`/game/${gameId}/join`);
			return;
		}

		setUserId(storedUserId);
		setUsername(storedUsername);
	}, [gameId, router]);

	useEffect(() => {
		if (userId) {
			// Use longer interval when user is actively voting to reduce interference
			const pollInterval = isVoting ? 5000 : 3000;
			const interval = setInterval(() => {
				loadGame();
			}, pollInterval);
			return () => clearInterval(interval);
		}
	}, [loadGame, userId, isVoting]);

	useEffect(() => {
		const handleBeforeUnload = () => {
			if (game && userId) {
				const updatedUsers = game.users.filter((u) => u.id !== userId);
				const updatedGame = { ...game, users: updatedUsers };
				saveGame(updatedGame).catch(console.error);
			}
		};

		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [game, userId, saveGame]);

	const calculateTotalScore = () => {
		if (
			!game ||
			!currentVote.uncertainty ||
			!currentVote.complexity ||
			!currentVote.effort
		) {
			return 0;
		}

		return calculateScore(
			currentVote.uncertainty,
			currentVote.complexity,
			currentVote.effort,
			game.scoreConfig
		);
	};

	const submitVote = async () => {
		if (
			!game ||
			!userId ||
			!username ||
			!currentVote.uncertainty ||
			!currentVote.complexity ||
			!currentVote.effort
		) {
			return;
		}

		setIsVoting(true);

		const newVote: Vote = {
			userId,
			username,
			uncertainty: currentVote.uncertainty,
			complexity: currentVote.complexity,
			effort: currentVote.effort,
			totalScore: calculateTotalScore(),
		};

		const existingVoteIndex =
			game.currentTask?.votes.findIndex((v) => v.userId === userId) ?? -1;
		let updatedVotes;

		if (existingVoteIndex >= 0) {
			updatedVotes = [...(game.currentTask?.votes ?? [])];
			updatedVotes[existingVoteIndex] = newVote;
		} else {
			updatedVotes = [...(game.currentTask?.votes ?? []), newVote];
		}

		const updatedTask = game.currentTask
			? {
					...game.currentTask,
					votes: updatedVotes,
			  }
			: null;

		const updatedGame = {
			...game,
			currentTask: updatedTask,
			tasks: game.tasks.map((t) =>
				t.id === updatedTask?.id ? updatedTask : t
			),
		};

		try {
			await saveGame(updatedGame);
			setHasVoted(true);
			voteLoadedRef.current = true; // Mark vote as loaded after successful submission
		} catch (err) {
			console.error("Failed to submit vote:", err);
		} finally {
			setIsVoting(false);
		}
	};

	const canChangeVote =
		game?.currentTask?.revealed && game?.currentTask?.allowChanges;

	const votingDomains = [
		{
			dimension: "uncertainty" as const,
			title: "Uncertainty",
			colorScheme: {
				title: "text-blue-600",
				low: "bg-blue-100 text-blue-800",
				mid: "bg-blue-200 text-blue-800",
				high: "bg-blue-300 text-blue-800",
			},
		},
		{
			dimension: "complexity" as const,
			title: "Complexity",
			colorScheme: {
				title: "text-green-600",
				low: "bg-green-100 text-green-800",
				mid: "bg-green-200 text-green-800",
				high: "bg-green-300 text-green-800",
			},
		},
		{
			dimension: "effort" as const,
			title: "Effort",
			colorScheme: {
				title: "text-purple-600",
				low: "bg-purple-100 text-purple-800",
				mid: "bg-purple-200 text-purple-800",
				high: "bg-purple-300 text-purple-800",
			},
		},
	];

	const getVoteStatistics = () => {
		if (!game?.currentTask?.votes || game.currentTask.votes.length === 0) {
			return null;
		}

		const votes = game.currentTask.votes;
		const stats = {
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
	};

	const LevelButton = ({
		dimension,
		level,
		color,
	}: {
		dimension: "uncertainty" | "complexity" | "effort";
		level: "low" | "mid" | "high";
		color: string;
	}) => {
		const isSelected = currentVote[dimension] === level;
		const canVote = !hasVoted || canChangeVote;

		const handleClick = () => {
			if (canVote) {
				setCurrentVote((prev) => ({ ...prev, [dimension]: level }));
				// Mark as voting when user starts making selections
				if (!hasVoted && !isVoting) {
					setIsVoting(true);
				}
			}
		};

		return (
			<button
				onClick={handleClick}
				disabled={!canVote}
				className={`p-3 rounded-lg border-2 transition-all ${
					isSelected
						? `${color} border-current`
						: canVote
						? `border-gray-300 hover:${color} hover:border-current`
						: "border-gray-200 bg-gray-100"
				} ${!canVote ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
			>
				<div className="text-sm font-semibold capitalize">{level}</div>
			</button>
		);
	};

	const VotingDomain = ({
		dimension,
		title,
		colorScheme,
	}: {
		dimension: "uncertainty" | "complexity" | "effort";
		title: string;
		colorScheme: {
			title: string;
			low: string;
			mid: string;
			high: string;
		};
	}) => {
		return (
			<div>
				<h4
					className={`text-lg font-medium mb-4 ${colorScheme.title} text-center`}
				>
					{title}
				</h4>
				<div className="grid grid-cols-3 gap-2">
					<LevelButton
						dimension={dimension}
						level="low"
						color={colorScheme.low}
					/>
					<LevelButton
						dimension={dimension}
						level="mid"
						color={colorScheme.mid}
					/>
					<LevelButton
						dimension={dimension}
						level="high"
						color={colorScheme.high}
					/>
				</div>
			</div>
		);
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				Loading...
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				Error: {error}
			</div>
		);
	}

	if (!game) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				Game not found
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4">
				<div className="mb-6">
					<h1 className="text-3xl font-bold text-gray-900">{game.name}</h1>
					<p className="text-gray-600">Welcome, {username}!</p>
					<p className="text-gray-600">Players: {game.users.length}</p>
				</div>

				{!game.currentTask ? (
					<div className="bg-white rounded-lg shadow-md p-8 text-center">
						<h2 className="text-2xl font-semibold mb-4 text-gray-900">
							Waiting for Next Task
						</h2>
						<p className="text-gray-600">
							The admin will add a task shortly...
						</p>
					</div>
				) : (
					<div className="space-y-6">
						<div className="bg-white rounded-lg shadow-md p-6 text-gray-900">
							<h2 className="text-2xl font-semibold mb-4">Current Task</h2>
							<p className="text-lg text-gray-700 leading-relaxed">
								{game.currentTask.description}
							</p>
						</div>

						{game.currentTask.revealed && (
							<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
								{/* Vote Statistics Card */}
								{(() => {
									const stats = getVoteStatistics();
									return (
										stats && (
											<div className="bg-white rounded-lg shadow-md p-6 text-gray-900">
												<h3 className="text-lg font-semibold mb-4">
													Vote Statistics
												</h3>
												<div className="space-y-4">
													<div className="text-center">
														<div className="text-2xl font-bold text-blue-600">
															{stats.averageScore}
														</div>
														<div className="text-sm text-gray-500">
															Average Score
														</div>
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
										)
									);
								})()}

								{/* Voting Results Table */}
								<div
									className={`bg-white rounded-lg shadow-md p-6 text-gray-900 ${
										getVoteStatistics() ? "lg:col-span-3" : "lg:col-span-4"
									}`}
								>
									<h3 className="text-xl font-semibold mb-4">Voting Results</h3>
									{game.currentTask.votes.length === 0 ? (
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
													{game.currentTask.votes.map((vote) => (
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
							</div>
						)}

						<div className="bg-white rounded-lg shadow-md p-6 text-gray-900">
							<h3 className="text-xl font-semibold mb-6">Rate the Task</h3>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								{votingDomains.map((domain) => (
									<VotingDomain
										key={domain.dimension}
										dimension={domain.dimension}
										title={domain.title}
										colorScheme={domain.colorScheme}
									/>
								))}
							</div>

							<div className="mt-8 text-center">
								<div className="mb-6">
									<div className="text-lg text-gray-600 mb-2">
										Current Selection Score:
									</div>
									<div className="text-4xl font-bold text-blue-600 mb-4">
										{calculateTotalScore()}
									</div>
									{currentVote.uncertainty &&
										currentVote.complexity &&
										currentVote.effort && (
											<div className="text-sm text-gray-500">
												{currentVote.uncertainty} × {currentVote.complexity} ×{" "}
												{currentVote.effort}
											</div>
										)}
								</div>

								{(!hasVoted || canChangeVote) && (
									<button
										onClick={submitVote}
										disabled={
											!currentVote.uncertainty ||
											!currentVote.complexity ||
											!currentVote.effort
										}
										className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
									>
										{hasVoted ? "Update Vote" : "Submit Vote"}
									</button>
								)}

								{hasVoted && !canChangeVote && (
									<div className="text-green-600 font-semibold">
										✓ Vote submitted! Waiting for results...
									</div>
								)}
							</div>
						</div>

						{game.completedTasks && game.completedTasks.length > 0 && (
							<div className="bg-white rounded-lg shadow-md p-6 text-gray-900">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-xl font-semibold">Task History</h3>
									<button
										onClick={() => setIsHistoryCollapsed(!isHistoryCollapsed)}
										className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
									>
										<span>{isHistoryCollapsed ? "Show" : "Hide"}</span>
										<svg
											className={`w-4 h-4 transform transition-transform ${
												isHistoryCollapsed ? "rotate-0" : "rotate-180"
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

								{!isHistoryCollapsed && (
									<div className="space-y-4">
										{game.completedTasks
											.slice()
											.reverse()
											.map((task, index) => (
												<div
													key={task.id}
													className="border rounded-lg p-4 bg-gray-50"
												>
													<div className="flex justify-between items-start mb-2">
														<h4 className="font-semibold">
															Task #{game.completedTasks.length - index}
														</h4>
														<span className="text-sm text-gray-500">
															{task.completedAt
																? new Date(task.completedAt).toLocaleString()
																: "Recently completed"}
														</span>
													</div>
													<p className="text-gray-700 mb-3">
														{task.description}
													</p>

													{task.votes.length > 0 && (
														<div className="overflow-x-auto">
															<table className="w-full text-sm">
																<thead>
																	<tr className="border-b">
																		<th className="text-left py-1">User</th>
																		<th className="text-center py-1">
																			Uncertainty
																		</th>
																		<th className="text-center py-1">
																			Complexity
																		</th>
																		<th className="text-center py-1">Effort</th>
																		<th className="text-center py-1">Total</th>
																	</tr>
																</thead>
																<tbody>
																	{task.votes.map((vote) => (
																		<tr key={vote.userId} className="border-b">
																			<td className="py-1 font-medium">
																				{vote.username}
																			</td>
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
																					game.scoreConfig
																				)}
																			</td>
																		</tr>
																	))}
																</tbody>
															</table>
															<div className="mt-2 text-sm text-gray-600">
																Average Score:{" "}
																{Math.round(
																	(task.votes.reduce(
																		(sum, vote) =>
																			sum +
																			calculateScore(
																				vote.uncertainty,
																				vote.complexity,
																				vote.effort,
																				game.scoreConfig
																			),
																		0
																	) /
																		task.votes.length) *
																		10
																) / 10}
															</div>
														</div>
													)}
												</div>
											))}
									</div>
								)}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
