'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScoreConfig } from '@/types/game';
import defaultScores from '@/data/defaultScores.json';

export default function AdminPage() {
  const router = useRouter();
  const [scoreConfig, setScoreConfig] = useState<ScoreConfig>(defaultScores);
  const [gameName, setGameName] = useState('');

  const handleScoreChange = (
    dimension: keyof ScoreConfig,
    level: 'low' | 'mid' | 'high',
    value: number
  ) => {
    setScoreConfig(prev => ({
      ...prev,
      [dimension]: {
        ...prev[dimension],
        [level]: value
      }
    }));
  };

  const resetToDefaults = () => {
    setScoreConfig(defaultScores);
  };

  const createGame = async () => {
    if (!gameName.trim()) {
      alert('Please enter a game name');
      return;
    }

    const gameId = Math.random().toString(36).substring(2, 11);
    const adminId = Math.random().toString(36).substring(2, 11);
    
    const gameData = {
      id: gameId,
      name: gameName,
      adminId,
      scoreConfig,
      users: [],
      currentTask: null,
      tasks: [],
      isActive: true,
      createdAt: new Date()
    };

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData),
      });

      if (response.ok) {
        localStorage.setItem('currentAdminId', adminId);
        router.push(`/game/${gameId}/admin`);
      } else {
        alert('Failed to create game. Please try again.');
      }
    } catch (error) {
      alert('Failed to create game. Please try again.');
    }
  };

  const ScoreInput = ({ 
    dimension, 
    level, 
    value 
  }: { 
    dimension: keyof ScoreConfig; 
    level: 'low' | 'mid' | 'high'; 
    value: number; 
  }) => (
    <input
      type="number"
      min="0"
      max="100"
      value={value}
      onChange={(e) => handleScoreChange(dimension, level, parseInt(e.target.value) || 0)}
      className="w-16 p-2 border border-gray-300 rounded text-center"
    />
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Story Point Party - Admin Setup
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Scoring Configuration</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Dimension</th>
                  <th className="text-center py-2">Low</th>
                  <th className="text-center py-2">Mid</th>
                  <th className="text-center py-2">High</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-4 font-medium text-blue-600">Uncertainty</td>
                  <td className="text-center">
                    <ScoreInput dimension="uncertainty" level="low" value={scoreConfig.uncertainty.low} />
                  </td>
                  <td className="text-center">
                    <ScoreInput dimension="uncertainty" level="mid" value={scoreConfig.uncertainty.mid} />
                  </td>
                  <td className="text-center">
                    <ScoreInput dimension="uncertainty" level="high" value={scoreConfig.uncertainty.high} />
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-4 font-medium text-green-600">Complexity</td>
                  <td className="text-center">
                    <ScoreInput dimension="complexity" level="low" value={scoreConfig.complexity.low} />
                  </td>
                  <td className="text-center">
                    <ScoreInput dimension="complexity" level="mid" value={scoreConfig.complexity.mid} />
                  </td>
                  <td className="text-center">
                    <ScoreInput dimension="complexity" level="high" value={scoreConfig.complexity.high} />
                  </td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-purple-600">Effort</td>
                  <td className="text-center">
                    <ScoreInput dimension="effort" level="low" value={scoreConfig.effort.low} />
                  </td>
                  <td className="text-center">
                    <ScoreInput dimension="effort" level="mid" value={scoreConfig.effort.mid} />
                  </td>
                  <td className="text-center">
                    <ScoreInput dimension="effort" level="high" value={scoreConfig.effort.high} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <button
            onClick={resetToDefaults}
            className="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reset to Defaults
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Game</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Game Name
            </label>
            <input
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="Enter game name..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={createGame}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Create Game
          </button>
        </div>
      </div>
    </div>
  );
}