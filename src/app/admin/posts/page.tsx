'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useSocket } from '@/hooks/useSocket'
import { WebSocketMessage } from '@/types'
import { PostDetailModal } from '@/components/ui/post-detail-modal'

interface Attachment {
    id: number
    filename: string
    originalName: string
    filePath: string
    fileSize: number
    mimeType: string
    dimensions: string | null
}

interface Post {
    id: number
    message: string | null
    nickname: string | null
    email: string | null
    imagePath: string | null
    status: string
    createdAt: string
    updatedAt: string
    boardId: number
    attachments: Attachment[]
    board?: {
        id: number
        title: string
        type: string
    }
}

interface Board {
    id: number
    title: string
    type: string
    isActive?: boolean
}

interface Pagination {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
}

export default function AdminPostsPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [posts, setPosts] = useState<Post[]>([])
    const [boards, setBoards] = useState<Board[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState<string>('ALL')
    const [boardFilter, setBoardFilter] = useState<string>('ALL')
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [updatingPostId, setUpdatingPostId] = useState<number | null>(null)
    const [statusCounts, setStatusCounts] = useState({ approved: 0, pending: 0, rejected: 0, total: 0 })

    // Modal state
    const [selectedPost, setSelectedPost] = useState<Post | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // WebSocket connection for real-time updates
    const { isConnected, joinAdmin } = useSocket({
        onMessage: (message: WebSocketMessage) => {
            console.log('📨 Admin received WebSocket message:', message)

            if (message.type === 'NEW_POST') {
                // Refresh data when new post comes in
                fetchPosts()
                fetchStatusCounts()
            } else if (message.type === 'POST_STATUS_UPDATED') {
                // Refresh data when post status changes
                fetchPosts()
                fetchStatusCounts()
            }
        },
        onConnect: () => {
            console.log('🔌 Admin WebSocket connected')
        },
        onDisconnect: () => {
            console.log('❌ Admin WebSocket disconnected')
        }
    })

    // Fetch boards for the dropdown
    const fetchBoards = useCallback(async () => {
        try {
            const response = await fetch('/api/boards')
            if (response.ok) {
                const data = await response.json()
                setBoards(data)
            } else {
                console.error('Failed to fetch boards')
            }
        } catch (error) {
            console.error('Error fetching boards:', error)
        }
    }, [])

    // Fetch posts function
    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: '10',
                ...(statusFilter !== 'ALL' && { status: statusFilter }),
                ...(boardFilter !== 'ALL' && { boardId: boardFilter })
            })

            const response = await fetch(`/api/posts?${params}`)
            if (response.ok) {
                const data = await response.json()
                setPosts(data.posts)
                setPagination(data.pagination)
            } else {
                setError('Failed to fetch posts')
            }
        } catch (error) {
            console.error('Error fetching posts:', error)
            setError('Error fetching posts')
        } finally {
            setLoading(false)
        }
    }, [currentPage, statusFilter, boardFilter])

    // Fetch status counts
    const fetchStatusCounts = useCallback(async () => {
        try {
            // Fetch all posts to calculate status counts
            const params = new URLSearchParams({
                limit: '1000', // Get a large number to count all posts
                ...(boardFilter !== 'ALL' && { boardId: boardFilter })
            })

            const response = await fetch(`/api/posts?${params}`)
            if (response.ok) {
                const data = await response.json()
                const allPosts = data.posts || []

                setStatusCounts({
                    approved: allPosts.filter((p: Post) => p.status === 'APPROVED').length,
                    pending: allPosts.filter((p: Post) => p.status === 'PENDING').length,
                    rejected: allPosts.filter((p: Post) => p.status === 'REJECTED').length,
                    total: allPosts.length
                })
            }
        } catch (error) {
            console.error('Error fetching status counts:', error)
        }
    }, [boardFilter])

    // Authentication check
    useEffect(() => {
        if (status === 'loading') return // Still loading
        if (!session) {
            router.push('/admin/login')
        }
    }, [session, status, router])

    // Join admin room when connected
    useEffect(() => {
        if (isConnected) {
            joinAdmin()
        }
    }, [isConnected, joinAdmin])

    // Set active board as default filter when boards are loaded
    useEffect(() => {
        if (boards.length > 0 && boardFilter === 'ALL') {
            const activeBoard = boards.find((board: Board) => board.isActive)
            if (activeBoard) {
                console.log('Setting default board filter to active board:', activeBoard.title)
                setBoardFilter(activeBoard.id.toString())
            }
        }
    }, [boards, boardFilter])

    // Initial data loading
    useEffect(() => {
        if (session) {
            fetchBoards()
            fetchStatusCounts()
        }
    }, [session, fetchBoards, fetchStatusCounts])

    // Fetch posts when filters or pagination change
    useEffect(() => {
        if (session) {
            fetchPosts()
        }
    }, [session, fetchPosts])

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [statusFilter, boardFilter])

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/admin/login' })
    }

    // Helper function to safely format dates
    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return 'No date'

        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) {
                return 'Invalid date'
            }
            return date.toLocaleString()
        } catch {
            return 'Invalid date'
        }
    }

    // Show loading state while checking authentication
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        )
    }

    if (!session) {
        return null // Will redirect to login
    }

    const updatePostStatus = async (postId: number, newStatus: 'APPROVED' | 'PENDING' | 'REJECTED') => {
        try {
            setUpdatingPostId(postId)

            const response = await fetch('/api/posts', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId,
                    status: newStatus
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update post status')
            }

            // Refresh posts and counts after update
            await fetchPosts()
            await fetchStatusCounts()

            alert(`Post status updated to ${newStatus}`)

        } catch (error) {
            console.error('Error updating post status:', error)
            alert(`Failed to update post status: ${error instanceof Error ? error.message : 'Unknown error'}`)
        } finally {
            setUpdatingPostId(null)
        }
    }

    // Modal handling functions
    const openPostModal = (post: Post) => {
        setSelectedPost(post)
        setIsModalOpen(true)
    }

    const closePostModal = () => {
        setSelectedPost(null)
        setIsModalOpen(false)
    }

    // Truncate text helper
    const truncateText = (text: string | null, maxLength: number = 50) => {
        if (!text) return 'No message'
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    }

    if (loading && posts.length === 0) return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-xl">Loading posts...</div>
        </div>
    )
    if (error) return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-xl text-red-600">Error: {error}</div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-100 admin-interface">
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
                            <h1 className="text-xl font-semibold">Posts Management</h1>
                            <div className="ml-4 text-sm text-gray-600">
                                Welcome, {session.user?.name}
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Filter Controls Card */}
                    <div className="bg-white rounded-lg shadow mb-6">
                        <div className="px-6 py-4">
                            <h3 className="text-lg font-medium text-black mb-4">Filter Options</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {/* Board Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">Filter by Board:</label>
                                    <select
                                        value={boardFilter}
                                        onChange={(e) => setBoardFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="ALL">All Boards</option>
                                        {boards
                                            .sort((a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0)) // Sort active board first
                                            .map((board) => (
                                                <option key={board.id} value={board.id.toString()}>
                                                    {board.title} {board.isActive ? '⭐ (Active)' : ''}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                {/* Status Selection */}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">Filter by Status:</label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { value: 'ALL', label: 'All Posts', count: statusCounts.total },
                                            { value: 'APPROVED', label: 'Approved', count: statusCounts.approved },
                                            { value: 'PENDING', label: 'Pending', count: statusCounts.pending },
                                            { value: 'REJECTED', label: 'Rejected', count: statusCounts.rejected }
                                        ].map((filter) => (
                                            <button
                                                key={filter.value}
                                                onClick={() => setStatusFilter(filter.value)}
                                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === filter.value
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-black hover:bg-gray-300'
                                                    }`}
                                            >
                                                {filter.label} ({filter.count})
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Status Summary */}
                            <div className="flex gap-4 text-sm">
                                <span className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    Approved: {statusCounts.approved}
                                </span>
                                <span className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    Pending: {statusCounts.pending}
                                </span>
                                <span className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    Rejected: {statusCounts.rejected}
                                </span>
                                <span className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                    Total: {statusCounts.total}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Pagination Info */}
                    {pagination && (
                        <div className="mb-4 text-sm text-black">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} posts
                        </div>
                    )}

                    {loading ? (
                        <div className="bg-white rounded-lg shadow p-8">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-black">Loading posts...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                <h3 className="text-red-800 font-semibold mb-2">Error Loading Posts</h3>
                                <p className="text-red-600">{error}</p>
                                <button
                                    onClick={fetchPosts}
                                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-12">
                            <div className="text-center">
                                <div className="text-6xl mb-4">📝</div>
                                <h3 className="text-xl font-semibold text-black mb-2">
                                    No {statusFilter.toLowerCase() === 'all' ? '' : statusFilter.toLowerCase() + ' '}posts found
                                </h3>
                                <p className="text-black mb-4">
                                    {statusFilter === 'ALL'
                                        ? 'There are no posts in the database yet.'
                                        : `There are no ${statusFilter.toLowerCase()} posts at the moment.`
                                    }
                                </p>
                                <button
                                    onClick={fetchPosts}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Refresh
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            {/* Table Header */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Post
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Message
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Author
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Board
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Created
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {posts.map((post) => (
                                            <tr key={post.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openPostModal(post)}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    #{post.id}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                                    <div className="truncate">{truncateText(post.message, 60)}</div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {post.imagePath && '🖼️ Image • '}
                                                        {post.attachments && post.attachments.length > 0 && `📎 ${post.attachments.length} files • `}
                                                        Click to view details
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div>{post.nickname || 'Anonymous'}</div>
                                                    {post.email && (
                                                        <div className="text-xs text-gray-500">{post.email}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                                        {post.board?.title || `Board ${post.boardId}`}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${post.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                                        post.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                        {post.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(post.createdAt)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => updatePostStatus(post.id, 'APPROVED')}
                                                            disabled={updatingPostId === post.id || post.status === 'APPROVED'}
                                                            className={`px-2 py-1 rounded text-xs transition-colors ${post.status === 'APPROVED'
                                                                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                                                                : 'bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300'
                                                                }`}
                                                            title="Approve"
                                                        >
                                                            ✅
                                                        </button>
                                                        <button
                                                            onClick={() => updatePostStatus(post.id, 'REJECTED')}
                                                            disabled={updatingPostId === post.id || post.status === 'REJECTED'}
                                                            className={`px-2 py-1 rounded text-xs transition-colors ${post.status === 'REJECTED'
                                                                ? 'bg-red-100 text-red-800 cursor-not-allowed'
                                                                : 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300'
                                                                }`}
                                                            title="Reject"
                                                        >
                                                            ❌
                                                        </button>
                                                        <button
                                                            onClick={() => openPostModal(post)}
                                                            className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                                                            title="View Details"
                                                        >
                                                            👁️
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Pagination Controls */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(1)}
                                        disabled={!pagination.hasPrev}
                                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        First
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(currentPage - 1)}
                                        disabled={!pagination.hasPrev}
                                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Previous
                                    </button>
                                </div>

                                <div className="text-sm text-black">
                                    Page {pagination.page} of {pagination.totalPages}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(currentPage + 1)}
                                        disabled={!pagination.hasNext}
                                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Next
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(pagination.totalPages)}
                                        disabled={!pagination.hasNext}
                                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Last
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation and Action Buttons */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={fetchPosts}
                                disabled={loading}
                                className={`px-6 py-2 rounded font-medium ${loading
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                {loading ? 'Loading...' : 'Refresh Posts'}
                            </button>

                            <button
                                onClick={() => window.location.href = '/create-post'}
                                className="px-6 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700"
                            >
                                Create New Post
                            </button>

                            <button
                                onClick={() => window.location.href = '/admin'}
                                className="px-6 py-2 bg-gray-600 text-white rounded font-medium hover:bg-gray-700"
                            >
                                Back to Admin Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Post Detail Modal */}
            {selectedPost && (
                <PostDetailModal
                    post={selectedPost}
                    isOpen={isModalOpen}
                    onClose={closePostModal}
                    onUpdateStatus={updatePostStatus}
                    isUpdating={updatingPostId === selectedPost.id}
                />
            )}
        </div>
    )
}
