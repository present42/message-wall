'use client'

import { useEffect, useState, useRef } from 'react'
import { Board } from '@/types'
import { QRCodeComponent } from './qr-code'

interface MultimediaBoardWrapperProps {
    board: Board
    children: React.ReactNode
    className?: string
}

export function MultimediaBoardWrapper({ board, children, className = '' }: MultimediaBoardWrapperProps) {
    const [isVideoLoaded, setIsVideoLoaded] = useState(false)
    const [isAudioLoaded, setIsAudioLoaded] = useState(false)
    const [audioError, setAudioError] = useState<string | null>(null)
    const [videoError, setVideoError] = useState<string | null>(null)
    const [isAudioMuted, setIsAudioMuted] = useState(false)
    const [audioVolume, setAudioVolume] = useState(0.3)
    const [isAudioPlaying, setIsAudioPlaying] = useState(false)
    const [showControls, setShowControls] = useState(false)
    const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null)

    const videoRef = useRef<HTMLVideoElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)

    // Construct media URLs
    const getMediaUrl = (filename: string | null | undefined, type: 'video' | 'music' | 'image') => {
        if (!filename) return null

        // Handle different path formats
        if (filename.startsWith('/')) {
            return filename
        }

        // Map type to correct directory
        const typeMap = {
            video: 'videos',
            music: 'music',
            image: 'images'
        }

        return `/${typeMap[type]}/${filename}`
    }

    const backgroundVideoUrl = getMediaUrl(board.backgroundVideo, 'video')
    const backgroundAudioUrl = board.bgMusic && board.bgMusicExtension
        ? getMediaUrl(`${board.bgMusic}.${board.bgMusicExtension}`, 'music')
        : getMediaUrl(board.bgMusic, 'music')
    const backgroundImageUrl = getMediaUrl(board.backgroundImg, 'image')

    // Handle video loading
    useEffect(() => {
        const video = videoRef.current
        if (!video || !backgroundVideoUrl) return

        const handleVideoLoad = () => {
            console.log('🎬 Background video loaded:', backgroundVideoUrl)
            setIsVideoLoaded(true)
            setVideoError(null)
        }

        const handleVideoError = (e: Event) => {
            console.error('❌ Video load error:', backgroundVideoUrl, e)
            setVideoError('Failed to load background video')
            setIsVideoLoaded(false)
        }

        video.addEventListener('loadeddata', handleVideoLoad)
        video.addEventListener('error', handleVideoError)

        return () => {
            video.removeEventListener('loadeddata', handleVideoLoad)
            video.removeEventListener('error', handleVideoError)
        }
    }, [backgroundVideoUrl])

    // Handle audio loading and playback
    useEffect(() => {
        const audio = audioRef.current
        if (!audio || !backgroundAudioUrl) return

        const handleAudioLoad = () => {
            console.log('🎵 Background audio loaded:', backgroundAudioUrl)
            setIsAudioLoaded(true)
            setAudioError(null)

            // Set initial volume
            audio.volume = audioVolume
        }

        const handleAudioError = (e: Event) => {
            console.error('❌ Audio load error:', backgroundAudioUrl, e)
            setAudioError('Failed to load background music')
            setIsAudioLoaded(false)
        }

        audio.addEventListener('loadeddata', handleAudioLoad)
        audio.addEventListener('error', handleAudioError)

        return () => {
            audio.removeEventListener('loadeddata', handleAudioLoad)
            audio.removeEventListener('error', handleAudioError)
        }
    }, [backgroundAudioUrl, audioVolume])

    // Auto-play audio when loaded (with user interaction)
    const handleUserInteraction = () => {
        const audio = audioRef.current
        if (audio && isAudioLoaded && !audioError) {
            audio.play().then(() => {
                setIsAudioPlaying(true)
            }).catch(error => {
                console.warn('⚠️ Audio autoplay blocked:', error)
                // This is normal browser behavior - user needs to interact first
            })
        }
    }

    // Handle mouse movement to show/hide controls
    const handleMouseMove = () => {
        setShowControls(true)

        // Clear existing timeout
        if (controlsTimeout) {
            clearTimeout(controlsTimeout)
        }

        // Set new timeout to hide controls after 3 seconds of inactivity
        const timeout = setTimeout(() => {
            setShowControls(false)
        }, 3000)

        setControlsTimeout(timeout)
    }

    // Handle mouse leave to hide controls faster
    const handleMouseLeave = () => {
        // Clear existing timeout
        if (controlsTimeout) {
            clearTimeout(controlsTimeout)
        }

        // Hide controls after a shorter delay when mouse leaves
        const timeout = setTimeout(() => {
            setShowControls(false)
        }, 1000)

        setControlsTimeout(timeout)
    }

    // Show controls when clicking
    const handleClick = () => {
        handleUserInteraction()
        setShowControls(true)

        // Clear existing timeout
        if (controlsTimeout) {
            clearTimeout(controlsTimeout)
        }

        // Set new timeout to hide controls
        const timeout = setTimeout(() => {
            setShowControls(false)
        }, 5000) // Longer timeout after click

        setControlsTimeout(timeout)
    }

    // Clean up timeout on unmount
    useEffect(() => {
        return () => {
            if (controlsTimeout) {
                clearTimeout(controlsTimeout)
            }
        }
    }, [controlsTimeout])

    // Toggle audio mute
    const toggleAudioMute = () => {
        const audio = audioRef.current
        if (audio) {
            const newMuted = !isAudioMuted
            audio.muted = newMuted
            setIsAudioMuted(newMuted)
        }
    }

    // Update audio volume
    const updateAudioVolume = (newVolume: number) => {
        const audio = audioRef.current
        if (audio) {
            audio.volume = Math.max(0, Math.min(1, newVolume))
            setAudioVolume(newVolume)
        }
    }

    // Generate background styles - prioritize video over image
    const backgroundStyles: React.CSSProperties = {
        backgroundColor: board.backgroundColor || '#f5f5f5',
        // Only show background image if there's no video
        backgroundImage: !backgroundVideoUrl && backgroundImageUrl
            ? `url('${backgroundImageUrl}')`
            : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        fontFamily: board.fontFamily || 'Arial, sans-serif',
        color: board.titleColor || '#333333',
    }

    // Debug logging for media URLs
    console.log('🎬 Multimedia Debug Info:', {
        backgroundVideoUrl,
        backgroundAudioUrl,
        backgroundImageUrl,
        boardTitle: board.title,
        hasVideo: !!backgroundVideoUrl,
        hasAudio: !!backgroundAudioUrl,
        hasImage: !!backgroundImageUrl
    })

    return (
        <div
            className={`relative min-h-screen overflow-hidden ${className}`}
            style={backgroundStyles}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onKeyDown={handleUserInteraction}
        >
            {/* Background Video - positioned at the bottom layer */}
            {backgroundVideoUrl && (
                <div className="absolute inset-0" style={{ zIndex: 1 }}>
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                        onLoadedData={() => {
                            console.log('✅ Video loaded successfully:', backgroundVideoUrl)
                            setIsVideoLoaded(true)
                            setVideoError(null)
                        }}
                        onError={(e) => {
                            console.error('❌ Video error:', backgroundVideoUrl, e)
                            setVideoError('Video failed to load')
                            setIsVideoLoaded(false)
                        }}
                        onLoadStart={() => console.log('🔄 Video loading started:', backgroundVideoUrl)}
                        onPlay={() => console.log('▶️ Video started playing')}
                        onCanPlay={() => console.log('🎬 Video can play')}
                    >
                        <source src={backgroundVideoUrl} type="video/mp4" />
                        <source src={backgroundVideoUrl.replace('.mp4', '.webm')} type="video/webm" />
                        Your browser does not support video backgrounds.
                    </video>

                    {/* Video overlay for better text readability */}
                    <div className="absolute inset-0 bg-black/20"></div>
                </div>
            )}

            {/* Background Audio */}
            {backgroundAudioUrl && (
                <audio
                    ref={audioRef}
                    loop
                    preload="auto"
                    onLoadedData={() => {
                        console.log('✅ Audio loaded successfully:', backgroundAudioUrl)
                        setIsAudioLoaded(true)
                        setAudioError(null)
                    }}
                    onError={(e) => {
                        console.error('❌ Audio error:', backgroundAudioUrl, e)
                        setAudioError('Audio failed to load')
                        setIsAudioLoaded(false)
                    }}
                    onLoadStart={() => console.log('🔄 Audio loading started:', backgroundAudioUrl)}
                    onCanPlayThrough={() => console.log('🎵 Audio ready to play:', backgroundAudioUrl)}
                    onPlay={() => setIsAudioPlaying(true)}
                    onPause={() => setIsAudioPlaying(false)}
                >
                    <source src={backgroundAudioUrl} type="audio/mpeg" />
                    <source src={backgroundAudioUrl.replace(/\.[^.]+$/, '.ogg')} type="audio/ogg" />
                    <source src={backgroundAudioUrl.replace(/\.[^.]+$/, '.wav')} type="audio/wav" />
                    Your browser does not support background audio.
                </audio>
            )}

            {/* Content Overlay */}
            <div className="relative" style={{ zIndex: 10 }}>
                {children}
            </div>

            {/* Media Controls - Only show on mouse movement/click */}
            {backgroundAudioUrl && (
                <div
                    className={`fixed bottom-4 right-4 flex flex-col gap-2 transition-all duration-500 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                        }`}
                    style={{ zIndex: 50 }}
                >
                    {/* Audio Controls */}
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    toggleAudioMute()
                                }}
                                className="flex items-center justify-center w-8 h-8 rounded bg-white/20 hover:bg-white/30 transition-colors"
                                title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
                            >
                                {isAudioMuted ? '🔇' : '🔊'}
                            </button>
                            <div className="text-xs">
                                {audioError ? (
                                    <span className="text-red-400">Audio Error</span>
                                ) : isAudioLoaded ? (
                                    <span className="text-green-400">♪ {isAudioPlaying ? 'Playing' : 'Ready'}</span>
                                ) : (
                                    <span className="text-yellow-400">Loading...</span>
                                )}
                            </div>
                        </div>

                        {/* Volume Slider */}
                        {isAudioLoaded && !audioError && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs">🔉</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={audioVolume}
                                    onChange={(e) => {
                                        e.stopPropagation()
                                        updateAudioVolume(parseFloat(e.target.value))
                                    }}
                                    className="w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer slider"
                                />
                                <span className="text-xs">🔊</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Loading States */}
            {(backgroundVideoUrl && !isVideoLoaded && !videoError) && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center" style={{ zIndex: 20 }}>
                    <div className="bg-white/90 rounded-lg p-4 text-center">
                        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Loading background video...</p>
                    </div>
                </div>
            )}


            {/* User Interaction Prompt - Only show when audio is not playing */}
            {backgroundAudioUrl && isAudioLoaded && !audioError && !isAudioPlaying && (
                <div className="fixed bottom-4 right-1/2 transform translate-x-1/2" style={{ zIndex: 40 }}>
                    <div className="bg-blue-500/90 text-white px-4 py-2 rounded-lg text-sm animate-pulse">
                        Click anywhere to enable background music 🎵
                    </div>
                </div>
            )}

            {/* QR Code for Create Post - Bottom Left Corner */}
            <div className="fixed bottom-4 left-4 z-40">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    <div className="text-center mb-2">
                        <QRCodeComponent
                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/create-post`}
                            size={96}
                        />
                    </div>
                    <p className="text-xs text-gray-700 text-center font-medium">
                        Scan to post a message
                    </p>
                </div>
            </div>

            {/* Error Messages */}
            {(audioError || videoError) && (
                <div className="fixed top-4 right-4 z-40">
                    <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm">
                        {audioError && <div>🎵 {audioError}</div>}
                        {videoError && <div>🎬 {videoError}</div>}
                    </div>
                </div>
            )}

            <style jsx>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    border: 2px solid #3b82f6;
                }
                
                .slider::-moz-range-thumb {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    border: 2px solid #3b82f6;
                }
            `}</style>
        </div>
    )
}
