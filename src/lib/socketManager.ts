import { io, Socket } from 'socket.io-client'
import { WebSocketMessage } from '@/types'

// Singleton socket manager to prevent multiple connections
class SocketManager {
    private socket: Socket | null = null
    private connectionPromise: Promise<Socket> | null = null
    private listeners: Map<string, Set<(message: WebSocketMessage) => void>> = new Map()

    private isConnected = false
    private connectionCallbacks: Set<() => void> = new Set()
    private disconnectionCallbacks: Set<() => void> = new Set()

    // Throttle connection attempts
    private lastConnectionAttempt = 0
    private connectionThrottleMs = 1000 // 1 second between attempts

    // Track if we're in development mode for better hot-reload handling
    private isDevelopment = process.env.NODE_ENV !== 'production'

    async getSocket(): Promise<Socket> {
        // Return existing connected socket
        if (this.socket?.connected) {
            return this.socket
        }

        // Return existing connection promise
        if (this.connectionPromise) {
            return this.connectionPromise
        }

        // Throttle connection attempts
        const now = Date.now()
        if (now - this.lastConnectionAttempt < this.connectionThrottleMs) {
            console.log('🚦 WebSocket connection throttled, waiting...')
            await new Promise(resolve => setTimeout(resolve, this.connectionThrottleMs - (now - this.lastConnectionAttempt)))
        }

        this.lastConnectionAttempt = Date.now()

        this.connectionPromise = new Promise((resolve, reject) => {
            console.log('🔗 Creating singleton WebSocket connection...')

            // Clean up any existing socket first
            if (this.socket) {
                this.socket.removeAllListeners()
                this.socket.disconnect()
                this.socket = null
            }

            const socket = io(this.isDevelopment ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_SITE_URL || ''), {
                path: '/api/socketio',
                forceNew: false,
                timeout: 5000,
                reconnection: true,
                reconnectionDelay: 2000,
                reconnectionAttempts: 3,
                transports: ['websocket', 'polling'],
                // Prevent multiple connections from same client
                autoConnect: true,
                upgrade: true
            })

            // Connection success
            socket.on('connect', () => {
                console.log('✅ WebSocket connected successfully:', socket.id?.substring(0, 8))
                this.isConnected = true
                this.socket = socket
                this.connectionCallbacks.forEach(callback => {
                    try {
                        callback()
                    } catch (error) {
                        console.error('Error in connection callback:', error)
                    }
                })
                resolve(socket)
            })

            // Connection failure
            socket.on('connect_error', (error) => {
                console.error('❌ WebSocket connection failed:', error.message)
                this.connectionPromise = null
                this.lastConnectionAttempt = 0 // Reset throttle on error
                reject(error)
            })

            // Disconnection
            socket.on('disconnect', (reason) => {
                console.log('📴 WebSocket disconnected:', reason)
                this.isConnected = false
                this.socket = null
                this.connectionPromise = null
                this.disconnectionCallbacks.forEach(callback => {
                    try {
                        callback()
                    } catch (error) {
                        console.error('Error in disconnection callback:', error)
                    }
                })
            })

            // Handle messages
            socket.on('message', (message: WebSocketMessage) => {
                this.listeners.forEach(listenersSet => {
                    listenersSet.forEach(listener => {
                        try {
                            listener(message)
                        } catch (error) {
                            console.error('Error in message listener:', error)
                        }
                    })
                })
            })

            // Store socket reference immediately
            this.socket = socket
        })

        return this.connectionPromise
    }

    addMessageListener(id: string, callback: (message: WebSocketMessage) => void) {
        if (!this.listeners.has(id)) {
            this.listeners.set(id, new Set())
        }
        this.listeners.get(id)!.add(callback)
    }

    removeMessageListener(id: string, callback: (message: WebSocketMessage) => void) {
        const listenersSet = this.listeners.get(id)
        if (listenersSet) {
            listenersSet.delete(callback)
            if (listenersSet.size === 0) {
                this.listeners.delete(id)
            }
        }
    }

    addConnectionListener(callback: () => void) {
        this.connectionCallbacks.add(callback)
        // If already connected, call immediately
        if (this.isConnected) {
            callback()
        }
    }

    removeConnectionListener(callback: () => void) {
        this.connectionCallbacks.delete(callback)
    }

    addDisconnectionListener(callback: () => void) {
        this.disconnectionCallbacks.add(callback)
    }

    removeDisconnectionListener(callback: () => void) {
        this.disconnectionCallbacks.delete(callback)
    }

    async emit(event: string, data: unknown) {
        try {
            const socket = await this.getSocket()
            socket.emit(event, data)
        } catch (error) {
            console.error('Failed to emit event:', error)
        }
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            transport: this.socket?.io.engine.transport.name || 'N/A'
        }
    }

    disconnect() {
        if (this.socket) {
            console.log('🔌 Manually disconnecting singleton WebSocket')
            this.socket.disconnect()
            this.socket = null
            this.connectionPromise = null
        }
    }

    // Clean up when page unloads
    cleanup() {
        this.listeners.clear()
        this.connectionCallbacks.clear()
        this.disconnectionCallbacks.clear()
        this.disconnect()
    }
}

// Export singleton instance
export const socketManager = new SocketManager()

// Connection guard - ensure only one connection per page session
let globalConnectionId: string | null = null

// Clean up on page unload
if (typeof window !== 'undefined') {
    // Generate unique session ID
    globalConnectionId = `session-${Date.now()}-${Math.random().toString(36).substring(2)}`
    console.log('🆔 WebSocket session ID:', globalConnectionId.substring(0, 16))

    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        console.log('🚪 Page unloading, cleaning up WebSocket')
        socketManager.cleanup()
    })

    // Handle visibility changes to prevent background connections
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            console.log('📱 Page hidden, maintaining WebSocket connection')
        } else {
            console.log('👁️ Page visible, WebSocket ready')
        }
    })
}
