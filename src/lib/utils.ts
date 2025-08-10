import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

export function getRandomPosition() {
    return {
        top: Math.random() * 70 + 10, // 10% to 80% from top
        left: Math.random() * 70 + 10, // 10% to 80% from left
    }
}

export function getRandomRotation() {
    return Math.random() * 20 - 10 // -10 to +10 degrees
}

// Collision-aware position generation
interface Position {
    top: number
    left: number
}

interface MessageBounds {
    top: number
    left: number
    right: number
    bottom: number
}

function getMessageBounds(position: Position): MessageBounds {
    // Assume message cards are approximately 300px wide and 200px tall
    const cardWidth = 20 // % of screen
    const cardHeight = 15 // % of screen

    return {
        top: position.top,
        left: position.left,
        right: position.left + cardWidth,
        bottom: position.top + cardHeight
    }
}

function checkCollision(bounds1: MessageBounds, bounds2: MessageBounds): boolean {
    return !(bounds1.right < bounds2.left ||
        bounds2.right < bounds1.left ||
        bounds1.bottom < bounds2.top ||
        bounds2.bottom < bounds1.top)
}

export function getCollisionFreePosition(
    existingPositions: Position[],
    maxAttempts: number = 50,
    minDistance: number = 25 // Minimum distance in percentage to keep messages apart
): Position {
    // If we have too many messages, use a more relaxed approach
    const adjustedMinDistance = existingPositions.length > 8 ? 15 : minDistance

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const candidate = getRandomPosition()
        const candidateBounds = getMessageBounds(candidate)

        let hasCollision = false

        for (const existingPos of existingPositions) {
            const existingBounds = getMessageBounds(existingPos)

            // Check if positions are too close
            const centerDistance = Math.sqrt(
                Math.pow(candidate.left - existingPos.left, 2) +
                Math.pow(candidate.top - existingPos.top, 2)
            )

            if (centerDistance < adjustedMinDistance || checkCollision(candidateBounds, existingBounds)) {
                hasCollision = true
                break
            }
        }

        if (!hasCollision) {
            return candidate
        }
    }

    // If we couldn't find a collision-free position, try a grid-based fallback
    return getGridBasedPosition(existingPositions)
}

// Fallback: Use a loose grid system when random positioning fails
function getGridBasedPosition(existingPositions: Position[]): Position {
    const gridCols = 4
    const gridRows = 3
    const cellWidth = 70 / gridCols // 70% usable width divided by columns
    const cellHeight = 70 / gridRows // 70% usable height divided by rows

    // Try each grid cell with some randomness
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            const baseLeft = 10 + (col * cellWidth) + (Math.random() * cellWidth * 0.3)
            const baseTop = 10 + (row * cellHeight) + (Math.random() * cellHeight * 0.3)

            const candidate = { left: baseLeft, top: baseTop }

            // Check if this grid position is reasonably clear
            const tooClose = existingPositions.some(pos => {
                const distance = Math.sqrt(
                    Math.pow(candidate.left - pos.left, 2) +
                    Math.pow(candidate.top - pos.top, 2)
                )
                return distance < 15 // Reduced minimum distance for fallback
            })

            if (!tooClose) {
                return candidate
            }
        }
    }

    // Last resort: completely random position
    return getRandomPosition()
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
}
