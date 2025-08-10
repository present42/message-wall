import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
    function middleware(req) {
        // If user is accessing admin routes, check if they have admin role
        if (req.nextUrl.pathname.startsWith('/admin')) {
            if (req.nextUrl.pathname === '/admin/login') {
                // Allow access to login page
                return NextResponse.next()
            }

            // Check if user has admin role
            if (req.nextauth.token?.role !== 'admin') {
                // Redirect to login if not admin
                return NextResponse.redirect(new URL('/admin/login', req.url))
            }
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // Allow access to login page without authentication
                if (req.nextUrl.pathname === '/admin/login') {
                    return true
                }

                // For admin routes, require authentication
                if (req.nextUrl.pathname.startsWith('/admin')) {
                    return !!token
                }

                // Allow all other routes
                return true
            },
        },
    }
)

export const config = {
    matcher: ['/admin/:path*']
}
