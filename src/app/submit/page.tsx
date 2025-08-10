'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

export default function SubmitMessage() {
    const [formData, setFormData] = useState({
        message: '',
        nickname: '',
        email: ''
    })
    const [file, setFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const submitData = new FormData()
            submitData.append('message', formData.message)
            submitData.append('nickname', formData.nickname)
            submitData.append('email', formData.email)

            if (file) {
                submitData.append('image', file)
            }

            const response = await fetch('/api/posts', {
                method: 'POST',
                body: submitData
            })

            if (response.ok) {
                alert('Message submitted successfully! It will appear on the board after approval.')
                setFormData({ message: '', nickname: '', email: '' })
                setFile(null)
                router.push('/')
            } else {
                throw new Error('Failed to submit message')
            }
        } catch (error) {
            console.error('Error submitting message:', error)
            alert('Failed to submit message. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Submit Your Message
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Share your thoughts with the SSC Hub community
                    </p>
                </div>

                <div className="bg-white py-8 px-6 shadow rounded-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Share your message..."
                                value={formData.message}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
                                Nickname (Optional)
                            </label>
                            <Input
                                id="nickname"
                                name="nickname"
                                type="text"
                                placeholder="Your nickname"
                                value={formData.nickname}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email (Optional)
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="your.email@example.com"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                                Image (Optional)
                            </label>
                            <input
                                id="image"
                                name="image"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {file && (
                                <p className="mt-1 text-sm text-gray-500">
                                    Selected: {file.name}
                                </p>
                            )}
                        </div>

                        <div className="flex space-x-4">
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Message'}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/')}
                                className="flex-1"
                            >
                                Back to Board
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
