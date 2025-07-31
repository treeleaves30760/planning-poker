import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Story Point Party
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Collaborative task difficulty estimation for agile teams
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
          <Link
            href="/admin-fibonacci"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create New Game - Fibonacci Scoring (Recommended)
          </Link>
          
          <Link
            href="/admin"
            className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create New Game - Legacy Scoring
          </Link>
          
          <div className="text-center text-gray-500">
            <p className="text-sm">
              Already have a game ID? Enter it in the URL:
            </p>
            <p className="text-xs text-gray-400 mt-1">
              /game/[gameId]/join
            </p>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">How it works:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>Admin creates a game and sets scoring configuration</li>
            <li>Players join using the game ID</li>
            <li>Admin adds task descriptions</li>
            <li>Players vote on Uncertainty, Complexity, and Effort</li>
            <li>Admin reveals results and can allow vote changes</li>
            <li>Continue with next tasks</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
