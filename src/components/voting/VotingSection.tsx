import { votingDomains, DimensionType, LevelType } from "./votingDomains";

interface CurrentVote {
	uncertainty: LevelType | null;
	complexity: LevelType | null;
	effort: LevelType | null;
}

interface VotingSectionProps {
	currentVote: CurrentVote;
	hasVoted: boolean;
	canChangeVote: boolean;
	isVoting: boolean;
	onVoteChange: (dimension: DimensionType, level: LevelType) => void;
	onStartVoting: () => void;
	onSubmitVote: () => void;
	totalScore: number;
}

interface LevelButtonProps {
	dimension: DimensionType;
	level: LevelType;
	color: string;
	isSelected: boolean;
	canVote: boolean;
	onClick: () => void;
}

function LevelButton({ dimension, level, color, isSelected, canVote, onClick }: LevelButtonProps) {
	return (
		<button
			onClick={onClick}
			disabled={!canVote}
			className={`p-3 rounded-lg border-2 transition-all ${
				isSelected
					? `${color} border-current`
					: canVote
					? `border-gray-300 hover:${color} hover:border-current`
					: "border-gray-200 bg-gray-100"
			} ${!canVote ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
		>
			<div className="text-sm font-semibold capitalize">{level}</div>
		</button>
	);
}

interface VotingDomainProps {
	dimension: DimensionType;
	title: string;
	colorScheme: {
		title: string;
		low: string;
		mid: string;
		high: string;
	};
	currentVote: CurrentVote;
	hasVoted: boolean;
	canChangeVote: boolean;
	isVoting: boolean;
	onVoteChange: (dimension: DimensionType, level: LevelType) => void;
	onStartVoting: () => void;
}

function VotingDomain({
	dimension,
	title,
	colorScheme,
	currentVote,
	hasVoted,
	canChangeVote,
	isVoting,
	onVoteChange,
	onStartVoting,
}: VotingDomainProps) {
	const canVote = !hasVoted || canChangeVote;

	const handleClick = (level: LevelType) => {
		if (canVote) {
			onVoteChange(dimension, level);
			// Mark as voting when user starts making selections
			if (!hasVoted && !isVoting) {
				onStartVoting();
			}
		}
	};

	return (
		<div>
			<h4 className={`text-lg font-medium mb-4 ${colorScheme.title} text-center`}>
				{title}
			</h4>
			<div className="grid grid-cols-3 gap-2">
				<LevelButton
					dimension={dimension}
					level="low"
					color={colorScheme.low}
					isSelected={currentVote[dimension] === "low"}
					canVote={canVote}
					onClick={() => handleClick("low")}
				/>
				<LevelButton
					dimension={dimension}
					level="mid"
					color={colorScheme.mid}
					isSelected={currentVote[dimension] === "mid"}
					canVote={canVote}
					onClick={() => handleClick("mid")}
				/>
				<LevelButton
					dimension={dimension}
					level="high"
					color={colorScheme.high}
					isSelected={currentVote[dimension] === "high"}
					canVote={canVote}
					onClick={() => handleClick("high")}
				/>
			</div>
		</div>
	);
}

export default function VotingSection({
	currentVote,
	hasVoted,
	canChangeVote,
	isVoting,
	onVoteChange,
	onStartVoting,
	onSubmitVote,
	totalScore,
}: VotingSectionProps) {
	const isVoteComplete = currentVote.uncertainty && currentVote.complexity && currentVote.effort;

	return (
		<div className="bg-white rounded-lg shadow-md p-6 text-gray-900">
			<h3 className="text-xl font-semibold mb-6">Rate the Task</h3>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{votingDomains.map((domain) => (
					<VotingDomain
						key={domain.dimension}
						dimension={domain.dimension}
						title={domain.title}
						colorScheme={domain.colorScheme}
						currentVote={currentVote}
						hasVoted={hasVoted}
						canChangeVote={canChangeVote}
						isVoting={isVoting}
						onVoteChange={onVoteChange}
						onStartVoting={onStartVoting}
					/>
				))}
			</div>

			<div className="mt-8 text-center">
				<div className="mb-6">
					<div className="text-lg text-gray-600 mb-2">
						Current Selection Score:
					</div>
					<div className="text-4xl font-bold text-blue-600 mb-4">
						{totalScore}
					</div>
					{isVoteComplete && (
						<div className="text-sm text-gray-500">
							{currentVote.uncertainty} × {currentVote.complexity} ×{" "}
							{currentVote.effort}
						</div>
					)}
				</div>

				{(!hasVoted || canChangeVote) && (
					<button
						onClick={onSubmitVote}
						disabled={!isVoteComplete}
						className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
					>
						{hasVoted ? "Update Vote" : "Submit Vote"}
					</button>
				)}

				{hasVoted && !canChangeVote && (
					<div className="text-green-600 font-semibold">
						✓ Vote submitted! Waiting for results...
					</div>
				)}
			</div>
		</div>
	);
}