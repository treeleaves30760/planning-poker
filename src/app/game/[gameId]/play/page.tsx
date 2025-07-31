'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Vote } from '@/types/game';
import { useGameState } from '@/hooks/useGameState';

export default function PlayGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  const { game, isLoading, error, loadGame, saveGame } = useGameState(gameId);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [currentVote, setCurrentVote] = useState<{
    uncertainty: 'low' | 'mid' | 'high' | null;
    complexity: 'low' | 'mid' | 'high' | null;
    effort: 'low' | 'mid' | 'high' | null;
  }>({
    uncertainty: null,
    complexity: null,
    effort: null
  });
  const [hasVoted, setHasVoted] = useState(false);

  const updateVoteState = useCallback(() => {
    if (game?.currentTask && userId) {
      const existingVote = game.currentTask.votes.find((v: Vote) => v.userId === userId);
      if (existingVote) {
        setCurrentVote({
          uncertainty: existingVote.uncertainty,
          complexity: existingVote.complexity,
          effort: existingVote.effort
        });
        setHasVoted(true);
      } else {
        setCurrentVote({
          uncertainty: null,
          complexity: null,
          effort: null
        });
        setHasVoted(false);
      }
    }
  }, [game, userId]);

  useEffect(() => {
    const storedUserId = localStorage.getItem('currentUserId');
    const storedUsername = localStorage.getItem('currentUsername');
    
    if (!storedUserId) {
      router.push(`/game/${gameId}/join`);
      return;
    }
    
    setUserId(storedUserId);
    setUsername(storedUsername);
  }, [gameId, router]);

  useEffect(() => {
    updateVoteState();
  }, [updateVoteState]);

  useEffect(() => {
    if (userId) {
      const interval = setInterval(() => {
        loadGame();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loadGame, userId]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (game && userId) {
        const updatedUsers = game.users.filter(u => u.id !== userId);
        const updatedGame = { ...game, users: updatedUsers };
        saveGame(updatedGame).catch(console.error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [game, userId, saveGame]);

  const calculateTotalScore = () => {
    if (!game || !currentVote.uncertainty || !currentVote.complexity || !currentVote.effort) {
      return 0;
    }
    
    return game.scoreConfig.uncertainty[currentVote.uncertainty] +
           game.scoreConfig.complexity[currentVote.complexity] +
           game.scoreConfig.effort[currentVote.effort];
  };

  const submitVote = async () => {
    if (!game || !userId || !username || !currentVote.uncertainty || !currentVote.complexity || !currentVote.effort) {
      return;
    }

    const newVote: Vote = {
      userId,
      username,
      uncertainty: currentVote.uncertainty,
      complexity: currentVote.complexity,
      effort: currentVote.effort,
      totalScore: calculateTotalScore()
    };

    const existingVoteIndex = game.currentTask?.votes.findIndex(v => v.userId === userId) ?? -1;
    let updatedVotes;
    
    if (existingVoteIndex >= 0) {
      updatedVotes = [...(game.currentTask?.votes ?? [])];
      updatedVotes[existingVoteIndex] = newVote;
    } else {
      updatedVotes = [...(game.currentTask?.votes ?? []), newVote];
    }

    const updatedTask = game.currentTask ? {
      ...game.currentTask,
      votes: updatedVotes
    } : null;

    const updatedGame = {
      ...game,
      currentTask: updatedTask,
      tasks: game.tasks.map(t => t.id === updatedTask?.id ? updatedTask : t)
    };

    try {
      await saveGame(updatedGame);
      setHasVoted(true);
    } catch (err) {
      console.error('Failed to submit vote:', err);
    }
  };

  const canChangeVote = game?.currentTask?.revealed && game?.currentTask?.allowChanges;

  const LevelButton = ({ 
    dimension, 
    level, 
    score, 
    color 
  }: { 
    dimension: 'uncertainty' | 'complexity' | 'effort'; 
    level: 'low' | 'mid' | 'high'; 
    score: number;
    color: string;
  }) => {
    const isSelected = currentVote[dimension] === level;
    const canVote = !hasVoted || canChangeVote;
    
    return (
      <button
        onClick={() => canVote && setCurrentVote(prev => ({ ...prev, [dimension]: level }))}
        disabled={!canVote}
        className={`p-4 rounded-lg border-2 transition-all ${
          isSelected 
            ? `${color} border-current` 
            : canVote 
              ? `border-gray-300 hover:${color} hover:border-current` 
              : 'border-gray-200 bg-gray-100'
        } ${!canVote ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        <div className="text-lg font-semibold capitalize">{level}</div>
        <div className="text-sm">Score: {score}</div>
      </button>
    );
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center">Error: {error}</div>;
  }

  if (!game) {
    return <div className="min-h-screen flex items-center justify-center">Game not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{game.name}</h1>
          <p className="text-gray-600">Welcome, {username}!</p>
          <p className="text-gray-600">Players: {game.users.length}</p>
        </div>

        {!game.currentTask ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Waiting for Next Task</h2>
            <p className="text-gray-600">The admin will add a task shortly...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4">Current Task</h2>
              <p className="text-lg text-gray-700 leading-relaxed">{game.currentTask.description}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-6">Rate the Task</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-lg font-medium mb-4 text-blue-600">Uncertainty</h4>
                  <div className="space-y-3">
                    <LevelButton 
                      dimension="uncertainty" 
                      level="low" 
                      score={game.scoreConfig.uncertainty.low}
                      color="bg-blue-100 text-blue-800"
                    />
                    <LevelButton 
                      dimension="uncertainty" 
                      level="mid" 
                      score={game.scoreConfig.uncertainty.mid}
                      color="bg-blue-200 text-blue-800"
                    />
                    <LevelButton 
                      dimension="uncertainty" 
                      level="high" 
                      score={game.scoreConfig.uncertainty.high}
                      color="bg-blue-300 text-blue-800"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium mb-4 text-green-600">Complexity</h4>
                  <div className="space-y-3">
                    <LevelButton 
                      dimension="complexity" 
                      level="low" 
                      score={game.scoreConfig.complexity.low}
                      color="bg-green-100 text-green-800"
                    />
                    <LevelButton 
                      dimension="complexity" 
                      level="mid" 
                      score={game.scoreConfig.complexity.mid}
                      color="bg-green-200 text-green-800"
                    />
                    <LevelButton 
                      dimension="complexity" 
                      level="high" 
                      score={game.scoreConfig.complexity.high}
                      color="bg-green-300 text-green-800"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-medium mb-4 text-purple-600">Effort</h4>
                  <div className="space-y-3">
                    <LevelButton 
                      dimension="effort" 
                      level="low" 
                      score={game.scoreConfig.effort.low}
                      color="bg-purple-100 text-purple-800"
                    />
                    <LevelButton 
                      dimension="effort" 
                      level="mid" 
                      score={game.scoreConfig.effort.mid}
                      color="bg-purple-200 text-purple-800"
                    />
                    <LevelButton 
                      dimension="effort" 
                      level="high" 
                      score={game.scoreConfig.effort.high}
                      color="bg-purple-300 text-purple-800"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <div className="mb-4">
                  <span className="text-2xl font-bold">Total Score: {calculateTotalScore()}</span>
                </div>
                
                {(!hasVoted || canChangeVote) && (
                  <button
                    onClick={submitVote}
                    disabled={!currentVote.uncertainty || !currentVote.complexity || !currentVote.effort}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
                  >
                    {hasVoted ? 'Update Vote' : 'Submit Vote'}
                  </button>
                )}
                
                {hasVoted && !canChangeVote && (
                  <div className="text-green-600 font-semibold">
                    ✓ Vote submitted! Waiting for results...
                  </div>
                )}
              </div>
            </div>

            {game.currentTask.revealed && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {game.currentTask.votes.map(vote => (
                    <div key={vote.userId} className="p-4 border rounded-lg">
                      <div className="font-semibold mb-2">{vote.username}</div>
                      <div className="space-y-1 text-sm">
                        <div>Uncertainty: <span className="font-medium">{vote.uncertainty}</span></div>
                        <div>Complexity: <span className="font-medium">{vote.complexity}</span></div>
                        <div>Effort: <span className="font-medium">{vote.effort}</span></div>
                        <div className="font-bold">Total: {vote.totalScore}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}