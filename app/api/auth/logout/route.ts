import { NextResponse } from 'next/server'
import { deleteSession, getSession } from '@/server/auth'
import { db } from '@/server/db'
import { users } from '@/shared/schema'
import { eq } from 'drizzle-orm'

export async function POST() {
  try {
    const session = await getSession()
    
    if (session) {
      // Update user's online status
      await db.update(users)
        .set({ isOnline: false, lastSeen: new Date() })
        .where(eq(users.id, session.id))
    }

    await deleteSession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
