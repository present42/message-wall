import { Server as NetServer } from 'http'
import { NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'
import { WebSocketMessage } from '@/types'

export type NextApiResponseServerIO = NextApiResponse & {
    socket: {
        server: NetServer & {
            io: ServerIO
        }
    }
}

export const initSocket = (server: NetServer): ServerIO => {
    const io = new ServerIO(server, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
            origin: process.env.NODE_ENV === 'production'
                ? ['https://your-domain.com'] // Replace with your actual domain
                : ['http://localhost:3000'],
            methods: ['GET', 'POST']
        }
    })

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id)

        // Join specific rooms for different functionalities
        socket.on('join-admin', () => {
            socket.join('admin')
            console.log('Client joined admin room:', socket.id)
        })

        socket.on('join-board', (boardId: string) => {
            socket.join(`board-${boardId}`)
            console.log(`Client joined board-${boardId}:`, socket.id)
        })

        socket.on('leave-board', (boardId: string) => {
            socket.leave(`board-${boardId}`)
            console.log(`Client left board-${boardId}:`, socket.id)
        })

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id)
        })
    })

    return io
}

// Utility functions for emitting events
export const emitToAdmin = (io: ServerIO, message: WebSocketMessage) => {
    io.to('admin').emit('message', message)
}

export const emitToBoard = (io: ServerIO, boardId: string, message: WebSocketMessage) => {
    io.to(`board-${boardId}`).emit('message', message)
}

export const emitToAll = (io: ServerIO, message: WebSocketMessage) => {
    io.emit('message', message)
}
