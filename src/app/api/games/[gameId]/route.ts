import { NextRequest, NextResponse } from 'next/server';
import { Game } from '@/types/game';
import { dbManager } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const game = dbManager.getGame(gameId);
    
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
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
    
    // Ensure the game ID matches
    game.id = gameId;
    
    const success = dbManager.updateGame(game);
    
    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to save game' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error saving game:', error);
    return NextResponse.json({ error: 'Failed to save game' }, { status: 500 });
  }
}