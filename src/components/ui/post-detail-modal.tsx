'use client'

import { useEffect } from 'react'
import Image from 'next/image'

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

interface PostDetailModalProps {
    post: Post
    isOpen: boolean
    onClose: () => void
    onUpdateStatus: (postId: number, status: 'APPROVED' | 'PENDING' | 'REJECTED') => void
    isUpdating: boolean
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

export function PostDetailModal({ post, isOpen, onClose, onUpdateStatus, isUpdating }: PostDetailModalProps) {
    // Handle escape key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
        >
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Post #{post.id}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            {post.board && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                    {post.board.title}
                                </span>
                            )}
                            <span className={`px-2 py-1 rounded text-sm ${post.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                post.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                {post.status}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                    {/* Post Details */}
                    <div className="mb-6">
                        <div className="text-sm text-gray-700 mb-4">
                            <span className="font-medium">By:</span> {post.nickname || 'Anonymous'}
                            <span className="mx-2">•</span>
                            <span className="font-medium">Created:</span> {formatDate(post.createdAt)}
                            {post.email && (
                                <>
                                    <span className="mx-2">•</span>
                                    <span className="font-medium">Email:</span> {post.email}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Message */}
                    {post.message && (
                        <div className="mb-6">
                            <h4 className="font-semibold text-gray-900 mb-3">Message:</h4>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-gray-800 whitespace-pre-wrap">{post.message}</p>
                            </div>
                        </div>
                    )}

                    {/* Legacy single image */}
                    {post.imagePath && (
                        <div className="mb-6">
                            <h4 className="font-semibold text-gray-900 mb-3">Image:</h4>
                            <div className="border rounded-lg overflow-hidden max-w-md">
                                <Image
                                    src={`/uploads/${post.imagePath}`}
                                    alt="Post attachment"
                                    width={400}
                                    height={300}
                                    className="w-full h-auto"
                                />
                            </div>
                        </div>
                    )}

                    {/* New attachments system */}
                    {post.attachments && post.attachments.length > 0 && (
                        <div className="mb-6">
                            <h4 className="font-semibold text-gray-900 mb-3">
                                Attachments ({post.attachments.length}):
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {post.attachments.map((attachment) => (
                                    <div key={attachment.id} className="border rounded-lg p-3">
                                        {attachment.mimeType.startsWith('image/') ? (
                                            <div>
                                                <div className="relative w-full h-32 mb-2">
                                                    <Image
                                                        src={`/uploads/${attachment.filename}`}
                                                        alt={attachment.originalName}
                                                        fill
                                                        className="object-cover rounded"
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-800 truncate font-medium" title={attachment.originalName}>
                                                    {attachment.originalName}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded">
                                                <div className="text-2xl mb-2">📄</div>
                                                <p className="text-xs text-gray-800 truncate text-center px-2" title={attachment.originalName}>
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

                    {/* Status Change Buttons */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Change Status:</h4>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => onUpdateStatus(post.id, 'APPROVED')}
                                disabled={isUpdating || post.status === 'APPROVED'}
                                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${post.status === 'APPROVED'
                                    ? 'bg-green-100 text-green-800 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500'
                                    }`}
                            >
                                {isUpdating ? 'Updating...' : '✅ Approve'}
                            </button>

                            <button
                                onClick={() => onUpdateStatus(post.id, 'PENDING')}
                                disabled={isUpdating || post.status === 'PENDING'}
                                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${post.status === 'PENDING'
                                    ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed'
                                    : 'bg-yellow-600 text-white hover:bg-yellow-700 disabled:bg-gray-300 disabled:text-gray-500'
                                    }`}
                            >
                                {isUpdating ? 'Updating...' : '🔄 Pending'}
                            </button>

                            <button
                                onClick={() => onUpdateStatus(post.id, 'REJECTED')}
                                disabled={isUpdating || post.status === 'REJECTED'}
                                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${post.status === 'REJECTED'
                                    ? 'bg-red-100 text-red-800 cursor-not-allowed'
                                    : 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500'
                                    }`}
                            >
                                {isUpdating ? 'Updating...' : '❌ Reject'}
                            </button>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="text-sm text-gray-600 border-t pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <span className="font-medium">Board:</span> {post.board?.title || `ID ${post.boardId}`}
                            </div>
                            <div>
                                <span className="font-medium">Created:</span> {formatDate(post.createdAt)}
                            </div>
                            <div>
                                <span className="font-medium">Updated:</span> {formatDate(post.updatedAt)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t">
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
