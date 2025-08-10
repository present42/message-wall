import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    console.log('Missing credentials')
                    return null
                }

                try {
                    console.log('Attempting login with username:', credentials.username)

                    // Find user in database
                    const user = await prisma.user.findUnique({
                        where: {
                            username: credentials.username
                        }
                    })

                    if (!user) {
                        console.log('User not found in database')
                        return null
                    }

                    console.log('User found, checking password...')
                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
                    console.log('Password valid:', isPasswordValid)

                    if (!isPasswordValid) {
                        console.log('Invalid password')
                        return null
                    }

                    console.log('Login successful for user:', user.username)
                    return {
                        id: user.id.toString(),
                        name: user.username,
                        email: user.email,
                        role: 'admin'
                    }
                } catch (error) {
                    console.error('Database error during authentication:', error)
                    return null
                }
            }
        })
    ],
    pages: {
        signIn: '/admin/login'
    },
    session: {
        strategy: 'jwt'
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development'
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = 'admin'
            }
            return token
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub || ''
                session.user.role = token.role as string
            }
            return session
        }
    }
}
