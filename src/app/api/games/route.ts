import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Game } from '@/types/game';

const GAMES_DIR = path.join(process.cwd(), 'data', 'games');

async function ensureGamesDir() {
  try {
    await fs.access(GAMES_DIR);
  } catch {
    await fs.mkdir(GAMES_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const game: Game = await request.json();
    await ensureGamesDir();
    
    const filePath = path.join(GAMES_DIR, `${game.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(game, null, 2));
    
    return NextResponse.json({ success: true, gameId: game.id });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}