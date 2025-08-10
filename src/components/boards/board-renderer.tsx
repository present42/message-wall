'use client'

import { Board, Post, BoardType, PostStatus } from '@/types'
import { FlyingMessagesBoard } from './flying-messages-board'
import { PostItBoard } from './postit-board'

interface BoardRendererProps {
    board: Board
    posts: Post[]
}

export function BoardRenderer({ board, posts }: BoardRendererProps) {
    // Filter only approved posts
    const approvedPosts = posts.filter(post => post.status === PostStatus.APPROVED)

    switch (board.type) {
        case BoardType.FLYING_MESSAGES:
            return <FlyingMessagesBoard board={board} posts={approvedPosts} />

        case BoardType.POST_IT:
            return <PostItBoard board={board} posts={approvedPosts} variant="postit" />

        case BoardType.NEWYEAR:
            return (
                <div className="bg-red-50 min-h-screen">
                    <PostItBoard board={board} posts={approvedPosts} variant="postit" />
                </div>
            )

        case BoardType.NEWYEAR_RABBIT:
            return (
                <div className="bg-red-50 min-h-screen">
                    <PostItBoard board={board} posts={approvedPosts} variant="postit" />
                </div>
            )

        default:
            return <FlyingMessagesBoard board={board} posts={approvedPosts} />
    }
}
