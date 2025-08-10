'use client'

import { useSocket } from '@/hooks/useSocket'

interface ConnectionStatusProps {
    className?: string
}

export function ConnectionStatus({ className = "" }: ConnectionStatusProps) {
    const { isConnected, transport } = useSocket({ autoConnect: false })

    return (
        <div className={`flex items-center gap-2 text-sm ${className}`}>
            <div
                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                    }`}
            />
            <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                {isConnected ? `Live (${transport})` : 'Disconnected'}
            </span>
        </div>
    )
}
