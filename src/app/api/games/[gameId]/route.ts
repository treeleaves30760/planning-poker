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

async function getGameFilePath(gameId: string) {
  await ensureGamesDir();
  return path.join(GAMES_DIR, `${gameId}.json`);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const filePath = await getGameFilePath(gameId);
    
    const data = await fs.readFile(filePath, 'utf8');
    const game: Game = JSON.parse(data);
    
    return NextResponse.json(game);
  } catch (error) {
    console.error('Error reading game:', error);
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const game: Game = await request.json();
    const filePath = await getGameFilePath(gameId);
    
    await fs.writeFile(filePath, JSON.stringify(game, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving game:', error);
    return NextResponse.json({ error: 'Failed to save game' }, { status: 500 });
  }
}