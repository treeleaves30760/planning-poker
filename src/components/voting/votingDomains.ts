export const votingDomains = [
	{
		dimension: "uncertainty" as const,
		title: "Uncertainty",
		colorScheme: {
			title: "text-blue-600",
			low: "bg-blue-100 text-blue-800",
			mid: "bg-blue-200 text-blue-800",
			high: "bg-blue-300 text-blue-800",
		},
	},
	{
		dimension: "complexity" as const,
		title: "Complexity",
		colorScheme: {
			title: "text-green-600",
			low: "bg-green-100 text-green-800",
			mid: "bg-green-200 text-green-800",
			high: "bg-green-300 text-green-800",
		},
	},
	{
		dimension: "effort" as const,
		title: "Effort",
		colorScheme: {
			title: "text-purple-600",
			low: "bg-purple-100 text-purple-800",
			mid: "bg-purple-200 text-purple-800",
			high: "bg-purple-300 text-purple-800",
		},
	},
];

export type VotingDomain = typeof votingDomains[0];
export type DimensionType = VotingDomain["dimension"];
export type LevelType = "low" | "mid" | "high";