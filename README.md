# SSC Hub Message Wall

A modern, real-time digital message board application built with Next.js, React, and Prisma. This is a revamped version of the original SSC Hub Express application using modern web technologies.

## Features

- **Multiple Board Layouts**: Flying messages, Post-it styles, themed layouts
- **Real-time Updates**: WebSocket-powered live message display
- **Admin Moderation**: Approve/reject messages before they appear
- **File Uploads**: Support for images with messages
- **Responsive Design**: Works on all devices
- **Multiple Themes**: Customizable board backgrounds, colors, and music

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Real-time**: WebSockets (Socket.IO)
- **Authentication**: NextAuth.js (for admin)
- **UI Components**: Shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd message-wall
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

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
