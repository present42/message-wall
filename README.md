# SSC Hub Message Wall

A modern, real-time digital message board application built with Next.js, React, and Prisma. This project allows users to post messages with images on customizable digital boards with different themes and layouts, featuring real-time updates and admin moderation.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)](https://www.prisma.io/)

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
git clone https://github.com/your-username/message-wall.git
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

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Docker

```bash
# Build the Docker image
docker build -t message-wall .

# Run the container
docker run -p 3000:3000 message-wall
```

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   ```

For detailed deployment guides, see our [deployment documentation](./docs/DEPLOYMENT.md).

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

- Create an [issue](https://github.com/your-username/message-wall/issues) for bug reports or feature requests
- Check out our [documentation](./docs/) for more detailed guides
- Join our community discussions

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Shadcn/ui](https://ui.shadcn.com/)
- Database ORM by [Prisma](https://www.prisma.io/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

---

**Happy messaging! 💬✨**

Edit `.env` and configure your database URL and other settings.

4. Set up the database:

```bash
npx prisma migrate dev
npx prisma generate
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the message board.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── admin/          # Admin dashboard
│   ├── api/            # API routes
│   └── submit/         # Message submission form
├── components/         # React components
│   ├── ui/            # Base UI components
│   ├── boards/        # Board layout components
│   └── admin/         # Admin-specific components
├── lib/               # Utility functions
├── types/             # TypeScript definitions
└── hooks/             # Custom React hooks
```

## Usage

### For Users

1. Visit the main page to view the current message board
2. Click "Submit a Message" to add your message
3. Messages require admin approval before appearing

### For Administrators

1. Visit `/admin` for the admin dashboard
2. Moderate pending messages in the Posts section
3. Create and manage boards in the Boards section
4. Set which board is currently displayed

## Board Types

- **Flying Messages (0)**: Animated floating message cards
- **Post-it (1)**: Grid layout with post-it note styling
- **Post-it with Pins (2)**: Post-it notes with pin decorations
- **Post-it with Tape (3)**: Post-it notes with tape decorations
- **New Year Theme (4)**: Special themed layout

## API Endpoints

- `GET /` - Display current active board
- `GET /submit` - Message submission form
- `POST /api/posts` - Create new message
- `GET /api/posts` - Get messages (with filters)
- `GET /admin` - Admin dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
