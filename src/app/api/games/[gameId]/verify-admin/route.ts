import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Game } from '@/types/game';

const GAMES_DIR = path.join(process.cwd(), 'data', 'games');

async function getGameFilePath(gameId: string) {
  return path.join(GAMES_DIR, `${gameId}.json`);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }
    
    const filePath = await getGameFilePath(gameId);
    const data = await fs.readFile(filePath, 'utf8');
    const game: Game = JSON.parse(data);
    
    const isValid = game.adminPassword === password;
    
    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error('Error verifying admin password:', error);
    return NextResponse.json({ error: 'Game not found or invalid' }, { status: 404 });
  }
}