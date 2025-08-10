'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

interface QRCodeProps {
    value: string
    size?: number
    className?: string
}

export function QRCodeComponent({ value, size = 128, className = '' }: QRCodeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const generateQR = async () => {
            try {
                const canvas = canvasRef.current
                if (!canvas) return

                await QRCode.toCanvas(canvas, value, {
                    width: size,
                    margin: 1,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                })
                setError(null)
            } catch (err) {
                console.error('QR Code generation error:', err)
                setError('Failed to generate QR code')
            }
        }

        if (value) {
            generateQR()
        }
    }, [value, size])

    if (error) {
        return (
            <div className={`flex items-center justify-center bg-gray-200 rounded ${className}`} style={{ width: size, height: size }}>
                <span className="text-xs text-gray-500">QR Error</span>
            </div>
        )
    }

    return (
        <canvas
            ref={canvasRef}
            className={`rounded ${className}`}
        />
    )
}
