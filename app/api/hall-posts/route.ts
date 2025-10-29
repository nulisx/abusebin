import { NextResponse } from 'next/server'
import { db } from '@/server/db'
import { hallPosts, users } from '@/shared/schema'
import { desc, eq } from 'drizzle-orm'
import { getSession } from '@/server/auth'

export async function GET() {
  try {
    const posts = await db
      .select({
        id: hallPosts.id,
        content: hallPosts.content,
        mediaUrl: hallPosts.mediaUrl,
        doxLink: hallPosts.doxLink,
        isPinned: hallPosts.isPinned,
        createdAt: hallPosts.createdAt,
        author: {
          id: users.id,
          username: users.username,
          role: users.role,
          avatar: users.avatar,
          nameColor: users.nameColor,
        },
      })
      .from(hallPosts)
      .leftJoin(users, eq(hallPosts.authorId, users.id))
      .orderBy(desc(hallPosts.isPinned), desc(hallPosts.createdAt))

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Get hall posts error:', error)
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

    // Only admins can post to hall
    if (session.role !== 'Admin' && session.role !== 'Manager') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { content, mediaUrl, doxLink, isPinned } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const [newPost] = await db.insert(hallPosts).values({
      authorId: session.id,
      content,
      mediaUrl: mediaUrl || null,
      doxLink: doxLink || null,
      isPinned: isPinned || false,
    }).returning()

    return NextResponse.json({ post: newPost })
  } catch (error) {
    console.error('Create hall post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
