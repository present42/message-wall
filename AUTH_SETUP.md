# Admin Authentication Setup

## Overview

The admin panel is now protected with NextAuth.js authentication. Only authenticated users with admin role can access `/admin/*` routes.

## Default Credentials

- **Username:** `admin`
- **Password:** `admin123`

## How It Works

### 1. Authentication Flow

1. User visits `/admin/*` (except `/admin/login`)
2. Middleware checks if user is authenticated
3. If not authenticated, redirects to `/admin/login`
4. User enters credentials on login page
5. NextAuth validates credentials against user store
6. On success, creates JWT session and redirects to admin dashboard
7. All subsequent requests include session token

### 2. Protected Routes

- `/admin` - Admin dashboard
- `/admin/posts` - Posts management
- `/admin/boards` - Board management
- All other `/admin/*` routes

### 3. Security Features

- **Password hashing** with bcrypt (12 rounds)
- **JWT sessions** for stateless authentication
- **Middleware protection** for all admin routes
- **Session management** with automatic logout
- **CSRF protection** built into NextAuth

## Configuration Files

### `/src/lib/auth.ts`

NextAuth configuration with:

- Credentials provider
- User validation logic
- Session/JWT callbacks
- Security settings

### `/src/app/api/auth/[...nextauth]/route.ts`

NextAuth API route handler

### `/middleware.ts`

Route protection middleware that:

- Checks authentication for `/admin/*` routes
- Allows public access to login page
- Redirects unauthenticated users

### Environment Variables (`.env.local`)

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here
```

## Adding New Admin Users

To add new admin users, modify the `ADMIN_USERS` array in `/src/lib/auth.ts`:

1. Generate password hash:

```bash
node generate-hash.js
```

2. Add user to array:

```javascript
const ADMIN_USERS = [
  {
    id: "1",
    username: "admin",
    email: "admin@sschub.com",
    password: "$2a$12$...", // hashed password
  },
  {
    id: "2",
    username: "newuser",
    email: "newuser@sschub.com",
    password: "$2a$12$...", // new hashed password
  },
];
```

## Production Deployment

### Environment Variables

Set these in your production environment:

```
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secret-production-key
```

Generate a secure secret:

```bash
openssl rand -base64 32
```

### Database Integration

For production, consider moving from in-memory user store to database:

1. Add user table to Prisma schema
2. Update auth configuration to query database
3. Implement user management interface

## Troubleshooting

### "Invalid credentials" error

- Check username/password match exactly
- Verify password hash is correct
- Check browser console for detailed errors

### Redirect loops

- Ensure `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again
- Check middleware configuration

### Session not persisting

- Verify `NEXTAUTH_SECRET` is set
- Check browser allows cookies
- Ensure SessionProvider wraps app

## Security Considerations

- Change default password immediately
- Use strong, unique passwords
- Set secure `NEXTAUTH_SECRET` in production
- Consider implementing rate limiting
- Monitor authentication logs
- Use HTTPS in production
