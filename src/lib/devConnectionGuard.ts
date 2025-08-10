'use client'

// Development-only WebSocket connection guard
// Prevents excessive connections during hot reloads
class DevConnectionGuard {
    private static instance: DevConnectionGuard
    private connectionAttempts: number = 0
    private lastAttempt: number = 0
    private readonly maxAttempts = 1
    private readonly cooldownMs = 2000

    static getInstance(): DevConnectionGuard {
        if (!DevConnectionGuard.instance) {
            DevConnectionGuard.instance = new DevConnectionGuard()
        }
        return DevConnectionGuard.instance
    }

    canConnect(): boolean {
        const now = Date.now()

        // Reset counter if cooldown period has passed
        if (now - this.lastAttempt > this.cooldownMs) {
            this.connectionAttempts = 0
        }

        // Check if we can make a connection
        if (this.connectionAttempts >= this.maxAttempts) {
            console.log('🚦 WebSocket connection blocked by dev guard')
            return false
        }

        this.connectionAttempts++
        this.lastAttempt = now
        return true
    }

    reset() {
        this.connectionAttempts = 0
        this.lastAttempt = 0
    }
}

export const devConnectionGuard = DevConnectionGuard.getInstance()
