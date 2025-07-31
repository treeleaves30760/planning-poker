'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Game, Task, Vote } from '@/types/game';
import { useGameState } from '@/hooks/useGameState';

export default function AdminGamePage() {
  const params = useParams();
  const gameId = params.gameId as string;
  const { game, isLoading, error, loadGame, saveGame } = useGameState(gameId);
  const [taskDescription, setTaskDescription] = useState('');

  useEffect(() => {
    const interval = setInterval(loadGame, 2000);
    return () => clearInterval(interval);
  }, [loadGame]);

  const addTask = () => {
    if (!taskDescription.trim() || !game) return;

    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      description: taskDescription,
      votes: [],
      revealed: false,
      allowChanges: false
    };

    const updatedGame = {
      ...game,
      currentTask: newTask,
      tasks: [...game.tasks, newTask]
    };

    saveGame(updatedGame);
    setTaskDescription('');
  };

  const revealVotes = () => {
    if (!game?.currentTask) return;

    const updatedTask = { ...game.currentTask, revealed: true };
    const updatedGame = {
      ...game,
      currentTask: updatedTask,
      tasks: game.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
    };

    saveGame(updatedGame);
  };

  const allowChanges = () => {
    if (!game?.currentTask) return;

    const updatedTask = { ...game.currentTask, allowChanges: true };
    const updatedGame = {
      ...game,
      currentTask: updatedTask,
      tasks: game.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
    };

    saveGame(updatedGame);
  };

  const nextQuestion = () => {
    if (!game) return;

    const updatedGame = {
      ...game,
      currentTask: null
    };

    saveGame(updatedGame);
    setTaskDescription('');
  };

  const getScoreForVote = (vote: Vote) => {
    if (!game) return 0;
    const { scoreConfig } = game;
    return scoreConfig.uncertainty[vote.uncertainty] +
           scoreConfig.complexity[vote.complexity] +
           scoreConfig.effort[vote.effort];
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
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{game.name} - Admin Panel</h1>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-sm font-medium text-blue-900 mb-2">Share this link for players to join:</p>
            <div className="flex items-center gap-2">
              <code className="bg-white px-3 py-2 rounded border text-sm font-mono flex-1">
                {typeof window !== 'undefined' ? `${window.location.origin}/game/${gameId}/join` : `/game/${gameId}/join`}
              </code>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/game/${gameId}/join`;
                  navigator.clipboard.writeText(url);
                  alert('Join URL copied to clipboard!');
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Copy
              </button>
            </div>
          </div>
          <p className="text-gray-600 mt-2">Game ID: {gameId}</p>
          <p className="text-gray-600">Active Users: {game.users.length}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Add Task</h2>
            
            <div className="mb-4">
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Enter task description..."
                className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={addTask}
              disabled={!taskDescription.trim()}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              Add Task
            </button>

            {game.currentTask && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Current Task:</h3>
                <p className="text-gray-700 mb-4">{game.currentTask.description}</p>
                
                <div className="flex gap-2 flex-wrap">
                  {!game.currentTask.revealed && (
                    <button
                      onClick={revealVotes}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Reveal Votes
                    </button>
                  )}
                  
                  {game.currentTask.revealed && !game.currentTask.allowChanges && (
                    <button
                      onClick={allowChanges}
                      className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    >
                      Allow Changes
                    </button>
                  )}
                  
                  <button
                    onClick={nextQuestion}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Next Question
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Active Users</h2>
            
            <div className="space-y-2">
              {game.users.map(user => (
                <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">{user.username}</span>
                  <span className={`px-2 py-1 rounded text-xs ${user.isAdmin ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    {user.isAdmin ? 'Admin' : 'User'}
                  </span>
                </div>
              ))}
              
              {game.users.length === 0 && (
                <p className="text-gray-500 text-center py-4">No users have joined yet</p>
              )}
            </div>
          </div>
        </div>

        {game.currentTask && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Voting Results</h2>
            
            {game.currentTask.votes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No votes submitted yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">User</th>
                      <th className="text-center py-2">Uncertainty</th>
                      <th className="text-center py-2">Complexity</th>
                      <th className="text-center py-2">Effort</th>
                      <th className="text-center py-2">Total Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {game.currentTask.votes.map(vote => (
                      <tr key={vote.userId} className="border-b">
                        <td className="py-2 font-medium">{vote.username}</td>
                        <td className="text-center">
                          {game.currentTask?.revealed ? (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                              {vote.uncertainty} ({game.scoreConfig.uncertainty[vote.uncertainty]})
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-sm">Hidden</span>
                          )}
                        </td>
                        <td className="text-center">
                          {game.currentTask?.revealed ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                              {vote.complexity} ({game.scoreConfig.complexity[vote.complexity]})
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-sm">Hidden</span>
                          )}
                        </td>
                        <td className="text-center">
                          {game.currentTask?.revealed ? (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                              {vote.effort} ({game.scoreConfig.effort[vote.effort]})
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-sm">Hidden</span>
                          )}
                        </td>
                        <td className="text-center font-bold">
                          {game.currentTask?.revealed ? getScoreForVote(vote) : '?'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}