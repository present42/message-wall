# Copilot Instructions for SSC Hub Message Wall

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview

This is a modern Next.js application for SSC Hub Message Wall - a digital message board system that allows users to submit messages for public display with admin moderation.

## Architecture & Technologies

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: Prisma ORM with PostgreSQL
- **Styling**: Tailwind CSS
- **Real-time**: WebSockets (Socket.IO)
- **Authentication**: NextAuth.js
- **File Upload**: Next.js built-in file handling
- **UI Components**: Shadcn/ui components

## Key Features to Implement

1. **Multiple Board Layouts**: Flying messages, Post-it styles, themed layouts
2. **Message Submission**: Form with text, images, nickname, email
3. **Admin Moderation**: Approve/reject/manage posts
4. **Real-time Updates**: WebSocket connection for live message display
5. **Board Management**: Create/edit boards with custom themes
6. **Responsive Design**: Mobile-first approach

## Code Style Guidelines

- Use functional components with hooks
- Implement TypeScript strictly
- Follow Next.js App Router patterns
- Use Tailwind for styling
- Implement proper error handling
- Use Prisma for all database operations
- Follow atomic design principles for components

## Directory Structure

- `/src/app` - Next.js App Router pages
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and configurations
- `/src/types` - TypeScript type definitions
- `/src/hooks` - Custom React hooks
- `/src/stores` - State management (Zustand)
- `/prisma` - Database schema and migrations

## Development Practices

- Create reusable components for board layouts
- Implement proper loading states and error boundaries
- Use server and client components appropriately
- Implement proper SEO and accessibility
- Add comprehensive TypeScript types
- Follow security best practices for file uploads
