import { NextResponse } from 'next/server'
import { db } from '@/server/db'
import { pastes } from '@/shared/schema'
import { getSession } from '@/server/auth'
import { eq } from 'drizzle-orm'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content } = await request.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate slug from title
    let slug = slugify(title)
    let counter = 1
    
    // Ensure unique slug
    while (true) {
      const existing = await db.select().from(pastes).where(eq(pastes.id, slug)).limit(1)
      if (existing.length === 0) break
      slug = `${slugify(title)}-${counter}`
      counter++
    }

    const [newPaste] = await db.insert(pastes).values({
      id: slug,
      title,
      content,
      authorId: session.id,
    }).returning()

    return NextResponse.json({ paste: newPaste })
  } catch (error) {
    console.error('Create paste error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
