import { ScoreConfig, Vote } from '@/types/game';

export function calculateScore(
  uncertainty: 'low' | 'mid' | 'high',
  complexity: 'low' | 'mid' | 'high',
  effort: 'low' | 'mid' | 'high',
  scoreConfig: ScoreConfig
): number {
  // New combination-based scoring
  if (scoreConfig.combinations) {
    const key = `${uncertainty}-${complexity}-${effort}`;
    return scoreConfig.combinations[key] || 1;
  }
  
  // Legacy scoring for backward compatibility
  if (scoreConfig.uncertainty && scoreConfig.complexity && scoreConfig.effort) {
    return scoreConfig.uncertainty[uncertainty] + 
           scoreConfig.complexity[complexity] + 
           scoreConfig.effort[effort];
  }
  
  return 1;
}

export function getScoreForVote(vote: Vote, scoreConfig: ScoreConfig): number {
  return calculateScore(vote.uncertainty, vote.complexity, vote.effort, scoreConfig);
}

/**
 * Calculate the mode (most common score) from an array of votes
 * Returns the score that appears most frequently, or the first score if there's a tie
 * Returns undefined if there are no votes
 */
export function getModeScore(votes: Vote[], scoreConfig: ScoreConfig): number | undefined {
  if (votes.length === 0) {
    return undefined;
  }

  // Calculate scores for all votes
  const scores = votes.map(vote => getScoreForVote(vote, scoreConfig));

  // Count frequency of each score
  const frequencyMap = new Map<number, number>();
  for (const score of scores) {
    frequencyMap.set(score, (frequencyMap.get(score) || 0) + 1);
  }

  // Find the score with the highest frequency
  let modeScore = scores[0];
  let maxFrequency = 0;

  for (const [score, frequency] of frequencyMap.entries()) {
    if (frequency > maxFrequency) {
      maxFrequency = frequency;
      modeScore = score;
    }
  }

  return modeScore;
}