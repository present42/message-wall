'use client'

import { useEffect, useState, useMemo } from 'react'
import { Post, Board } from '@/types'
import { MessageCard } from '@/components/ui/message-card'
import { getRandomPosition, getRandomRotation } from '@/lib/utils'
import '@/styles/board-animations.css'

interface PostItBoardProps {
    board: Board
    posts: Post[]
    variant: 'postit' | 'postit-pin' | 'postit-tape'
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

export function PostItBoard({ board, posts, variant }: PostItBoardProps) {
    const [displayedPosts, setDisplayedPosts] = useState<PositionedPost[]>([])
    // const { socket } = useSocket() // Commented out until socket functionality is implemented

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

    // Listen for new posts via socket (commented out socket functionality for now)
    // useEffect(() => {
    //     if (!socket) return;
    //     socket.on('newPost', (newPost: Post) => {
    //         if (newPost.boardId === board.id) {
    //             const positionedPost: PositionedPost = {
    //                 ...newPost,
    //                 position: getRandomPosition(),
    //                 rotation: getRandomRotation() * 0.5,
    //                 color: postitColors[Math.floor(Math.random() * postitColors.length)],
    //                 enterDelay: 0,
    //             };
    //             setDisplayedPosts(prev => [...prev, positionedPost]);
    //         }
    //     });
    //     return () => {
    //         socket.off('newPost');
    //     };
    // }, [socket, board.id]);

    const backgroundStyles: React.CSSProperties = {
        backgroundColor: board.backgroundColor || '#f5f5f5',
        backgroundImage: board.backgroundImg ? `url(/images/${board.backgroundImg})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        fontFamily: board.fontFamily || 'Arial, sans-serif'
    }

    const getVariantType = () => {
        switch (variant) {
            case 'postit':
                return 'postit'
            case 'postit-pin':
                return 'postit-pin'
            case 'postit-tape':
                return 'postit-tape'
            default:
                return 'postit'
        }
    }

    return (
        <div
            className="relative w-full h-screen overflow-hidden"
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
                    className="absolute top-8 left-1/2 transform -translate-x-1/2 text-4xl font-bold z-10"
                    style={{ color: board.titleColor || '#333' }}
                >
                    {board.title}
                </h1>
            )}

            {/* Post-it Messages */}
            <div className="absolute inset-0 p-8">
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 h-full">
                    {displayedPosts.map((post, index) => (
                        <MessageCard
                            key={post.id}
                            post={post}
                            variant={getVariantType()}
                            className="hover:z-10 transition-all duration-300"
                            style={{
                                transform: `rotate(${post.rotation}deg)`,
                                animationDelay: `${index * 0.1}s`,
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Cork board texture overlay for pin variant */}
            {variant === 'postit-pin' && (
                <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(circle at 50px 50px, #8B4513 2px, transparent 2px)`,
                        backgroundSize: '100px 100px'
                    }}
                />
            )}
        </div>
    )
}
