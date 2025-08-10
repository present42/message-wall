'use client'

import { useEffect, useState, useMemo } from 'react'
import { Post, Board, BoardType } from '@/types'
import { MessageCard } from '@/components/ui/message-card'
import { getRandomPosition, getRandomRotation } from '@/lib/utils'

interface PostItBoardProps {
    board: Board
    posts: Post[]
    variant: BoardType
}

interface PositionedPost extends Post {
    position: { top: number; left: number }
    rotation: number
    color: string
    enterDelay: number
}

const postitColors = [
    'postit-yellow', 'postit-pink', 'postit-blue',
    'postit-green', 'postit-orange', 'postit-purple'
];

export function PostItBoardEnhanced({ board, posts, variant }: PostItBoardProps) {
    const [displayedPosts, setDisplayedPosts] = useState<PositionedPost[]>([])

    // Generate positions and colors for posts
    const generatePositions = useMemo(() => {
        return posts.map((post, index) => ({
            ...post,
            position: getRandomPosition(),
            rotation: getRandomRotation() * 0.5, // Reduced rotation for post-its
            color: postitColors[Math.floor(Math.random() * postitColors.length)],
            enterDelay: index * 100, // Staggered entrance
        } as PositionedPost));
    }, [posts]);

    useEffect(() => {
        setDisplayedPosts(generatePositions)
    }, [generatePositions])

    const backgroundStyles: React.CSSProperties = {
        backgroundColor: board.backgroundColor || undefined,
        backgroundImage: board.backgroundImg ? `url(/images/${board.backgroundImg})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: board.fontFamily || 'Arial, sans-serif'
    }

    const isPostIt = variant === BoardType.POST_IT;

    return (
        <div
            className={`relative w-full h-screen overflow-hidden ${isPostIt ? 'board-cork' : 'board-fabric'}`}
            style={backgroundStyles}
        >
            {/* Background Video */}
            {board.backgroundVideo && (
                <video
                    autoPlay
                    muted
                    loop
                    className="absolute inset-0 w-full h-full object-cover opacity-20 -z-5"
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
                            audio.volume = 0.3;
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
                    className="absolute top-8 left-1/2 transform -translate-x-1/2 text-4xl font-bold z-10"
                    style={{ color: board.titleColor || '#8B4513' }}
                >
                    {board.title}
                </h1>
            )}

            {/* Post-it Notes */}
            <div className="relative z-10 w-full h-full">
                {displayedPosts.map((post) => (
                    <div
                        key={post.id}
                        className="absolute"
                        style={{
                            top: `${post.position.top}%`,
                            left: `${post.position.left}%`,
                            transform: `translate(-50%, -50%) rotate(${post.rotation}deg)`,
                            '--rotation': `${post.rotation}deg`,
                            '--delay': `${post.enterDelay}ms`,
                        } as React.CSSProperties}
                    >
                        {/* Post-it Note Container */}
                        <div className={`
                            relative postit-note postit-note-enter postit-flutter ${post.color}
                            p-4 w-48 h-48 shadow-lg cursor-pointer
                            transition-all duration-300 hover:z-20
                            border-2 border-black/10
                        `}>
                            {/* Tape Effect - shows on even-indexed posts */}
                            {displayedPosts.indexOf(post) % 2 === 0 && (
                                <div className="tape-horizontal"></div>
                            )}

                            {/* Pin Effect - shows on odd-indexed posts */}
                            {displayedPosts.indexOf(post) % 2 === 1 && (
                                <div className="pin"></div>
                            )}

                            {/* Corner Tape - random chance for corner tape */}
                            {Math.random() > 0.7 && (
                                <div className="tape-corner"></div>
                            )}

                            {/* Message Content */}
                            <MessageCard
                                post={post}
                                variant="postit"
                                className="w-full h-full bg-transparent shadow-none p-0 text-sm"
                            />

                            {/* Crinkle effect overlay */}
                            <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-br from-white/30 via-transparent to-black/10"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Grid Lines for Authentic Cork Board Look */}
            <div className="absolute inset-0 pointer-events-none opacity-5">
                <div
                    className="w-full h-full"
                    style={{
                        backgroundImage: `
                            linear-gradient(90deg, #8B4513 1px, transparent 1px),
                            linear-gradient(0deg, #8B4513 1px, transparent 1px)
                        `,
                        backgroundSize: '100px 100px'
                    }}
                />
            </div>

            {/* Paper texture overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply">
                <div
                    className="w-full h-full"
                    style={{
                        backgroundImage: `
                            radial-gradient(circle at 25% 25%, rgba(139, 69, 19, 0.1) 0%, transparent 50%),
                            radial-gradient(circle at 75% 75%, rgba(160, 82, 45, 0.1) 0%, transparent 50%)
                        `
                    }}
                />
            </div>
        </div>
    )
}
