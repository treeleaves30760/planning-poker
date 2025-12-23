"use client";

interface GameHeaderProps {
	gameName: string;
	gameId: string;
	activeUsers: number;
	isConnected: boolean;
	onLogout: () => void;
}

export default function GameHeader({
	gameName,
	gameId,
	activeUsers,
	isConnected,
	onLogout,
}: GameHeaderProps) {
	const handleCopyLink = () => {
		if (typeof window !== "undefined") {
			const url = `${window.location.origin}/game/${gameId}/join`;
			navigator.clipboard.writeText(url);
		}
	};

	return (
		<div className="mb-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold text-gray-900">
					{gameName} - Admin Panel
				</h1>
				<button
					onClick={onLogout}
					className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
				>
					Logout
				</button>
			</div>
			<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
				<p className="text-sm font-medium text-blue-900 mb-2">
					Share this link for players to join:
				</p>
				<div className="flex items-center gap-2">
					<code className="bg-white px-3 py-2 rounded border text-sm font-mono flex-1 text-gray-900">
						{typeof window !== "undefined"
							? `${window.location.origin}/game/${gameId}/join`
							: `/game/${gameId}/join`}
					</code>
					<button
						onClick={handleCopyLink}
						className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
					>
						Copy
					</button>
				</div>
			</div>
			<p className="text-gray-600 mt-2">Game ID: {gameId}</p>
			<div className="flex items-center gap-4 text-gray-600">
				<span>Active Players: {activeUsers}</span>
				<span
					className={`inline-flex items-center gap-1 text-sm ${
						isConnected ? "text-green-600" : "text-red-600"
					}`}
				>
					<div
						className={`w-2 h-2 rounded-full ${
							isConnected ? "bg-green-400" : "bg-red-400"
						}`}
					></div>
					{isConnected ? "Connected" : "Reconnecting..."}
				</span>
			</div>
		</div>
	);
}
