'use client'

import { useEffect, useState, useCallback } from 'react'
import { Post, Board } from '@/types'
import { MessageCard } from '@/components/ui/message-card'
import { getRandomPosition, getRandomRotation, getCollisionFreePosition } from '@/lib/utils'

interface FlyingMessagesBoardProps {
    board: Board
    posts: Post[]
}

interface PositionedPost extends Post {
    position: { top: number; left: number }
    rotation: number
    animationType: 'float' | 'cross' | 'static'
    enterDelay: number
    isExiting?: boolean
}

export function FlyingMessagesBoard({ board, posts }: FlyingMessagesBoardProps) {
    const [displayedPosts, setDisplayedPosts] = useState<PositionedPost[]>([])
    const [messageQueue, setMessageQueue] = useState<Post[]>([])

    // Initialize message queue when posts change
    useEffect(() => {
        if (posts.length > 0) {
            setMessageQueue(posts)
            setDisplayedPosts([]) // Clear existing messages
        }
    }, [posts])

    // Function to generate next message from queue
    const generateNextMessage = useCallback(() => {
        setMessageQueue(prev => {
            if (prev.length === 0) return prev

            const [nextPost, ...remaining] = prev

            // Check if this post content is already being displayed using current state
            setDisplayedPosts(currentDisplayed => {
                const isAlreadyDisplayed = currentDisplayed.some(displayed =>
                    displayed.message === nextPost.message &&
                    displayed.nickname === nextPost.nickname &&
                    displayed.animationType !== 'cross' // Allow crossing messages to duplicate content
                )

                if (isAlreadyDisplayed) {
                    console.log(`⚠️ Skipping duplicate message: "${nextPost.message}" by ${nextPost.nickname}`)
                    // Schedule next message generation if there are more messages
                    if (remaining.length > 0) {
                        const delay = 3000 + Math.random() * 2000 // 3-5 seconds
                        setTimeout(generateNextMessage, delay)
                    }
                    return currentDisplayed // Return current state unchanged
                }

                // Get existing positions for collision detection
                const existingPositions = currentDisplayed
                    .filter(p => p.animationType !== 'cross') // Don't avoid crossing messages
                    .map(p => p.position)

                console.log(`🎯 Finding position for "${nextPost.message}" (${existingPositions.length} existing messages)`)

                // Create positioned post with collision-free positioning
                const positionedPost: PositionedPost = {
                    ...nextPost,
                    id: Date.now() + Math.random(), // Ensure unique ID
                    position: getCollisionFreePosition(existingPositions),
                    rotation: getRandomRotation(),
                    animationType: Math.random() < 0.7 ? 'float' : 'static', // 70% float, 30% static
                    enterDelay: 0,
                    isExiting: false
                }

                console.log(`📍 Positioned at ${positionedPost.position.left.toFixed(1)}%, ${positionedPost.position.top.toFixed(1)}%`)

                console.log(`➕ Generated message (ID: ${positionedPost.id}): "${nextPost.message}" by ${nextPost.nickname}`)

                // Schedule message removal after lifespan
                setTimeout(() => {
                    console.log(`⏰ Marking message for removal (ID: ${positionedPost.id})`)
                    setDisplayedPosts(current =>
                        current.map(p =>
                            p.id === positionedPost.id ? { ...p, isExiting: true } : p
                        )
                    )

                    // Remove completely after fade animation
                    setTimeout(() => {
                        console.log(`➖ Completely removing message (ID: ${positionedPost.id})`)
                        setDisplayedPosts(current =>
                            current.filter(p => p.id !== positionedPost.id)
                        )
                    }, 1000) // 1 second for fade out animation

                }, 20000) // 20 seconds lifespan

                return [...currentDisplayed, positionedPost]
            })

            // Schedule next message generation if there are more messages
            if (remaining.length > 0) {
                const delay = 3000 + Math.random() * 2000 // 3-5 seconds
                setTimeout(generateNextMessage, delay)
            }

            return remaining
        })
    }, [])

    // Generate messages at staggered intervals
    useEffect(() => {
        if (messageQueue.length === 0) return

        const delay = 3000 + Math.random() * 2000 // 3-5 seconds
        const timeoutId = setTimeout(generateNextMessage, delay)

        return () => clearTimeout(timeoutId)
    }, [messageQueue, generateNextMessage])

    // Restart message generation when queue is empty (continuous loop)
    useEffect(() => {
        if (messageQueue.length === 0 && posts.length > 0) {
            console.log('🔄 Restarting message queue')
            setTimeout(() => {
                setMessageQueue(posts)
            }, 5000) // Wait 5 seconds before restarting
        }
    }, [messageQueue.length, posts])

    // Generate crossing messages periodically
    useEffect(() => {
        if (posts.length === 0) return

        const interval = setInterval(() => {
            // Only generate crossing messages if we don't have too many already
            const crossingMessages = displayedPosts.filter(p => p.animationType === 'cross')
            if (crossingMessages.length >= 2) return // Limit crossing messages

            if (Math.random() < 0.25) { // 25% chance every 10 seconds
                // Pick a random post from the original posts array, not displayed posts
                const randomPost = posts[Math.floor(Math.random() * posts.length)]

                const crossingMessage: PositionedPost = {
                    ...randomPost,
                    id: Date.now() + Math.random() + 1000000, // Ensure unique ID different from static/floating
                    animationType: 'cross',
                    position: { left: -10, top: getRandomPosition().top },
                    rotation: getRandomRotation(),
                    enterDelay: 0,
                    isExiting: false
                }

                console.log(`➕ Generated crossing message (ID: ${crossingMessage.id})`)

                setDisplayedPosts(prev => [...prev, crossingMessage])

                // Remove crossing message after animation (12 seconds)
                setTimeout(() => {
                    console.log(`➖ Removing crossing message (ID: ${crossingMessage.id})`)
                    setDisplayedPosts(current =>
                        current.filter(p => p.id !== crossingMessage.id)
                    )
                }, 12000)
            }
        }, 10000) // Check every 10 seconds

        return () => clearInterval(interval)
    }, [posts, displayedPosts])

    const backgroundStyles: React.CSSProperties = {
        // Remove background styling - let MultimediaBoardWrapper handle this
        fontFamily: board.fontFamily || 'Arial, sans-serif'
    }

    return (
        <div
            className="relative w-full h-screen overflow-hidden"
            style={backgroundStyles}
        >
            {/* Animated Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-800/5 via-cyan-700/4 to-emerald-600/3">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,178,172,0.08),transparent)] animate-pulse"></div>
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.03),transparent)] animate-spin" style={{ animationDuration: '20s' }}></div>

                {/* Subtle positioning grid - only visible when there are multiple messages */}
                {displayedPosts.filter(p => p.animationType !== 'cross').length > 3 && (
                    <div className="absolute inset-0 opacity-5">
                        <div className="h-full w-full"
                            style={{
                                backgroundImage: `
                                    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                                 `,
                                backgroundSize: '25% 25%'
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 20 }).map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 4}s`,
                            animationDuration: `${3 + Math.random() * 4}s`,
                        }}
                    />
                ))}
            </div>

            {/* Board Title */}
            {board.title && (
                <h1
                    className="absolute top-8 left-1/2 transform -translate-x-1/2 text-4xl font-bold z-10"
                    style={{ color: board.titleColor || '#fff' }}
                >
                    {board.title}
                </h1>
            )}

            {/* Displayed Messages */}
            {displayedPosts.map((post) => (
                <div
                    key={post.id}
                    className={`absolute ${post.isExiting
                        ? 'flying-message-exit'
                        : post.animationType === 'cross'
                            ? 'flying-message-cross'
                            : post.animationType === 'float'
                                ? 'flying-message-float'
                                : 'flying-message-static'
                        }`}
                    style={{
                        top: `${post.position.top}%`,
                        left: `${post.position.left}%`,
                        '--rotation': `${post.rotation}deg`,
                        '--delay': `${post.enterDelay}s`,
                        zIndex: 5,
                    } as React.CSSProperties}
                >
                    <MessageCard post={post} />
                </div>
            ))}
        </div>
    )
}
