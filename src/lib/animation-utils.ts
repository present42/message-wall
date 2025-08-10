/**
 * Advanced animation utilities for enhanced board layouts
 */

export interface AnimationConfig {
    duration: number;
    delay: number;
    easing: string;
}

export interface Position {
    x: number;
    y: number;
    rotation?: number;
}

// Enhanced position generation with collision detection
export function getRandomPositionAdvanced(
    existingPositions: Position[] = [],
    minDistance = 150
): Position {
    let attempts = 0;
    let position: Position;

    do {
        position = {
            x: Math.random() * 80 + 10, // 10-90% range
            y: Math.random() * 80 + 10,
            rotation: (Math.random() - 0.5) * 20, // -10 to +10 degrees
        };
        attempts++;
    } while (
        attempts < 50 &&
        hasCollision(position, existingPositions, minDistance)
    );

    return position;
}

function hasCollision(
    newPos: Position,
    existingPos: Position[],
    minDistance: number
): boolean {
    return existingPos.some(pos => {
        const dx = newPos.x - pos.x;
        const dy = newPos.y - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < minDistance / 10; // Convert to percentage-based distance
    });
}

// Animation timing functions
export const easingFunctions = {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
};

// Generate staggered animation delays
export function generateStaggeredDelays(
    count: number,
    baseDelay = 100,
    pattern: 'linear' | 'wave' | 'random' = 'linear'
): number[] {
    const delays: number[] = [];

    for (let i = 0; i < count; i++) {
        switch (pattern) {
            case 'wave':
                delays.push(baseDelay * Math.sin(i * 0.3) + baseDelay * i * 0.5);
                break;
            case 'random':
                delays.push(Math.random() * baseDelay * 2);
                break;
            default: // linear
                delays.push(baseDelay * i);
        }
    }

    return delays;
}

// Create flying trajectory for crossing messages
export function generateFlyingPath(startY: number): {
    keyframes: string;
    duration: number;
} {
    const controlY1 = startY + (Math.random() - 0.5) * 20;
    const controlY2 = startY + (Math.random() - 0.5) * 20;
    const endY = startY + (Math.random() - 0.5) * 10;

    const keyframes = `
    0% {
      transform: translateX(-10vw) translateY(${startY}vh) rotate(0deg) scale(0.8);
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    30% {
      transform: translateX(30vw) translateY(${controlY1}vh) rotate(90deg) scale(1);
    }
    70% {
      transform: translateX(70vw) translateY(${controlY2}vh) rotate(270deg) scale(1.1);
    }
    90% {
      opacity: 1;
    }
    100% {
      transform: translateX(110vw) translateY(${endY}vh) rotate(360deg) scale(1.2);
      opacity: 0;
    }
  `;

    return {
        keyframes,
        duration: 8000 + Math.random() * 4000, // 8-12 seconds
    };
}

// Generate particle system for background effects
export function generateParticles(count: number): Array<{
    x: number;
    y: number;
    size: number;
    opacity: number;
    duration: number;
    delay: number;
}> {
    return Array.from({ length: count }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1, // 1-5px
        opacity: Math.random() * 0.6 + 0.2, // 0.2-0.8
        duration: Math.random() * 4 + 2, // 2-6 seconds
        delay: Math.random() * 5, // 0-5 second delay
    }));
}

// Post-it color palette with realistic variations
export const postitColorPalettes = {
    classic: [
        { bg: '#ffff88', shadow: '#e6e640' },
        { bg: '#ffb3ba', shadow: '#e68a94' },
        { bg: '#b3d9ff', shadow: '#87ceeb' },
        { bg: '#b3ffb3', shadow: '#90ee90' },
        { bg: '#ffd4b3', shadow: '#ffb347' },
        { bg: '#d4b3ff', shadow: '#dda0dd' },
    ],
    pastel: [
        { bg: '#fff2cc', shadow: '#f4e79d' },
        { bg: '#ffe6cc', shadow: '#ffcc99' },
        { bg: '#f2ccff', shadow: '#e6b3ff' },
        { bg: '#ccf2ff', shadow: '#99e6ff' },
        { bg: '#ccffcc', shadow: '#99ff99' },
        { bg: '#ffcccc', shadow: '#ff9999' },
    ],
    vibrant: [
        { bg: '#ffeb3b', shadow: '#fbc02d' },
        { bg: '#e91e63', shadow: '#c2185b' },
        { bg: '#2196f3', shadow: '#1976d2' },
        { bg: '#4caf50', shadow: '#388e3c' },
        { bg: '#ff9800', shadow: '#f57c00' },
        { bg: '#9c27b0', shadow: '#7b1fa2' },
    ],
};

// Generate realistic post-it shadows
export function generatePostitShadow(rotation: number, color: string): string {
    const shadowAngle = rotation + 45;
    const shadowX = Math.cos(shadowAngle * Math.PI / 180) * 3;
    const shadowY = Math.sin(shadowAngle * Math.PI / 180) * 3;

    return `${shadowX}px ${shadowY}px 8px rgba(0,0,0,0.2), ${shadowX / 2}px ${shadowY / 2}px 3px ${color}`;
}

// Create physics-based bounce animation
export function createBounceKeyframes(startY: number, bounces = 3): string {
    let keyframes = `0% { transform: translateY(${startY - 50}px) rotate(var(--rotation, 0deg)); }\n`;

    for (let i = 1; i <= bounces; i++) {
        const progress = i / (bounces + 1);
        const bounceHeight = (1 - progress) * 20;
        keyframes += `${progress * 80}% { transform: translateY(${startY - bounceHeight}px) rotate(var(--rotation, 0deg)); }\n`;
    }

    keyframes += `100% { transform: translateY(${startY}px) rotate(var(--rotation, 0deg)); }`;

    return keyframes;
}

// Animation state management
export class AnimationManager {
    private animationQueue: Array<() => void> = [];
    private isAnimating = false;

    enqueue(animation: () => void): void {
        this.animationQueue.push(animation);
        if (!this.isAnimating) {
            this.processQueue();
        }
    }

    private async processQueue(): Promise<void> {
        this.isAnimating = true;

        while (this.animationQueue.length > 0) {
            const animation = this.animationQueue.shift();
            if (animation) {
                animation();
                await new Promise(resolve => setTimeout(resolve, 50)); // Small delay between animations
            }
        }

        this.isAnimating = false;
    }

    clear(): void {
        this.animationQueue = [];
        this.isAnimating = false;
    }
}

export const globalAnimationManager = new AnimationManager();
