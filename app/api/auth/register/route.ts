import { NextResponse } from 'next/server'
import { db } from '@/server/db'
import { users } from '@/shared/schema'
import bcrypt from 'bcryptjs'
import { createSession } from '@/server/auth'
import { eq } from 'drizzle-orm'

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.username, username)).limit(1)
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      )
    }

    const existingEmail = await db.select().from(users).where(eq(users.email, email)).limit(1)
    if (existingEmail.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const [newUser] = await db.insert(users).values({
      username,
      email,
      passwordHash,
      role: 'User',
    }).returning()

    // Create session
    await createSession({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    })

    return NextResponse.json({
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        avatar: newUser.avatar,
        bio: newUser.bio,
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
