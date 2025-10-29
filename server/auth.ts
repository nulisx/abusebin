import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { db } from './db'
import { users } from '@/shared/schema'
import { eq } from 'drizzle-orm'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set. This is required for secure authentication.')
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export type SessionUser = {
  id: string
  username: string
  email: string
  role: string
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)

  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value

  if (!token) return null

  try {
    const verified = await jwtVerify(token, secret)
    const sessionUser = verified.payload.user as SessionUser

    // Verify user still exists and check current status
    const [currentUser] = await db.select().from(users).where(eq(users.id, sessionUser.id)).limit(1)
    
    if (!currentUser) {
      // User was deleted
      return null
    }

    if (currentUser.banned) {
      // User was banned after token was issued
      return null
    }

    // Return updated session with current role
    return {
      id: currentUser.id,
      username: currentUser.username,
      email: currentUser.email,
      role: currentUser.role,
    }
  } catch (error) {
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}
