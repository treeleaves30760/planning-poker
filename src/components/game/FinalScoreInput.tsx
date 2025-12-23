"use client";

interface FinalScoreInputProps {
	taskId: string;
	modeScore: number | null;
	currentFinalScore?: number;
	onSetFinalScore: (taskId: string, score: number) => void;
	variant?: "primary" | "secondary";
}

export default function FinalScoreInput({
	taskId,
	modeScore,
	currentFinalScore,
	onSetFinalScore,
	variant = "primary",
}: FinalScoreInputProps) {
	const defaultScore = currentFinalScore ?? modeScore ?? "";

	const handleSetScore = (input: HTMLInputElement) => {
		const value = parseFloat(input.value);
		if (!isNaN(value)) {
			onSetFinalScore(taskId, value);
		}
	};

	const isPrimary = variant === "primary";

	return (
		<div
			className={`${
				isPrimary
					? "mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
					: "mt-3 p-2 bg-gray-100 rounded"
			}`}
		>
			<h4
				className={`font-semibold mb-2 ${
					isPrimary ? "text-yellow-800" : "text-sm text-gray-700 mb-1"
				}`}
			>
				Set Final Score
			</h4>
			<p
				className={`${
					isPrimary
						? "text-xs text-yellow-700 mb-2"
						: "text-xs text-gray-600 mb-1"
				}`}
			>
				Most common score: {modeScore ?? "N/A"}
			</p>
			<div className="flex items-center gap-2">
				<input
					type="number"
					step="0.1"
					placeholder="Final score..."
					defaultValue={defaultScore}
					className={`${
						isPrimary
							? "px-3 py-1 border border-gray-300 rounded text-sm w-32"
							: "px-2 py-1 border border-gray-300 rounded text-xs w-24"
					} text-gray-900`}
					onKeyPress={(e) => {
						if (e.key === "Enter") {
							handleSetScore(e.target as HTMLInputElement);
						}
					}}
				/>
				<button
					onClick={(e) => {
						const input = (e.target as HTMLElement).parentElement?.querySelector(
							"input"
						) as HTMLInputElement;
						handleSetScore(input);
					}}
					className={`${
						isPrimary
							? "px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
							: "px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
					}`}
				>
					Set
				</button>
				{currentFinalScore && (
					<span className="text-sm text-gray-600">
						Current: <strong>{currentFinalScore}</strong>
					</span>
				)}
			</div>
		</div>
	);
}
