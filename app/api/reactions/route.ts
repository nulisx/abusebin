import { NextResponse } from 'next/server'
import { db } from '@/server/db'
import { pasteReactions } from '@/shared/schema'
import { and, eq } from 'drizzle-orm'
import { getSession } from '@/server/auth'

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pasteId, type } = await request.json()

    if (!pasteId || !type || !['like', 'dislike'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid parameters' },
        { status: 400 }
      )
    }

    // Check if user already reacted
    const existing = await db
      .select()
      .from(pasteReactions)
      .where(
        and(
          eq(pasteReactions.pasteId, pasteId),
          eq(pasteReactions.userId, session.id)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      // Update existing reaction
      if (existing[0].type === type) {
        // Remove reaction if same type
        await db
          .delete(pasteReactions)
          .where(
            and(
              eq(pasteReactions.pasteId, pasteId),
              eq(pasteReactions.userId, session.id)
            )
          )
        return NextResponse.json({ action: 'removed' })
      } else {
        // Change reaction type
        await db
          .update(pasteReactions)
          .set({ type })
          .where(
            and(
              eq(pasteReactions.pasteId, pasteId),
              eq(pasteReactions.userId, session.id)
            )
          )
        return NextResponse.json({ action: 'updated', type })
      }
    } else {
      // Create new reaction
      await db.insert(pasteReactions).values({
        pasteId,
        userId: session.id,
        type,
      })
      return NextResponse.json({ action: 'created', type })
    }
  } catch (error) {
    console.error('Reaction error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
