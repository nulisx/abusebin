import { db } from './db'
import { users, pastes, comments } from '@/shared/schema'
import bcrypt from 'bcryptjs'

async function seed() {
  console.log('🌱 Seeding database...')

  // Hash passwords and create users
  const mockUsers = [
    {
      username: 'wounds',
      email: 'wounds@example.com',
      password: 'feddingzone',
      role: 'Admin' as const,
      avatar: '/images/design-mode/ezqzq0.png',
      bio: '@rapingteenagers on dc',
      uid: 1,
      createdAt: new Date('2001-09-11'),
      joinedAt: new Date('2001-09-11'),
    },
    {
      username: 'dismayings',
      email: 'dismayings@example.com',
      password: 'vile.shosintchallenge',
      role: 'Admin' as const,
      avatar: '/images/design-mode/ezqzq0.png',
      bio: 'junkjaw',
      uid: 2,
      isOnline: true,
    },
    {
      username: 'ic3',
      email: 'ic3@example.com',
      password: 'ACK071675',
      role: 'Admin' as const,
      avatar: '/images/design-mode/ezqzq0.png',
      bio: 'looooooool',
      uid: 3,
      createdAt: new Date('2019-08-25'),
      joinedAt: new Date('2019-08-25'),
    },
    {
      username: 'kaan',
      email: 'kaan@example.com',
      password: '½zSlow3WQ2T#$Kxxn½',
      role: 'Mod' as const,
      avatar: '/images/design-mode/ezqzq0.png',
      bio: '',
      uid: 4,
    },
  ]

  // Insert users with hashed passwords
  const insertedUsers: Record<string, string> = {}
  for (const user of mockUsers) {
    const passwordHash = await bcrypt.hash(user.password, 10)
    const [inserted] = await db.insert(users).values({
      username: user.username,
      email: user.email,
      passwordHash,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      isOnline: user.isOnline ?? false,
      createdAt: user.createdAt ?? new Date(),
      joinedAt: user.joinedAt ?? new Date(),
    }).returning()
    insertedUsers[user.username] = inserted.id
    console.log(`✓ Created user: ${user.username}`)
  }

  // Insert initial pastes
  const mockPastes = [
    {
      id: 'how-to-ensure-your-paste-stays-up',
      title: 'How to Ensure Your Paste Stays Up',
      content: `[center][size=6][font=Impact]How to Ensure Your Paste Stays Up[/font][/size][/center]\n\n[b]What causes pastes to be removed?[/b]\n\nPastes are removed for the following reasons:\n- They violate our Terms of Service\n- They contain illegal content\n- They are reported by multiple users and confirmed to be inappropriate\n\n[b]Tips to keep your paste active:[/b]\n1. Don't post illegal content\n2. Keep it within TOS guidelines\n3. Don't spam or abuse the platform\n4. Respect other users\n\nThank you for using Abuse.bin responsibly!`,
      authorId: insertedUsers['wounds'],
      isPinned: true,
    },
    {
      id: 'transparency-report',
      title: 'Transparency Report',
      content: 'Abuse.bin Transparency Report - Last updated: October 19, 2025\n\nThis report provides information about our practices regarding user data and content moderation.',
      authorId: insertedUsers['wounds'],
      isPinned: true,
    },
  ]

  for (const paste of mockPastes) {
    await db.insert(pastes).values(paste)
    console.log(`✓ Created paste: ${paste.title}`)
  }

  console.log('✅ Database seeded successfully!')
}

seed()
  .catch((error) => {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
