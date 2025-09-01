"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { User } from "@/types/game";
import { useGameState } from "@/hooks/useGameState";

export default function JoinGamePage() {
	const params = useParams();
	const router = useRouter();
	const gameId = params.gameId as string;
	const [username, setUsername] = useState("");
	const { game, isLoading, error: gameError, saveGame } = useGameState(gameId);
	const [error, setError] = useState("");

	const joinGame = async () => {
		if (!username.trim()) {
			setError("Please enter a username");
			return;
		}

		if (!game) {
			setError("Game not found");
			return;
		}

		const existingUser = game.users.find(
			(u) => u.username.toLowerCase() === username.toLowerCase()
		);
		if (existingUser) {
			setError("Username already taken");
			return;
		}

		const newUser: User = {
			id: Math.random().toString(36).substring(2, 11),
			username: username.trim(),
			isAdmin: false,
		};

		const updatedGame = {
			...game,
			users: [...game.users, newUser],
		};

		try {
			await saveGame(updatedGame);
			localStorage.setItem("currentUserId", newUser.id);
			localStorage.setItem("currentUsername", newUser.username);
			router.push(`/game/${gameId}/play`);
		} catch (err) {
			setError("Failed to join game");
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p>Loading game...</p>
				</div>
			</div>
		);
	}

	if (gameError) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
					<p className="text-gray-600">{gameError}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<h1 className="text-3xl font-bold text-gray-900">Join Game</h1>
					{game && (
						<div className="mt-4">
							<h2 className="text-xl text-gray-700">{game.name}</h2>
							<p className="text-sm text-gray-500">Game ID: {gameId}</p>
							<p className="text-sm text-gray-500">
								{game.users.filter(user => !user.isAdmin).length} player{game.users.filter(user => !user.isAdmin).length !== 1 ? "s" : ""}{" "}
								already joined
							</p>
						</div>
					)}
				</div>

				<div className="bg-white shadow-md rounded-lg p-6">
					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Enter your username
						</label>
						<input
							type="text"
							value={username}
							onChange={(e) => {
								setUsername(e.target.value);
								setError("");
							}}
							onKeyDown={(e) => e.key === "Enter" && joinGame()}
							placeholder="Your username..."
							className="w-full p-3 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							autoFocus
						/>
						{error && <p className="mt-2 text-sm text-red-600">{error}</p>}
					</div>

					<button
						onClick={joinGame}
						disabled={!username.trim()}
						className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition-colors"
					>
						Join Game
					</button>
				</div>

				{game && game.users.filter(user => !user.isAdmin).length > 0 && (
					<div className="bg-white shadow-md rounded-lg p-6 text-gray-900">
						<h3 className="text-lg font-semibold mb-4">Current Players</h3>
						<div className="space-y-2">
							{game.users.filter(user => !user.isAdmin).map((user) => (
								<div
									key={user.id}
									className="flex items-center justify-between p-2 bg-gray-50 rounded"
								>
									<span className="font-medium">{user.username}</span>
									<span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
										Player
									</span>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
