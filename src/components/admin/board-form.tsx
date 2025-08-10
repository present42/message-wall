'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Board, BoardType } from '@/types'

interface BoardFormData {
    title: string
    type: BoardType
    backgroundColor: string
    titleColor: string
    backgroundImg: string
    backgroundVideo: string
    bgMusic: string
    bgMusicExtension: string
    fontFamily: string
    postColors: string
}

interface BoardFormProps {
    boardId?: string
}

export default function BoardForm({ boardId }: BoardFormProps = {}) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState<BoardFormData>({
        title: '',
        type: BoardType.FLYING_MESSAGES,
        backgroundColor: '#1a1a2e',
        titleColor: '#ffffff',
        backgroundImg: '',
        backgroundVideo: '',
        bgMusic: '',
        bgMusicExtension: 'mp3',
        fontFamily: 'Arial, sans-serif',
        postColors: ''
    })

    const isEditing = !!boardId

    useEffect(() => {
        if (isEditing) {
            fetchBoard()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [boardId, isEditing])

    const fetchBoard = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/boards/${boardId}`)
            if (response.ok) {
                const board: Board = await response.json()
                setFormData({
                    title: board.title || '',
                    type: board.type,
                    backgroundColor: board.backgroundColor || '#1a1a2e',
                    titleColor: board.titleColor || '#ffffff',
                    backgroundImg: board.backgroundImg || '',
                    backgroundVideo: board.backgroundVideo || '',
                    bgMusic: board.bgMusic || '',
                    bgMusicExtension: board.bgMusicExtension || 'mp3',
                    fontFamily: board.fontFamily || 'Arial, sans-serif',
                    postColors: board.postColors || ''
                })
            }
        } catch (error) {
            console.error('Error fetching board:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const url = isEditing ? `/api/boards/${boardId}` : '/api/boards'
            const method = isEditing ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                router.push('/admin/boards')
            } else {
                console.error('Error saving board')
            }
        } catch (error) {
            console.error('Error saving board:', error)
        } finally {
            setSaving(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const getBoardTypeDescription = (type: BoardType) => {
        switch (type) {
            case BoardType.FLYING_MESSAGES:
                return 'Messages float and drift across the screen with smooth animations'
            case BoardType.POST_IT:
                return 'Messages displayed as colorful post-it notes on a cork board'
            case BoardType.NEWYEAR:
                return 'New Year themed board with festive decorations'
            case BoardType.NEWYEAR_RABBIT:
                return 'New Year rabbit themed board with cute animations'
            default:
                return ''
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-xl">Loading board...</div>
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
                                href="/admin/boards"
                                className="text-gray-600 hover:text-gray-900 mr-4"
                            >
                                ← Back to Boards
                            </Link>
                            <h1 className="text-xl font-semibold">
                                {isEditing ? 'Edit Board' : 'Create New Board'}
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                    Board Title *
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Enter board title"
                                />
                            </div>

                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                                    Board Type *
                                </label>
                                <select
                                    id="type"
                                    name="type"
                                    value={formData.type}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value={BoardType.FLYING_MESSAGES}>✈️ Flying Messages</option>
                                    <option value={BoardType.POST_IT}>📝 Post-it Notes</option>
                                    <option value={BoardType.NEWYEAR}>🎊 New Year Theme</option>
                                    <option value={BoardType.NEWYEAR_RABBIT}>🐰 New Year Rabbit</option>
                                </select>
                                <p className="mt-1 text-sm text-gray-500">
                                    {getBoardTypeDescription(formData.type)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Appearance Settings */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Appearance Settings</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700">
                                    Background Color
                                </label>
                                <div className="mt-1 flex items-center space-x-2">
                                    <input
                                        type="color"
                                        id="backgroundColor"
                                        name="backgroundColor"
                                        value={formData.backgroundColor}
                                        onChange={handleInputChange}
                                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={formData.backgroundColor}
                                        onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                                        className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="#1a1a2e"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="titleColor" className="block text-sm font-medium text-gray-700">
                                    Title Color
                                </label>
                                <div className="mt-1 flex items-center space-x-2">
                                    <input
                                        type="color"
                                        id="titleColor"
                                        name="titleColor"
                                        value={formData.titleColor}
                                        onChange={handleInputChange}
                                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={formData.titleColor}
                                        onChange={(e) => setFormData(prev => ({ ...prev, titleColor: e.target.value }))}
                                        className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="#ffffff"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="fontFamily" className="block text-sm font-medium text-gray-700">
                                    Font Family
                                </label>
                                <select
                                    id="fontFamily"
                                    name="fontFamily"
                                    value={formData.fontFamily}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="Arial, sans-serif">Arial</option>
                                    <option value="Georgia, serif">Georgia</option>
                                    <option value="'Times New Roman', serif">Times New Roman</option>
                                    <option value="'Courier New', monospace">Courier New</option>
                                    <option value="Verdana, sans-serif">Verdana</option>
                                    <option value="Impact, sans-serif">Impact</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="backgroundImg" className="block text-sm font-medium text-gray-700">
                                    Background Image (filename)
                                </label>
                                <input
                                    type="text"
                                    id="backgroundImg"
                                    name="backgroundImg"
                                    value={formData.backgroundImg}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="background.jpg"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Upload image to /public/images/ folder
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Media Settings */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Media Settings</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="backgroundVideo" className="block text-sm font-medium text-gray-700">
                                    Background Video (filename)
                                </label>
                                <input
                                    type="text"
                                    id="backgroundVideo"
                                    name="backgroundVideo"
                                    value={formData.backgroundVideo}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="background.mp4"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Upload video to /public/videos/ folder. Supports MP4, WebM formats.
                                </p>
                            </div>

                            <div>
                                <label htmlFor="bgMusic" className="block text-sm font-medium text-gray-700">
                                    Background Music (filename)
                                </label>
                                <div className="mt-1 flex space-x-2">
                                    <input
                                        type="text"
                                        id="bgMusic"
                                        name="bgMusic"
                                        value={formData.bgMusic}
                                        onChange={handleInputChange}
                                        className="flex-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="background-music"
                                    />
                                    <select
                                        id="bgMusicExtension"
                                        name="bgMusicExtension"
                                        value={formData.bgMusicExtension}
                                        onChange={handleInputChange}
                                        className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="mp3">MP3</option>
                                        <option value="wav">WAV</option>
                                        <option value="ogg">OGG</option>
                                    </select>
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                    Upload music to /public/music/ folder. Supports MP3, WAV, OGG formats.
                                </p>
                            </div>

                            {/* Multimedia Preview */}
                            <div className="md:col-span-2">
                                <h3 className="text-sm font-medium text-gray-700 mb-2">Multimedia Preview</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Video Preview */}
                                    {formData.backgroundVideo && (
                                        <div className="bg-gray-100 rounded-lg p-3">
                                            <div className="flex items-center mb-2">
                                                <span className="text-lg">🎬</span>
                                                <span className="ml-2 text-sm font-medium">Background Video</span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                <div>File: {formData.backgroundVideo}</div>
                                                <div>Path: /public/videos/{formData.backgroundVideo}</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Video will loop automatically as background
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Audio Preview */}
                                    {formData.bgMusic && (
                                        <div className="bg-gray-100 rounded-lg p-3">
                                            <div className="flex items-center mb-2">
                                                <span className="text-lg">🎵</span>
                                                <span className="ml-2 text-sm font-medium">Background Music</span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                <div>File: {formData.bgMusic}.{formData.bgMusicExtension}</div>
                                                <div>Path: /public/music/{formData.bgMusic}.{formData.bgMusicExtension}</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Music will loop with volume controls
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* No Multimedia Message */}
                                    {!formData.backgroundVideo && !formData.bgMusic && (
                                        <div className="md:col-span-2 bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                                            <span className="text-2xl block mb-2">🎭</span>
                                            <div className="text-sm">
                                                Add background video or music to create an immersive experience
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Board Preview</h2>
                        <div
                            className="h-32 rounded-lg flex items-center justify-center text-white relative overflow-hidden"
                            style={{
                                backgroundColor: formData.backgroundColor,
                                backgroundImage: formData.backgroundImg ? `url(/images/${formData.backgroundImg})` : undefined,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                fontFamily: formData.fontFamily
                            }}
                        >
                            <div className="text-center z-10">
                                <h3 className="text-xl font-bold" style={{ color: formData.titleColor }}>
                                    {formData.title || 'Board Title'}
                                </h3>
                                <p className="text-sm opacity-80">
                                    {formData.type.replace('_', ' ')} Layout
                                </p>
                            </div>
                            {formData.backgroundImg && (
                                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                            )}

                            {/* Multimedia Indicators */}
                            <div className="absolute top-2 right-2 flex space-x-1">
                                {formData.backgroundVideo && (
                                    <div className="bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                                        🎬 Video
                                    </div>
                                )}
                                {formData.bgMusic && (
                                    <div className="bg-black/70 text-white px-2 py-1 rounded-full text-xs">
                                        🎵 Audio
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Preview Features */}
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div className="flex items-center text-gray-600">
                                <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
                                Responsive Design
                            </div>
                            <div className="flex items-center text-gray-600">
                                <span className="w-3 h-3 bg-blue-400 rounded-full mr-2"></span>
                                Real-time Updates
                            </div>
                            <div className="flex items-center text-gray-600">
                                <span className="w-3 h-3 bg-purple-400 rounded-full mr-2"></span>
                                {formData.backgroundVideo ? 'Video Background' : 'Static Background'}
                            </div>
                            <div className="flex items-center text-gray-600">
                                <span className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></span>
                                {formData.bgMusic ? 'Background Audio' : 'Silent Mode'}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4">
                        <Link
                            href="/admin/boards"
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md"
                        >
                            {saving ? 'Saving...' : (isEditing ? 'Update Board' : 'Create Board')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
