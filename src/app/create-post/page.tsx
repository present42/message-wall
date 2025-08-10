'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface PostFormData {
    message: string
    nickname: string
    email: string
    files: File[]
}

export default function CreatePostWithUpload() {
    const [formData, setFormData] = useState<PostFormData>({
        message: '',
        nickname: '',
        email: '',
        files: []
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleInputChange = (field: keyof PostFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files) {
            setFormData(prev => ({
                ...prev,
                files: Array.from(files)
            }))
        }
    }

    const removeFile = (index: number) => {
        setFormData(prev => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index)
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            console.log('Starting form submission with data:', formData)

            // For now, we'll use the simpler FormData approach to match the working API
            const form = new FormData()
            form.append('message', formData.message)
            form.append('nickname', formData.nickname)
            form.append('email', formData.email)

            // Handle file uploads
            if (formData.files.length > 0) {
                console.log('Processing files:', formData.files)
                // For now, just take the first file as 'image' for compatibility
                const firstFile = formData.files[0]
                form.append('image', firstFile)
                console.log('Added image file to FormData:', firstFile.name)
            }

            console.log('Submitting FormData to API...')

            // Submit to the posts API using FormData (legacy format)
            const response = await fetch('/api/posts', {
                method: 'POST',
                body: form  // Don't set Content-Type, let browser set it for FormData
            })

            console.log('Response status:', response.status, response.statusText)
            const result = await response.json()
            console.log('API Response:', result)

            if (!response.ok) {
                throw new Error(result.error || `API call failed with status ${response.status}`)
            }

            console.log('Post created successfully:', result)

            // Redirect to success page using window.location for more reliable redirect
            console.log('Redirecting to success page...')
            window.location.href = '/create-post/success'

        } catch (error) {
            console.error('Failed to create post:', error)

            // Redirect to error page with error message
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
            console.log('Redirecting to error page with message:', errorMessage)
            window.location.href = `/create-post/error?error=${encodeURIComponent(errorMessage)}`
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="container mx-auto max-w-2xl px-4 py-8">
                {/* Header Section */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-3">Share Your Message</h1>
                    <p className="text-lg text-gray-600 max-w-lg mx-auto">
                        Express yourself! Your message will be reviewed by our team and displayed on the message wall.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div>
                            <label htmlFor="nickname" className="block text-sm font-semibold text-gray-900 mb-3">
                                Your Nickname ✨
                            </label>
                            <input
                                type="text"
                                id="nickname"
                                value={formData.nickname}
                                onChange={(e) => handleInputChange('nickname', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900"
                                required
                                placeholder="How should we call you?"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-3">
                                Email Address 📧 <span className="font-normal text-gray-500">(Optional)</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-gray-900"
                                placeholder="your@email.com (optional)"
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-3">
                                Your Message 💭
                            </label>
                            <textarea
                                id="message"
                                value={formData.message}
                                onChange={(e) => handleInputChange('message', e.target.value)}
                                rows={6}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none text-gray-900"
                                required
                                placeholder="What would you like to share with the world?"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                {formData.message.length}/500 characters
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                                Add an Image 📸 <span className="font-normal text-gray-500">(Optional)</span>
                            </label>
                            <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="space-y-2 pointer-events-none">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium">Click to upload an image</p>
                                    <p className="text-xs text-gray-500">JPEG, PNG, GIF, WebP • Max 5MB</p>
                                </div>
                            </div>
                        </div>

                        {/* Show selected files with enhanced styling */}
                        {formData.files.length > 0 && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                                <h3 className="text-sm font-semibold text-green-900 mb-4 flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Selected Image:
                                </h3>
                                <div className="space-y-3">
                                    {formData.files.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-white border border-green-200 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="text-red-500 hover:text-red-700 font-medium text-sm transition-colors"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-4">
                            <Button
                                type="submit"
                                disabled={isSubmitting || !formData.message || !formData.nickname}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                        Submitting Your Message...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                        Send Message 🚀
                                    </div>
                                )}
                            </Button>
                        </div>
                    </form>

                    {/* Help Text */}
                    <div className="mt-8 p-4 bg-blue-50 rounded-xl">
                        <p className="text-sm text-blue-800 text-center">
                            💡 <strong>Your privacy matters:</strong> Messages are reviewed before publishing. We respect your data and will not share your email.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
