import { User } from "@/types/game";

interface ActivePlayersCardProps {
	users: User[];
}

export default function ActivePlayersCard({ users }: ActivePlayersCardProps) {
	const players = users.filter((user) => !user.isAdmin);

	return (
		<div className="bg-white rounded-lg shadow-md p-6 text-gray-900">
			<h2 className="text-xl font-semibold mb-4">Active Players</h2>

			<div className="space-y-2">
				{players.map((user) => (
					<div
						key={user.id}
						className="flex items-center justify-between p-2 bg-gray-50 rounded"
					>
						<div className="flex items-center gap-2">
							<div
								className={`w-2 h-2 rounded-full ${
									user.status === "away" ? "bg-yellow-400" : "bg-green-400"
								}`}
							></div>
							<span className="font-medium">{user.username}</span>
						</div>
						<span
							className={`px-2 py-1 rounded text-xs ${
								user.status === "away"
									? "bg-yellow-100 text-yellow-800"
									: "bg-blue-100 text-blue-800"
							}`}
						>
							{user.status === "away" ? "Away" : "Online"}
						</span>
					</div>
				))}

				{players.length === 0 && (
					<p className="text-gray-500 text-center py-4">
						No players have joined yet
					</p>
				)}
			</div>
		</div>
	);
}
