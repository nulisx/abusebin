import { NextResponse } from 'next/server'
import { db } from '@/server/db'
import { comments, users } from '@/shared/schema'
import { eq, desc } from 'drizzle-orm'
import { getSession } from '@/server/auth'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const pasteId = searchParams.get('pasteId')

    if (!pasteId) {
      return NextResponse.json(
        { error: 'Missing pasteId parameter' },
        { status: 400 }
      )
    }

    const pasteComments = await db
      .select({
        id: comments.id,
        content: comments.content,
        pasteId: comments.pasteId,
        parentId: comments.parentId,
        createdAt: comments.createdAt,
        author: {
          id: users.id,
          username: users.username,
          role: users.role,
          avatar: users.avatar,
          nameColor: users.nameColor,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.pasteId, pasteId))
      .orderBy(desc(comments.createdAt))

    return NextResponse.json({ comments: pasteComments })
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pasteId, content, parentId } = await request.json()

    if (!pasteId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const [newComment] = await db.insert(comments).values({
      pasteId,
      content,
      authorId: session.id,
      parentId: parentId || null,
    }).returning()

    return NextResponse.json({ comment: newComment })
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
