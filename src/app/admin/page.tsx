"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScoreConfig } from "@/types/game";
import defaultFibonacciScores from "@/data/defaultFibonacciScores.json";
import ScoringConfigTable from "@/components/admin/ScoringConfigTable";
import GameCreationForm from "@/components/admin/GameCreationForm";

export default function AdminFibonacciPage() {
	const router = useRouter();
	const [scoreConfig, setScoreConfig] = useState<ScoreConfig>(
		defaultFibonacciScores
	);

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

	const handleGameCreated = (gameId: string, adminId: string) => {
		localStorage.setItem("currentAdminId", adminId);
		router.push(`/game/${gameId}/admin`);
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
					Story Point Party - Scoring Setup
				</h1>

				<ScoringConfigTable
					scoreConfig={scoreConfig}
					onScoreChange={handleScoreChange}
					onResetToDefaults={resetToDefaults}
				/>

				<GameCreationForm
					scoreConfig={scoreConfig}
					onGameCreated={handleGameCreated}
				/>
			</div>
		</div>
	);
}
