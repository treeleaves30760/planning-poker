import { useState, useEffect, useCallback } from 'react';
import { Game } from '@/types/game';

export function useGameState(gameId: string) {
  const [game, setGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGame = useCallback(async () => {
    try {
      const response = await fetch(`/api/games/${gameId}`);
      if (response.ok) {
        const gameData = await response.json();
        // Migration: Add completedTasks if it doesn't exist
        if (!gameData.completedTasks) {
          gameData.completedTasks = [];
        }
        setGame(gameData);
        setError(null);
      } else {
        setError('Game not found');
        setGame(null);
      }
    } catch (err) {
      setError('Failed to load game');
      setGame(null);
    } finally {
      setIsLoading(false);
    }
  }, [gameId]);

  const saveGame = useCallback(async (updatedGame: Game) => {
    try {
      const response = await fetch(`/api/games/${gameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedGame),
      });

      if (response.ok) {
        setGame(updatedGame);
        setError(null);
      } else {
        setError('Failed to save game');
      }
    } catch (err) {
      setError('Failed to save game');
    }
  }, [gameId]);

  const createGame = useCallback(async (gameData: Game) => {
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData),
      });

      if (response.ok) {
        setGame(gameData);
        setError(null);
        return true;
      } else {
        setError('Failed to create game');
        return false;
      }
    } catch (err) {
      setError('Failed to create game');
      return false;
    }
  }, []);

  useEffect(() => {
    if (gameId) {
      loadGame();
    }
  }, [gameId, loadGame]);

  return {
    game,
    isLoading,
    error,
    loadGame,
    saveGame,
    createGame,
  };
}