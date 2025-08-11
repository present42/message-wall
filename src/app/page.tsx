import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Message Wall
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              A digital message board system that allows users to submit messages for public display
              with admin moderation. Perfect for events, community boards, and interactive displays.
            </p>
            <div className="flex justify-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Real-time Updates
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Admin Moderation
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                Multiple Board Types
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Features & Access Points</h2>
          <p className="text-lg text-gray-600">Explore the different components of the message wall system</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Message Board */}
          <Link href="/board" className="group relative rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-8 shadow-sm transition-all hover:shadow-lg hover:scale-[1.02]">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                  </svg>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Message Board
                  <span className="inline-block ml-2 transition-transform group-hover:translate-x-1 text-blue-600">→</span>
                </h3>
                <div className="mb-4">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                    🌍 PUBLIC ACCESS
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  The main display board where approved messages appear with beautiful animations.
                  Features multiple board types including Flying Messages, Post-it Notes, and themed layouts.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Real-time message updates</li>
                  <li>• Multiple animation styles</li>
                  <li>• Multimedia support (images, videos, audio)</li>
                  <li>• Responsive design for all screen sizes</li>
                </ul>
              </div>
            </div>
          </Link>

          {/* Submit Message */}
          <Link href="/create-post" className="group relative rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100 p-8 shadow-sm transition-all hover:shadow-lg hover:scale-[1.02]">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Submit Message
                  <span className="inline-block ml-2 transition-transform group-hover:translate-x-1 text-green-600">→</span>
                </h3>
                <div className="mb-4 flex space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                    🌍 PUBLIC ACCESS
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    📱 QR CODE READY
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  User-friendly form for submitting messages to the board. Messages are queued for admin
                  approval before appearing on the public display. Accessible via QR code for easy mobile access.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Simple message submission form</li>
                  <li>• File upload support (images, videos, audio)</li>
                  <li>• Mobile-optimized design</li>
                  <li>• Instant submission confirmation</li>
                </ul>
              </div>
            </div>
          </Link>

          {/* Admin Panel */}
          <Link href="/admin" className="group relative rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-8 shadow-sm transition-all hover:shadow-lg hover:scale-[1.02]">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.45.12l-.737-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Admin Panel
                  <span className="inline-block ml-2 transition-transform group-hover:translate-x-1 text-purple-600">→</span>
                </h3>
                <div className="mb-4">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                    🔒 ADMIN ACCESS ONLY
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  Comprehensive management interface for moderating messages, managing boards, and configuring
                  the system. Protected access for administrators to maintain content quality and system settings.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Message moderation (approve/reject/edit)</li>
                  <li>• Board management and creation</li>
                  <li>• User submission monitoring</li>
                  <li>• System configuration options</li>
                </ul>
              </div>
            </div>
          </Link>

          {/* Documentation */}
          <a href="https://github.com/present42/message-wall" target="_blank" rel="noopener noreferrer" className="group relative rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-8 shadow-sm transition-all hover:shadow-lg hover:scale-[1.02]">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-600 text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  Documentation
                  <span className="inline-block ml-2 transition-transform group-hover:translate-x-1 text-orange-600">↗</span>
                </h3>
                <div className="mb-4">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    🔗 GITHUB REPOSITORY
                  </span>
                </div>
                <p className="text-gray-600 mb-4">
                  Complete technical documentation, setup instructions, and development guides.
                  Access the source code, contribute to the project, and learn about the system architecture.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Installation and setup guide</li>
                  <li>• API documentation</li>
                  <li>• Contributing guidelines</li>
                  <li>• Technical architecture overview</li>
                </ul>
              </div>
            </div>
          </a>
        </div>

        {/* Additional Info Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">System Overview</h3>
            <p className="text-lg text-gray-600 mb-8">
              Built with Next.js, TypeScript, and Prisma for a modern, scalable message board experience
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-2">🎨 Multiple Board Types</h4>
                <p className="text-sm text-gray-600">Flying Messages, Post-it Notes, and custom themed layouts</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-2">📱 Responsive Design</h4>
                <p className="text-sm text-gray-600">Optimized for desktop displays, tablets, and mobile devices</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-2">🔄 Real-time Updates</h4>
                <p className="text-sm text-gray-600">Live message updates without page refresh using WebSocket</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
