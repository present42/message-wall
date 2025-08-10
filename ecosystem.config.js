module.exports = {
    apps: [{
        name: 'message-wall',
        script: 'server.js',
        cwd: '/var/www/message-wall',
        env: {
            NODE_ENV: 'production',
            PORT: 3000,
            SOCKET_PORT: 3001
        },
        instances: 1,
        exec_mode: 'cluster',
        watch: false,
        max_memory_restart: '1G',
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_file: './logs/combined.log',
        time: true,
        autorestart: true,
        max_restarts: 10,
        min_uptime: '10s'
    }]
}
