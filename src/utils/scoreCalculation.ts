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