'use client'

import { Post } from '@/types'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import Image from 'next/image'

interface MessageCardProps {
    post: Post
    style?: React.CSSProperties
    className?: string
    variant?: 'flying' | 'postit' | 'postit-pin' | 'postit-tape' | 'newyear'
}

export function MessageCard({ post, style, className, variant = 'flying' }: MessageCardProps) {
    const getVariantStyles = () => {
        switch (variant) {
            case 'postit':
                return 'bg-yellow-200 shadow-md transform rotate-1 hover:rotate-0 transition-transform'
            case 'postit-pin':
                return 'bg-yellow-200 shadow-md relative before:absolute before:-top-2 before:left-4 before:w-4 before:h-4 before:bg-red-500 before:rounded-full before:shadow-sm'
            case 'postit-tape':
                return 'bg-yellow-200 shadow-md relative before:absolute before:-top-2 before:left-0 before:right-0 before:h-4 before:bg-gray-300 before:opacity-70'
            case 'newyear':
                return 'bg-red-100 border-2 border-red-300 shadow-lg'
            default:
                return 'bg-white shadow-lg hover:shadow-xl transition-shadow'
        }
    }

    return (
        <div
            className={cn(
                'p-4 rounded-lg max-w-xs min-h-32 flex flex-col justify-between cursor-pointer',
                getVariantStyles(),
                className
            )}
            style={style}
        >
            <div className="flex-1">
                {post.message && (
                    <p className="text-sm text-gray-800 leading-relaxed mb-2">
                        {post.message}
                    </p>
                )}

                {post.imagePath && (
                    <div className="relative w-full mb-2 rounded-md overflow-hidden bg-gray-100">
                        <Image
                            src={`/uploads/${post.imagePath}`}
                            alt="Post image"
                            width={300}
                            height={200}
                            className="w-full h-auto max-h-48 object-contain"
                        />
                    </div>
                )}
            </div>

            <div className="mt-2 pt-2 border-t border-gray-200">
                {post.nickname && (
                    <p className="text-xs font-semibold text-gray-700 mb-1">
                        {post.nickname}
                    </p>
                )}
                <p className="text-xs text-gray-500">
                    {formatDate(post.createdAt)}
                </p>
            </div>
        </div>
    )
}
