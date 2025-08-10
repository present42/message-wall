'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Board, Post, BoardType, WebSocketMessage } from '@/types'
import { FlyingMessagesBoard } from '@/components/boards/flying-messages-board'
import { PostItBoardEnhanced } from '@/components/boards/post-it-board-enhanced'
import { MultimediaBoardWrapper } from '@/components/ui/multimedia-board-wrapper'
import { useSocket } from '@/hooks/useSocket'

function BoardContent() {
    const searchParams = useSearchParams()
    const boardId = searchParams.get('id')

    const [board, setBoard] = useState<Board | null>(null)
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // WebSocket connection for real-time board updates
    const { isConnected, joinBoard, leaveBoard } = useSocket({
        onMessage: (message: WebSocketMessage) => {
            console.log('📨 Board received WebSocket message:', message)

            if (message.type === 'NEW_APPROVED_POST') {
                // Add new approved post to the board
                const newPost = message.data as Post
                if (newPost.status === 'APPROVED') { // Only show approved posts
                    setPosts(prevPosts => [newPost, ...prevPosts])
                }
            }
        },
        onConnect: () => {
            console.log('🔌 Board WebSocket connected')
        },
        onDisconnect: () => {
            console.log('❌ Board WebSocket disconnected')
        }
    })

    // Join/leave board room when board changes or connection status changes
    useEffect(() => {
        if (isConnected && board) {
            joinBoard(board.id.toString())

            return () => {
                leaveBoard(board.id.toString())
            }
        }
    }, [isConnected, board, joinBoard, leaveBoard])

    useEffect(() => {
        fetchBoard()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [boardId])

    const fetchBoard = async () => {
        try {
            setLoading(true)
            setError(null)

            const url = boardId
                ? `/api/boards/${boardId}`
                : '/api/boards/active'

            const response = await fetch(url)

            if (!response.ok) {
                throw new Error('Failed to fetch board')
            }

            const data = await response.json()
            setBoard(data)
            setPosts(data.posts || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-600">{error}</p>
                    <button
                        onClick={fetchBoard}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    if (!board) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-600 mb-4">No Board Found</h1>
                    <p className="text-gray-500">No current board is configured</p>
                </div>
            </div>
        )
    }

    // Render different board layouts based on board type
    const renderBoard = () => {
        switch (board.type) {
            case BoardType.FLYING_MESSAGES:
                return <FlyingMessagesBoard board={board} posts={posts} />
            case BoardType.POST_IT:
                return <PostItBoardEnhanced board={board} posts={posts} variant={BoardType.POST_IT} />
            case BoardType.NEWYEAR:
                return <FlyingMessagesBoard board={board} posts={posts} /> // Can create special NewYear component later
            case BoardType.NEWYEAR_RABBIT:
                return <PostItBoardEnhanced board={board} posts={posts} variant={BoardType.POST_IT} />
            default:
                return <FlyingMessagesBoard board={board} posts={posts} />
        }
    }

    return (
        <MultimediaBoardWrapper board={board}>
            {renderBoard()}

            {/* Admin Link (hidden in fullscreen) */}
            <div className="fixed bottom-4 left-4 opacity-0 hover:opacity-100 transition-opacity duration-300 z-50">
                <a
                    href="/admin"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-md text-xs hover:bg-black/70"
                >
                    Admin
                </a>
            </div>
        </MultimediaBoardWrapper>
    )
}

export default function BoardPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-xl">Loading board...</div>
        </div>}>
            <BoardContent />
        </Suspense>
    )
}
