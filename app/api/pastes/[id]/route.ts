import { NextResponse } from 'next/server'
import { db } from '@/server/db'
import { pastes, users, comments, pasteReactions } from '@/shared/schema'
import { eq, and, sql } from 'drizzle-orm'
import { getSession } from '@/server/auth'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const [paste] = await db
      .select({
        id: pastes.id,
        title: pastes.title,
        content: pastes.content,
        authorId: pastes.authorId,
        views: pastes.views,
        isPinned: pastes.isPinned,
        createdAt: pastes.createdAt,
        updatedAt: pastes.updatedAt,
        author: {
          id: users.id,
          username: users.username,
          role: users.role,
          avatar: users.avatar,
          nameColor: users.nameColor,
        },
        commentCount: sql<number>`count(distinct ${comments.id})::int`,
        likeCount: sql<number>`count(distinct case when ${pasteReactions.type} = 'like' then ${pasteReactions.userId} end)::int`,
        dislikeCount: sql<number>`count(distinct case when ${pasteReactions.type} = 'dislike' then ${pasteReactions.userId} end)::int`,
      })
      .from(pastes)
      .leftJoin(users, eq(pastes.authorId, users.id))
      .leftJoin(comments, eq(pastes.id, comments.pasteId))
      .leftJoin(pasteReactions, eq(pastes.id, pasteReactions.pasteId))
      .where(eq(pastes.id, id))
      .groupBy(pastes.id, users.id)
      .limit(1)

    if (!paste) {
      return NextResponse.json({ error: 'Paste not found' }, { status: 404 })
    }

    // Increment view count
    await db.update(pastes)
      .set({ views: sql`${pastes.views} + 1` })
      .where(eq(pastes.id, id))

    return NextResponse.json({ paste })
  } catch (error) {
    console.error('Get paste error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { title, content, isPinned } = await request.json()

    const [paste] = await db.select().from(pastes).where(eq(pastes.id, id)).limit(1)
    
    if (!paste) {
      return NextResponse.json({ error: 'Paste not found' }, { status: 404 })
    }

    // Check if user is author or admin
    if (paste.authorId !== session.id && session.role !== 'Admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const [updated] = await db.update(pastes)
      .set({
        title: title ?? paste.title,
        content: content ?? paste.content,
        isPinned: isPinned ?? paste.isPinned,
        updatedAt: new Date(),
      })
      .where(eq(pastes.id, id))
      .returning()

    return NextResponse.json({ paste: updated })
  } catch (error) {
    console.error('Update paste error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const [paste] = await db.select().from(pastes).where(eq(pastes.id, id)).limit(1)
    
    if (!paste) {
      return NextResponse.json({ error: 'Paste not found' }, { status: 404 })
    }

    // Check if user is author or admin
    if (paste.authorId !== session.id && session.role !== 'Admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await db.delete(pastes).where(eq(pastes.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete paste error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
