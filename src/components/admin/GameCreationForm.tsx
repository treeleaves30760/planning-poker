"use client";

import { useState } from "react";
import { ScoreConfig } from "@/types/game";

interface GameCreationFormProps {
	scoreConfig: ScoreConfig;
	onGameCreated: (gameId: string, adminId: string) => void;
}

export default function GameCreationForm({
	scoreConfig,
	onGameCreated,
}: GameCreationFormProps) {
	const [gameName, setGameName] = useState("");
	const [adminPassword, setAdminPassword] = useState("");

	const createGame = async () => {
		if (!gameName.trim()) {
			alert("Please enter a game name");
			return;
		}

		if (!adminPassword.trim()) {
			alert("Please enter an admin password");
			return;
		}

		const gameId = Math.random().toString(36).substring(2, 11);
		const adminId = Math.random().toString(36).substring(2, 11);

		const gameData = {
			id: gameId,
			name: gameName,
			adminId,
			adminPassword,
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
				onGameCreated(gameId, adminId);
			} else {
				alert("Failed to create game. Please try again.");
			}
		} catch (error) {
			alert("Failed to create game. Please try again.");
		}
	};

	return (
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

			<div className="mb-4">
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Admin Password
				</label>
				<input
					type="password"
					value={adminPassword}
					onChange={(e) => setAdminPassword(e.target.value)}
					placeholder="Enter admin password..."
					className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
				/>
				<p className="text-sm text-gray-500 mt-1">
					This password will be required to access the admin panel
				</p>
			</div>

			<button
				onClick={createGame}
				className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
			>
				Create Game with Fibonacci Scoring
			</button>
		</div>
	);
}
