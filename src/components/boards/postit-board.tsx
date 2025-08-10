'use client'

import { useEffect, useState } from 'react'
import { Post, Board } from '@/types'
import { MessageCard } from '@/components/ui/message-card'

interface PostItBoardProps {
    board: Board
    posts: Post[]
    variant?: 'postit' | 'postit-pin' | 'postit-tape'
}

export function PostItBoard({ board, posts, variant = 'postit' }: PostItBoardProps) {
    const [displayedPosts, setDisplayedPosts] = useState<Post[]>([])
    const [colorList, setColorList] = useState<string[]>([])

    useEffect(() => {
        if (board.postColors) {
            setColorList(board.postColors.split('  ').filter(Boolean))
        } else {
            // Default post-it colors
            setColorList(['#ffeb3b', '#4caf50', '#2196f3', '#ff9800', '#e91e63'])
        }
    }, [board.postColors])

    useEffect(() => {
        setDisplayedPosts(posts)
    }, [posts])

    const backgroundStyles: React.CSSProperties = {
        backgroundColor: board.backgroundColor || '#f5f5f5',
        backgroundImage: board.backgroundImg ? `url(/images/${board.backgroundImg})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: board.fontFamily || 'Arial, sans-serif'
    }

    const getPostItColor = (index: number) => {
        if (colorList.length === 0) return '#ffeb3b'
        return colorList[index % colorList.length]
    }

    return (
        <div
            className="relative w-full min-h-screen p-8"
            style={backgroundStyles}
        >
            {/* Background Video */}
            {board.backgroundVideo && (
                <video
                    autoPlay
                    muted
                    loop
                    className="absolute inset-0 w-full h-full object-cover -z-10"
                >
                    <source src={`/videos/${board.backgroundVideo}`} type="video/mp4" />
                </video>
            )}

            {/* Background Music */}
            {board.bgMusic && (
                <audio
                    autoPlay
                    loop
                    ref={(audio) => {
                        if (audio) {
                            audio.volume = 0.3
                        }
                    }}
                >
                    <source
                        src={`/music/${board.bgMusic}`}
                        type={board.bgMusicExtension || 'audio/mpeg'}
                    />
                </audio>
            )}

            {/* Board Title */}
            {board.title && (
                <h1
                    className="text-4xl font-bold text-center mb-8"
                    style={{ color: board.titleColor || '#333' }}
                >
                    {board.title}
                </h1>
            )}

            {/* Post-it Messages Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 auto-rows-max">
                {displayedPosts.map((post, index) => (
                    <div key={post.id} className="flex justify-center">
                        <MessageCard
                            post={post}
                            variant={variant}
                            style={{
                                backgroundColor: getPostItColor(index),
                                transform: `rotate(${(Math.random() - 0.5) * 6}deg)`,
                            }}
                            className="w-48 h-48 hover:z-10 transition-all duration-200"
                        />
                    </div>
                ))}
            </div>

            {/* Add more posts button/indicator could go here */}
        </div>
    )
}
