"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Vote } from "@/types/game";
import { useGameState } from "@/hooks/useGameState";
import { calculateScore } from "@/utils/scoreCalculation";
import VoteStatistics from "@/components/voting/VoteStatistics";
import VotingResults from "@/components/voting/VotingResults";
import VotingSection from "@/components/voting/VotingSection";
import TaskHistory from "@/components/game/TaskHistory";
import OnlinePlayerList from "@/components/game/OnlinePlayerList";
import { DimensionType, LevelType } from "@/components/voting/votingDomains";

export default function PlayGamePage() {
	const params = useParams();
	const router = useRouter();
	const gameId = params.gameId as string;
	const { game, isLoading, error, loadGame, saveGame } = useGameState(gameId);
	const [userId, setUserId] = useState<string | null>(null);
	const [username, setUsername] = useState<string | null>(null);
	const [currentVote, setCurrentVote] = useState<{
		uncertainty: LevelType | null;
		complexity: LevelType | null;
		effort: LevelType | null;
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

	const handleVoteChange = (dimension: DimensionType, level: LevelType) => {
		setCurrentVote((prev) => ({ ...prev, [dimension]: level }));
	};

	const handleStartVoting = () => {
		if (!hasVoted && !isVoting) {
			setIsVoting(true);
		}
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
			{/* Online Player List - Floating Card */}
			<OnlinePlayerList users={game.users} currentUserId={userId} />
			
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
								<VoteStatistics votes={game.currentTask.votes} />
								<VotingResults
									votes={game.currentTask.votes}
									hasStatistics={game.currentTask.votes.length > 0}
								/>
							</div>
						)}

						<VotingSection
							currentVote={currentVote}
							hasVoted={hasVoted}
							canChangeVote={canChangeVote ?? false}
							isVoting={isVoting}
							onVoteChange={handleVoteChange}
							onStartVoting={handleStartVoting}
							onSubmitVote={submitVote}
							totalScore={calculateTotalScore()}
						/>

						<TaskHistory
							tasks={game.completedTasks || []}
							scoreConfig={game.scoreConfig}
							isCollapsed={isHistoryCollapsed}
							onToggleCollapse={() =>
								setIsHistoryCollapsed(!isHistoryCollapsed)
							}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
