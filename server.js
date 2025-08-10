import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { Server as ServerIO } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)

// Initialize Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    // Create HTTP server
    const server = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url || '', true)
            await handle(req, res, parsedUrl)
        } catch (err) {
            console.error('Error occurred handling', req.url, err)
            res.statusCode = 500
            res.end('internal server error')
        }
    })

    // Initialize Socket.IO
    const io = new ServerIO(server, {
        path: '/api/socketio',
        addTrailingSlash: false,
        cors: {
            origin: dev ? 'http://localhost:3000' : process.env.NEXTAUTH_URL,
            methods: ['GET', 'POST'],
        },
    })

    // Socket.IO event handlers with minimal logging
    let connectionCount = 0
    let lastLogTime = 0

    io.on('connection', (socket) => {
        connectionCount++
        const now = Date.now()

        // Log every 5 seconds or every 20 connections, whichever comes first
        if (now - lastLogTime > 5000 || connectionCount % 20 === 1) {
            console.log(`🔌 WebSocket status: ${connectionCount} active connections`)
            lastLogTime = now
        }

        // Join admin room for real-time admin updates
        socket.on('join-admin', () => {
            socket.join('admin')
            console.log('👑 Admin connected to real-time updates')
        })

        // Join specific board room for real-time board updates
        socket.on('join-board', (boardId) => {
            socket.join(`board-${boardId}`)
            console.log(`📋 Client watching board-${boardId}`)
        })

        // Leave board room
        socket.on('leave-board', (boardId) => {
            socket.leave(`board-${boardId}`)
        })

        // Handle disconnect with minimal logging
        socket.on('disconnect', (reason) => {
            connectionCount--
            if (reason !== 'transport close' && reason !== 'transport error') {
                const now = Date.now()
                if (now - lastLogTime > 5000 || connectionCount % 20 === 0) {
                    console.log(`❌ WebSocket status: ${connectionCount} active connections (${reason})`)
                    lastLogTime = now
                }
            }
        })
    })    // Make Socket.IO instance available globally
    global.io = io

    // Start server
    server.listen(port, () => {
        console.log(`🚀 Server ready on http://${hostname}:${port}`)
        console.log(`📡 Socket.IO server ready`)
    })
})
