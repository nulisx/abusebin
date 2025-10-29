import { NextResponse } from 'next/server'
import { db } from '@/server/db'
import { users } from '@/shared/schema'
import bcrypt from 'bcryptjs'
import { createSession } from '@/server/auth'
import { eq } from 'drizzle-orm'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find user
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if user is banned
    if (user.banned) {
      return NextResponse.json(
        { error: 'Account is banned' },
        { status: 403 }
      )
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash)
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Update last seen
    await db.update(users)
      .set({ lastSeen: new Date(), isOnline: true })
      .where(eq(users.id, user.id))

    // Create session
    await createSession({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    })

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        nameColor: user.nameColor,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
