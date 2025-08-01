"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
	const router = useRouter();
	const [gameId, setGameId] = useState("");

	const handleJoinGame = (e: React.FormEvent) => {
		e.preventDefault();
		if (gameId.trim()) {
			router.push(`/game/${gameId.trim()}/join`);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">
						Story Point Party
					</h1>
					<p className="text-lg text-gray-600 mb-8">
						Collaborative task difficulty estimation for agile teams
					</p>
				</div>

				<div className="bg-white shadow-md rounded-lg p-6 space-y-6">
					<Link
						href="/admin"
						className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						Create New Game
					</Link>
					
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-300" />
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="px-2 bg-white text-gray-500">Or</span>
						</div>
					</div>

					<form onSubmit={handleJoinGame} className="space-y-4">
						<div>
							<label htmlFor="gameId" className="block text-sm font-medium text-gray-700 mb-2">
								Join Existing Game
							</label>
							<input
								type="text"
								id="gameId"
								value={gameId}
								onChange={(e) => setGameId(e.target.value)}
								placeholder="Enter Game ID"
								className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
						<button
							type="submit"
							disabled={!gameId.trim()}
							className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
						>
							Join Game
						</button>
					</form>
				</div>

				<div className="bg-white shadow-md rounded-lg p-6">
					<h2 className="text-lg font-semibold mb-4 text-gray-900">
						How it works:
					</h2>
					<ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
						<li>Admin creates a game and sets scoring configuration</li>
						<li>Players join using the game ID</li>
						<li>Admin adds task descriptions</li>
						<li>Players vote on Uncertainty, Complexity, and Effort</li>
						<li>Admin reveals results and can allow vote changes</li>
						<li>Continue with next tasks</li>
					</ol>
				</div>
			</div>
		</div>
	);
}
