"use client";

import { User } from "@/types/game";
import { useState } from "react";

interface OnlinePlayerListProps {
	users: User[];
	currentUserId: string | null;
}

export default function OnlinePlayerList({ users, currentUserId }: OnlinePlayerListProps) {
	const [isCollapsed, setIsCollapsed] = useState(false);
	
	// Filter out admin users
	const players = users.filter(user => !user.isAdmin);

	return (
		<div className="fixed left-4 top-1/2 -translate-y-1/2 z-50">
			<div className="bg-white rounded-lg shadow-lg border border-gray-200 min-w-48 max-w-64">
				{/* Header */}
				<div className="flex items-center justify-between p-3 border-b border-gray-100">
					<h3 className="text-sm font-semibold text-gray-900">
						Online Players ({players.length})
					</h3>
					<button
						onClick={() => setIsCollapsed(!isCollapsed)}
						className="text-gray-500 hover:text-gray-700 transition-colors"
						aria-label={isCollapsed ? "Expand player list" : "Collapse player list"}
					>
						<svg
							className={`w-4 h-4 transition-transform ${
								isCollapsed ? "rotate-180" : ""
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

				{/* Player List */}
				{!isCollapsed && (
					<div className="p-2 max-h-64 overflow-y-auto">
						{players.length === 0 ? (
							<div className="text-sm text-gray-500 text-center py-2">
								No players online
							</div>
						) : (
							<div className="space-y-1">
								{players.map((user) => (
									<div
										key={user.id}
										className={`flex items-center gap-2 p-2 rounded-md text-sm ${
											user.id === currentUserId
												? "bg-blue-50 text-blue-900"
												: "text-gray-700 hover:bg-gray-50"
										}`}
									>
										{/* Status indicator */}
										<div className={`w-2 h-2 rounded-full flex-shrink-0 ${
											user.status === "away" ? "bg-yellow-400" : "bg-green-400"
										}`}></div>
										
										{/* Username */}
										<span className="truncate flex-1">
											{user.username}
											{user.id === currentUserId && " (You)"}
										</span>
										
										{/* Admin badge */}
										{user.isAdmin && (
											<span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
												Admin
											</span>
										)}
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}