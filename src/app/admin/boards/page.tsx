'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Board, BoardType } from '@/types'

interface BoardWithStats extends Board {
    isActive?: boolean
    _count?: {
        posts: number
    }
}

export default function BoardManagementPage() {
    const [boards, setBoards] = useState<BoardWithStats[]>([])
    const [loading, setLoading] = useState(true)
    const [activeBoard, setActiveBoard] = useState<number | null>(null)

    useEffect(() => {
        fetchBoards()
        fetchActiveBoard()
    }, [])

    const fetchBoards = async () => {
        try {
            const response = await fetch('/api/boards')
            if (response.ok) {
                const data = await response.json()
                setBoards(data)

                // Find the active board from the fetched boards
                const activeBoardFromList = data.find((board: BoardWithStats) => board.isActive)
                if (activeBoardFromList) {
                    setActiveBoard(activeBoardFromList.id)
                }
            }
        } catch (error) {
            console.error('Error fetching boards:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchActiveBoard = async () => {
        try {
            const response = await fetch('/api/boards/active')
            if (response.ok) {
                const data = await response.json()
                setActiveBoard(data.id)
            }
        } catch (error) {
            console.error('Error fetching active board:', error)
        }
    }

    const setAsActive = async (boardId: number) => {
        try {
            const response = await fetch(`/api/boards/${boardId}/activate`, {
                method: 'POST'
            })
            if (response.ok) {
                setActiveBoard(boardId)
            }
        } catch (error) {
            console.error('Error setting active board:', error)
        }
    }

    const deleteBoard = async (boardId: number) => {
        if (!confirm('Are you sure you want to delete this board? This action cannot be undone.')) {
            return
        }

        try {
            const response = await fetch(`/api/boards/${boardId}`, {
                method: 'DELETE'
            })
            if (response.ok) {
                setBoards(boards.filter(board => board.id !== boardId))
                if (activeBoard === boardId) {
                    setActiveBoard(null)
                }
            }
        } catch (error) {
            console.error('Error deleting board:', error)
        }
    }

    const getBoardTypeLabel = (type: BoardType) => {
        switch (type) {
            case BoardType.FLYING_MESSAGES:
                return 'Flying Messages'
            case BoardType.POST_IT:
                return 'Post-it Notes'
            case BoardType.NEWYEAR:
                return 'New Year Theme'
            case BoardType.NEWYEAR_RABBIT:
                return 'New Year Rabbit'
            default:
                return 'Unknown'
        }
    }

    const getBoardTypeIcon = (type: BoardType) => {
        switch (type) {
            case BoardType.FLYING_MESSAGES:
                return '✈️'
            case BoardType.POST_IT:
                return '📝'
            case BoardType.NEWYEAR:
                return '🎊'
            case BoardType.NEWYEAR_RABBIT:
                return '🐰'
            default:
                return '📋'
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl">Loading boards...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link
                                href="/admin"
                                className="text-gray-600 hover:text-gray-900 mr-4"
                            >
                                ← Back to Admin
                            </Link>
                            <h1 className="text-xl font-semibold">Board Management</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/admin/boards/new"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Create New Board
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {boards.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-500 text-lg mb-4">No boards created yet</div>
                            <Link
                                href="/admin/boards/new"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-sm font-medium"
                            >
                                Create Your First Board
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {boards.map((board) => (
                                <div key={board.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                    {/* Board Preview */}
                                    <div
                                        className="h-32 relative"
                                        style={{
                                            backgroundColor: board.backgroundColor || '#f3f4f6',
                                            backgroundImage: board.backgroundImg ? `url(/images/${board.backgroundImg})` : undefined,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }}
                                    >
                                        {activeBoard === board.id && (
                                            <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                                                ACTIVE
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                            <div className="text-center text-white">
                                                <div className="text-2xl mb-1">{getBoardTypeIcon(board.type)}</div>
                                                <div className="text-sm font-medium">{getBoardTypeLabel(board.type)}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Board Info */}
                                    <div className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                                    {board.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {board.posts?.length || 0} messages
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Created {new Date(board.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {activeBoard !== board.id && (
                                                <button
                                                    onClick={() => setAsActive(board.id)}
                                                    className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-xs font-medium"
                                                >
                                                    Set Active
                                                </button>
                                            )}
                                            <Link
                                                href={`/admin/boards/${board.id}`}
                                                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-xs font-medium"
                                            >
                                                Edit
                                            </Link>
                                            <Link
                                                href={`/board?id=${board.id}`}
                                                target="_blank"
                                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs font-medium"
                                            >
                                                Preview
                                            </Link>
                                            <button
                                                onClick={() => deleteBoard(board.id)}
                                                className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-xs font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
