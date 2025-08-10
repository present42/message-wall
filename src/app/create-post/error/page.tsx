'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ErrorContent() {
    const searchParams = useSearchParams()
    const errorMessage = searchParams.get('error') || 'An unexpected error occurred'

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                {/* Error Icon */}
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>

                {/* Error Message */}
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Submission Failed 😞
                </h1>

                <p className="text-gray-600 mb-6 leading-relaxed">
                    We encountered an issue while processing your message:
                </p>

                {/* Error Details */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                    <p className="text-red-800 text-sm font-medium">
                        {errorMessage}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Link href="/create-post">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors">
                            Try Again 🔄
                        </Button>
                    </Link>
                </div>

                {/* Help Section */}
                <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                        💡 <strong>Need help?</strong> Make sure your message is under 500 characters and any images are less than 5MB.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function PostErrorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        }>
            <ErrorContent />
        </Suspense>
    )
}
