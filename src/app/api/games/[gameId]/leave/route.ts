import { NextRequest, NextResponse } from 'next/server';
import { dbManager } from '@/lib/database';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Remove user from database
    const success = dbManager.removeUser(userId, gameId);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to remove user' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error removing user:', error);
    return NextResponse.json({ error: 'Failed to remove user' }, { status: 500 });
  }
}
