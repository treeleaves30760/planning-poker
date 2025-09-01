"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Vote } from "@/types/game";
import { useGameState } from "@/hooks/useGameState";
import { useSocket } from "@/hooks/useSocket";
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

	// Socket.io connection for real-time updates
	const { isConnected, activeUsers, notifyGameUpdate } = useSocket({
		gameId,
		userId: userId || '',
		username: username || '',
		isAdmin: false,
		onUserJoined: useCallback(() => loadGame(), [loadGame]),
		onUserLeft: useCallback(() => loadGame(), [loadGame]),
		onGameStateChanged: useCallback(() => loadGame(), [loadGame]),
		onConnect: useCallback(() => console.log('Connected to game Socket.io'), []),
		onDisconnect: useCallback(() => console.log('Disconnected from game Socket.io'), [])
	});

	useEffect(() => {
		if (userId) {
			// Reduce polling frequency since we have WebSocket updates
			const pollInterval = isConnected ? 10000 : 3000; // Less frequent when connected
			const interval = setInterval(() => {
				loadGame();
			}, pollInterval);
			return () => clearInterval(interval);
		}
	}, [loadGame, userId, isConnected]);

	// Note: WebSocket hook handles cleanup on beforeunload automatically

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
			notifyGameUpdate();
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
					<div className="flex items-center gap-4 text-gray-600">
						<span>Players: {activeUsers || game.users.length}</span>
						<span className={`inline-flex items-center gap-1 text-sm ${
							isConnected ? 'text-green-600' : 'text-red-600'
						}`}>
							<div className={`w-2 h-2 rounded-full ${
								isConnected ? 'bg-green-400' : 'bg-red-400'
							}`}></div>
							{isConnected ? 'Connected' : 'Reconnecting...'}
						</span>
					</div>
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
