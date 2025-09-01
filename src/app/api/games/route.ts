import { NextRequest, NextResponse } from 'next/server';
import { Game } from '@/types/game';
import { dbManager } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const game: Game = await request.json();
    
    const success = dbManager.createGame(game);
    
    if (success) {
      return NextResponse.json({ success: true, gameId: game.id });
    } else {
      return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}