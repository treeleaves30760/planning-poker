import { NextRequest, NextResponse } from 'next/server';
import { dbManager } from '@/lib/database';

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
    
    const game = dbManager.getGame(gameId);
    
    if (!game) {
      return NextResponse.json({ error: 'Game not found or invalid' }, { status: 404 });
    }
    
    const isValid = game.adminPassword === password;
    
    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error('Error verifying admin password:', error);
    return NextResponse.json({ error: 'Game not found or invalid' }, { status: 404 });
  }
}