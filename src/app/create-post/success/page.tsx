'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PostSuccessPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                {/* Success Icon */}
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                {/* Success Message */}
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Message Submitted Successfully! 🎉
                </h1>

                <p className="text-gray-600 mb-8 leading-relaxed">
                    Your message has been received and is now under review by our admin team.
                    Once approved, it will appear on the message wall for everyone to see!
                </p>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <Link href="/create-post">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors">
                            Submit Another Message ✍️
                        </Button>
                    </Link>
                </div>

                {/* Additional Info */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                        💡 <strong>Tip:</strong> Messages are typically reviewed within a few hours during business hours.
                    </p>
                </div>
            </div>
        </div>
    )
}
