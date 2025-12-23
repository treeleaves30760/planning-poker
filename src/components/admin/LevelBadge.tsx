type Level = "low" | "mid" | "high";
type DimensionType = "uncertainty" | "complexity" | "effort";

interface LevelBadgeProps {
	level: Level;
	dimension: DimensionType;
}

const colorClasses: Record<DimensionType, Record<Level, string>> = {
	uncertainty: {
		low: "bg-blue-100 text-blue-800",
		mid: "bg-blue-200 text-blue-800",
		high: "bg-blue-300 text-blue-800",
	},
	complexity: {
		low: "bg-green-100 text-green-800",
		mid: "bg-green-200 text-green-800",
		high: "bg-green-300 text-green-800",
	},
	effort: {
		low: "bg-purple-100 text-purple-800",
		mid: "bg-purple-200 text-purple-800",
		high: "bg-purple-300 text-purple-800",
	},
};

export default function LevelBadge({ level, dimension }: LevelBadgeProps) {
	return (
		<span
			className={`px-2 py-1 rounded text-xs font-medium ${colorClasses[dimension][level]}`}
		>
			{level}
		</span>
	);
}
