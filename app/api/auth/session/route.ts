import { NextResponse } from 'next/server'
import { getSession } from '@/server/auth'
import { db } from '@/server/db'
import { users } from '@/shared/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ user: null })
    }

    // Get fresh user data from database
    const [user] = await db.select().from(users).where(eq(users.id, session.id)).limit(1)
    
    if (!user) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        nameColor: user.nameColor,
        banned: user.banned,
        isOnline: user.isOnline,
      },
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
