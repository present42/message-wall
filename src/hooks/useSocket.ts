import { useEffect, useRef, useState, useCallback } from 'react'
import { socketManager } from '@/lib/socketManager'
import { WebSocketMessage } from '@/types'

interface UseSocketOptions {
    autoConnect?: boolean
    onMessage?: (message: WebSocketMessage) => void
    onConnect?: () => void
    onDisconnect?: () => void
}

export function useSocket(options: UseSocketOptions = {}) {
    const { autoConnect = true, onMessage, onConnect, onDisconnect } = options
    const [isConnected, setIsConnected] = useState(false)
    const [transport, setTransport] = useState('N/A')
    const hookId = useRef(`hook-${Math.random().toString(36).substring(2)}`)
    const initializationRef = useRef(false)

    // Stable callback references
    const stableOnMessage = useCallback((message: WebSocketMessage) => {
        onMessage?.(message)
    }, [onMessage])

    const stableOnConnect = useCallback(() => {
        onConnect?.()
    }, [onConnect])

    const stableOnDisconnect = useCallback(() => {
        onDisconnect?.()
    }, [onDisconnect])

    useEffect(() => {
        if (!autoConnect || initializationRef.current) return

        initializationRef.current = true
        const currentHookId = hookId.current

        console.log(`🔗 Initializing useSocket hook: ${currentHookId.substring(0, 8)}`)

        const updateConnectionStatus = () => {
            const status = socketManager.getConnectionStatus()
            setIsConnected(status.isConnected)
            setTransport(status.transport)
        }

        const handleConnect = () => {
            updateConnectionStatus()
            stableOnConnect()
        }

        const handleDisconnect = () => {
            updateConnectionStatus()
            stableOnDisconnect()
        }

        // Add listeners
        if (onConnect) socketManager.addConnectionListener(handleConnect)
        if (onDisconnect) socketManager.addDisconnectionListener(handleDisconnect)
        if (onMessage) socketManager.addMessageListener(currentHookId, stableOnMessage)

        // Initialize connection with debounce
        const initConnection = async () => {
            try {
                await socketManager.getSocket()
                updateConnectionStatus()
            } catch (error) {
                console.error('Failed to initialize WebSocket:', error)
            }
        }

        // Debounce initialization
        const timeoutId = setTimeout(initConnection, 100)

        // Initial status update
        updateConnectionStatus()

        return () => {
            clearTimeout(timeoutId)
            // Clean up listeners
            if (onConnect) socketManager.removeConnectionListener(handleConnect)
            if (onDisconnect) socketManager.removeDisconnectionListener(handleDisconnect)
            if (onMessage) socketManager.removeMessageListener(currentHookId, stableOnMessage)

            console.log(`🧹 Cleaning up useSocket hook: ${currentHookId.substring(0, 8)}`)
            initializationRef.current = false
        }
    }, [autoConnect, onConnect, onDisconnect, onMessage, stableOnConnect, stableOnDisconnect, stableOnMessage])

    // Join admin room
    const joinAdmin = async () => {
        await socketManager.emit('join-admin', undefined)
        console.log('👑 Joined admin room')
    }

    // Join board room
    const joinBoard = async (boardId: string) => {
        await socketManager.emit('join-board', boardId)
        console.log(`📋 Joined board-${boardId}`)
    }

    // Leave board room
    const leaveBoard = async (boardId: string) => {
        await socketManager.emit('leave-board', boardId)
        console.log(`📋 Left board-${boardId}`)
    }

    // Send message
    const sendMessage = async (message: WebSocketMessage) => {
        await socketManager.emit('message', message)
        console.log('📤 Sent WebSocket message:', message)
    }

    // Disconnect manually
    const disconnect = () => {
        socketManager.disconnect()
    }

    return {
        socket: null, // Don't expose the socket directly
        isConnected,
        transport,
        joinAdmin,
        joinBoard,
        leaveBoard,
        sendMessage,
        disconnect
    }
}
