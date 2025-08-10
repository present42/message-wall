'use client'

import { useEffect, useState, useCallback } from 'react'

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
}

export default function PostsViewer() {
    const [posts, setPosts] = useState<Post[]>([])
    const [allPosts, setAllPosts] = useState<Post[]>([]) // For counting
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [statusFilter, setStatusFilter] = useState<string>('ALL')

    const fetchAllPosts = async () => {
        try {
            const response = await fetch('/api/posts?status=')
            if (response.ok) {
                const data = await response.json()
                setAllPosts(data.posts || [])
            }
        } catch (err) {
            console.error('Error fetching all posts for counting:', err)
        }
    }

    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            // Build URL based on filter
            let url = '/api/posts'
            if (statusFilter === 'ALL') {
                url += '?status='  // Empty status returns all posts
            } else {
                url += `?status=${statusFilter}`
            }

            const response = await fetch(url)

            console.log('Response status:', response.status)
            console.log('Response headers:', response.headers)

            const responseText = await response.text()
            console.log('Raw response:', responseText)

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${responseText}`)
            }

            if (!responseText.trim()) {
                throw new Error('Empty response from server')
            }

            const data = JSON.parse(responseText)
            console.log('Parsed data:', data)

            setPosts(data.posts || [])

            // Also update allPosts if we're showing all
            if (statusFilter === 'ALL') {
                setAllPosts(data.posts || [])
            }
        } catch (err) {
            console.error('Fetch error:', err)
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
    }, [statusFilter])

    useEffect(() => {
        fetchPosts()
    }, [statusFilter, fetchPosts])

    useEffect(() => {
        // Fetch all posts once for counting purposes
        fetchAllPosts()
    }, [])

    const getStatusCounts = () => {
        const approved = allPosts.filter(p => p.status === 'APPROVED').length
        const pending = allPosts.filter(p => p.status === 'PENDING').length
        const rejected = allPosts.filter(p => p.status === 'REJECTED').length
        return { approved, pending, rejected }
    }

    const statusCounts = getStatusCounts()

    if (loading) return <div className="p-6">Loading posts...</div>
    if (error) return <div className="p-6 text-red-600">Error: {error}</div>

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Posts Management</h1>

            {/* Filter Controls */}
            <div className="mb-6">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                    <h2 className="text-lg font-semibold">Filter by Status:</h2>
                    <div className="flex gap-2">
                        {[
                            { value: 'ALL', label: 'All Posts', count: allPosts.length },
                            { value: 'APPROVED', label: 'Approved', count: statusCounts.approved },
                            { value: 'PENDING', label: 'Pending', count: statusCounts.pending },
                            { value: 'REJECTED', label: 'Rejected', count: statusCounts.rejected }
                        ].map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() => setStatusFilter(filter.value)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === filter.value
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {filter.label} ({filter.count})
                            </button>
                        ))}
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
                        Total: {allPosts.length}
                    </span>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading posts...</p>
                    </div>
                </div>
            ) : error ? (
                <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="text-red-800 font-semibold mb-2">Error Loading Posts</h3>
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={fetchPosts}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Try Again
                    </button>
                </div>
            ) : posts.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        No {statusFilter.toLowerCase() === 'all' ? '' : statusFilter.toLowerCase() + ' '}posts found
                    </h3>
                    <p className="text-gray-600 mb-4">
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
            ) : (
                <div className="space-y-6">
                    <div className="text-sm text-gray-600 mb-4">
                        Showing {posts.length} {statusFilter.toLowerCase() === 'all' ? '' : statusFilter.toLowerCase() + ' '}
                        post{posts.length !== 1 ? 's' : ''}
                        {statusFilter !== 'ALL' && (
                            <button
                                onClick={() => setStatusFilter('ALL')}
                                className="ml-2 text-blue-600 hover:text-blue-800 underline"
                            >
                                View all posts
                            </button>
                        )}
                    </div>

                    {posts.map((post) => (
                        <div key={post.id} className="border rounded-lg p-6 shadow-sm">
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xl font-semibold">Post #{post.id}</h3>
                                    <span className={`px-2 py-1 rounded text-sm ${post.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                            post.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                        }`}>
                                        {post.status}
                                    </span>
                                </div>

                                <div className="text-sm text-gray-600 mb-2">
                                    By: {post.nickname || 'Anonymous'} • {new Date(post.createdAt).toLocaleString()}
                                </div>
                            </div>

                            {post.message && (
                                <div className="mb-4">
                                    <h4 className="font-medium mb-2">Message:</h4>
                                    <p className="text-gray-700 whitespace-pre-wrap">{post.message}</p>
                                </div>
                            )}

                            {/* Legacy single image */}
                            {post.imagePath && (
                                <div className="mb-4">
                                    <h4 className="font-medium mb-2">Legacy Image:</h4>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`/uploads/${post.imagePath}`}
                                        alt="Post attachment"
                                        className="max-w-xs rounded border"
                                    />
                                </div>
                            )}

                            {/* New attachments system */}
                            {post.attachments && post.attachments.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="font-medium mb-2">Attachments ({post.attachments.length}):</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {post.attachments.map((attachment) => (
                                            <div key={attachment.id} className="border rounded p-3">
                                                {attachment.mimeType.startsWith('image/') ? (
                                                    <div>
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={`/uploads/${attachment.filename}`}
                                                            alt={attachment.originalName}
                                                            className="w-full h-32 object-cover rounded mb-2"
                                                        />
                                                        <p className="text-xs text-gray-600 truncate" title={attachment.originalName}>
                                                            {attachment.originalName}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded">
                                                        <div className="text-2xl mb-2">📄</div>
                                                        <p className="text-xs text-center text-gray-600 truncate" title={attachment.originalName}>
                                                            {attachment.originalName}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="text-xs text-gray-500 border-t pt-2">
                                Board ID: {post.boardId} • Created: {new Date(post.createdAt).toLocaleString()} • Updated: {new Date(post.updatedAt).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
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
            </div>
        </div>
    )
}
