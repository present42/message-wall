'use client'

import { SessionProvider } from 'next-auth/react'

interface ProvidersProps {
    children: React.ReactNode
    session?: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function Providers({ children, session }: ProvidersProps) {
    return (
        <SessionProvider session={session}>
            {children}
        </SessionProvider>
    )
}
