import { NextResponse } from 'next/server'
import { db } from '@/server/db'
import { follows } from '@/shared/schema'
import { and, eq } from 'drizzle-orm'
import { getSession } from '@/server/auth'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    if (userId === session.id) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      )
    }

    // Check if already following
    const existing = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, session.id),
          eq(follows.followingId, userId)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      // Unfollow
      await db
        .delete(follows)
        .where(
          and(
            eq(follows.followerId, session.id),
            eq(follows.followingId, userId)
          )
        )
      return NextResponse.json({ action: 'unfollowed' })
    } else {
      // Follow
      await db.insert(follows).values({
        followerId: session.id,
        followingId: userId,
      })
      return NextResponse.json({ action: 'followed' })
    }
  } catch (error) {
    console.error('Follow error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
