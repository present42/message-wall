import { PrismaClient, BoardType, PostStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    const adminUser = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            email: 'admin@example.com',
            password: hashedPassword,
        },
    })
    console.log('✅ Created admin user:', adminUser.username)

    // Create sample board
    const sampleBoard = await prisma.board.upsert({
        where: { id: 1 },
        update: {},
        create: {
            title: 'Welcome to Message Wall!',
            type: BoardType.FLYING_MESSAGES,
            backgroundColor: '#f0f9ff',
            titleColor: '#1e40af',
            fontFamily: 'Arial, sans-serif',
            postColors: 'rgb(199, 130, 130) rgb(227, 186, 215) rgb(230, 194, 193) rgb(198, 219, 197) rgb(202, 200, 230)'
        },
    })
    console.log('✅ Created sample board:', sampleBoard.title)

    // Create sample posts
    const samplePosts = [
        {
            message: "Welcome to our new digital message wall! Share your thoughts and connect with the community.",
            nickname: "Demo Team",
            email: "demo@example.com",
            status: PostStatus.APPROVED,
            boardId: sampleBoard.id,
        },
        {
            message: "This is amazing! Can't wait to see everyone's messages here. 🎉",
            nickname: "Student A",
            email: "student@connect.ust.hk",
            status: PostStatus.APPROVED,
            boardId: sampleBoard.id,
        },
        {
            message: "Hello from the message wall! This is a test message to see how it looks.",
            nickname: "Test User",
            email: "test@example.com",
            status: PostStatus.PENDING,
            boardId: sampleBoard.id,
        },
        {
            message: "The interface looks great! Modern and clean design. 👍",
            nickname: "Design Lover",
            email: "design@example.com",
            status: PostStatus.APPROVED,
            boardId: sampleBoard.id,
        }
    ]

    // Create posts
    for (let i = 0; i < samplePosts.length; i++) {
        const postData = samplePosts[i]
        await prisma.post.create({
            data: postData,
        })
    }
    console.log(`✅ Created ${samplePosts.length} sample posts`)

    // Create a Post-it board
    const postitBoard = await prisma.board.create({
        data: {
            title: 'Post-it Board Style',
            type: BoardType.POST_IT,
            backgroundColor: '#fef3c7',
            titleColor: '#92400e',
            fontFamily: 'Comic Sans MS, cursive',
            postColors: 'rgb(254, 240, 138) rgb(253, 224, 71) rgb(250, 204, 21) rgb(245, 158, 11) rgb(217, 119, 6)'
        },
    })
    console.log('✅ Created Post-it board:', postitBoard.title)

    console.log('🌱 Seed completed!')
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
