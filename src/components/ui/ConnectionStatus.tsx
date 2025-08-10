'use client'

import { useSocket } from '@/hooks/useSocket'

interface ConnectionStatusProps {
    showDetails?: boolean
    className?: string
}

export function ConnectionStatus({ showDetails = true, className = "" }: ConnectionStatusProps) {
    const { isConnected, transport } = useSocket()

    return (
        <div className={`inline-flex items-center gap-2 ${className}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />

            {showDetails && (
                <span className="text-sm text-gray-600">
                    {isConnected ? (
                        <>
                            Connected {transport !== 'N/A' && `(${transport})`}
                        </>
                    ) : (
                        'Disconnected'
                    )}
                </span>
            )}
        </div>
    )
}
