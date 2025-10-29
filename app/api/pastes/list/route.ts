import { NextResponse } from 'next/server'
import { db } from '@/server/db'
import { pastes, users, comments, pasteReactions } from '@/shared/schema'
import { desc, eq, sql } from 'drizzle-orm'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get pastes with author info, comment count, and reaction counts
    const allPastes = await db
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
      .groupBy(pastes.id, users.id)
      .orderBy(desc(pastes.createdAt))
      .limit(limit)
      .offset(offset)

    return NextResponse.json({ pastes: allPastes })
  } catch (error) {
    console.error('List pastes error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
