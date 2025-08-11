# Message Wall

A modern, real-time digital message board application built with Next.js, React, and Prisma. This project allows users to post messages with images on customizable digital boards with different themes and layouts, featuring real-time updates and admin moderation.

## 🌐 Live Demo

🔗 **[View Live Demo](http://52.1.206.23:3000/)**  
🔧 **[Admin Panel](http://52.1.206.23:3000/admin)** (Demo purposes)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)](https://www.prisma.io/)
[![AWS](https://img.shields.io/badge/AWS-Free_Tier-orange)](https://aws.amazon.com/free/)

## ✨ Features

- **Multiple Board Layouts**: Flying messages, Post-it styles, themed layouts including New Year themes
- **Real-time Updates**: WebSocket-powered live message display
- **Admin Moderation**: Approve/reject messages before they appear on boards
- **File Uploads**: Support for images with messages (JPEG, PNG, GIF, WebP)
- **Responsive Design**: Fully responsive design that works on all devices
- **Customizable Themes**: Multiple board backgrounds, colors, fonts, and background music
- **Board Management**: Create and manage multiple message boards with different themes
- **User-friendly Interface**: Clean, modern UI built with Tailwind CSS and Shadcn/ui

## 🚀 Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: SQLite (development) / PostgreSQL (production) with Prisma ORM
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui components
- **Authentication**: NextAuth.js (for admin panel)
- **Real-time**: WebSockets (Socket.IO)
- **File Handling**: Next.js built-in file upload handling

## 📋 Prerequisites

- Node.js 18.0 or higher
- npm, yarn, or pnpm package manager
- Database (SQLite for development, PostgreSQL recommended for production)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/present42/message-wall.git
cd message-wall
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database Configuration
DATABASE_URL="file:./dev.db"

# NextAuth.js Configuration
NEXTAUTH_SECRET="your-secure-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database with sample data
npx prisma db seed
```

### 5. Start the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🗄️ Database Setup

### Development (SQLite)

The project uses SQLite by default for development. No additional setup required.

### Production (PostgreSQL)

For production, update your `.env` file:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/message_wall"
```

Then run the migrations:

```bash
npx prisma migrate deploy
```

## 👨‍💼 Admin Panel

1. Access the admin panel at `/admin/login`
2. Default credentials are created during database setup
3. Use the admin panel to:
   - Approve/reject pending messages
   - Manage boards and themes
   - Configure board settings
   - Monitor user submissions

## 🎨 Board Types

The application supports multiple board layout types:

- **Flying Messages**: Messages that float and move across the screen
- **Post-it Style**: Static message cards arranged in a grid
- **New Year Theme**: Special themed boards for celebrations

Each board can be customized with:

- Background colors and images
- Font families and colors
- Background music
- Custom post colors
- Background videos

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (admin)/           # Admin panel routes
│   ├── api/               # API endpoints
│   └── board/             # Public board pages
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   ├── admin/            # Admin-specific components
│   └── board/            # Board layout components
├── lib/                  # Utility functions
├── types/                # TypeScript type definitions
└── hooks/                # Custom React hooks

prisma/                   # Database schema and migrations
public/                   # Static assets
├── audios/              # Background music files
├── images/              # Static images
└── videos/              # Background video files
```

## 🚀 Deployment

> **⚠️ Important**: This application uses WebSocket for real-time messaging, which requires a persistent server connection. It **cannot** be deployed on serverless platforms like Vercel or Netlify.

### Recommended Deployment Options

#### 1. VPS/Cloud Server (AWS EC2, DigitalOcean, Linode)

Most flexible option with full control:

- Set up Linux server (Ubuntu/CentOS)
- Install Node.js 18+, PostgreSQL, PM2
- Deploy with reverse proxy (Nginx/Caddy)
- **Cost**: $5-50/month depending on resources

#### 2. Container Platforms (Railway, Render.com)

Managed container deployment:

```bash
# Build the Docker image
docker build -t message-wall .

# Deploy to platform of choice
```

- **Railway**: Great for Node.js apps, built-in PostgreSQL
- **Render.com**: Free tier available, automatic SSL
- **Cost**: $0-25/month

#### 3. Self-Hosted

```bash
# Build the application
npm run build

# Start with PM2 for production
npm install -g pm2
pm2 start ecosystem.config.js
```

### Why Not Vercel/Netlify?

These platforms use serverless functions that:

- Cannot maintain persistent WebSocket connections
- Have execution time limits (10-60 seconds)
- Restart frequently, breaking Socket.IO connections

For detailed deployment guides, see our [deployment documentation](./DEPLOYMENT.md).

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- Create an [issue](https://github.com/present42/message-wall/issues) for bug reports or feature requests
- Check out our [documentation](./docs/) for more detailed guides
- Join our community discussions

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Shadcn/ui](https://ui.shadcn.com/)
- Database ORM by [Prisma](https://www.prisma.io/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

---

**Happy messaging! 💬✨**
