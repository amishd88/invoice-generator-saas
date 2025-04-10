# Authentication Implementation Guide

This guide explains the user authentication system implemented in the Invoice Generator application using Supabase authentication.

## Overview

The authentication system provides:
- User signup with email and password
- User login with email and password
- Password reset functionality
- Protected routes for authenticated users only
- User profile management
- Row-level security for database access

## Integration with Supabase

### Database Schema Updates

The database schema has been updated to include:
- `user_id` fields in all tables to associate records with specific users
- Row-level security policies to ensure users can only access their own data

To apply these changes:
1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the SQL script from `supabase-schema-updated.sql`

### Authentication Components

#### 1. Authentication Service

The authentication functionality is implemented in:
- `src/services/auth/authService.ts` - Core authentication API functions
- `src/services/auth/AuthContext.tsx` - React context for authentication state
- `src/services/auth/types.ts` - TypeScript types for authentication

#### 2. Authentication UI

The authentication UI consists of:
- `src/components/auth/AuthPage.tsx` - Main authentication page
- `src/components/auth/SignInForm.tsx` - Login form
- `src/components/auth/SignUpForm.tsx` - Registration form
- `src/components/auth/UserProfile.tsx` - User profile dropdown
- `src/components/auth/ProtectedRoute.tsx` - Route protection component

## Usage

### 1. Protected Routes

Wrap any component that requires authentication with the `ProtectedRoute` component:

```tsx
import { ProtectedRoute } from './services/auth';

const App = () => {
  return (
    <ProtectedRoute>
      <YourProtectedComponent />
    </ProtectedRoute>
  );
};
```

### 2. Accessing Auth State

Use the `useAuth` hook to access authentication state and functions:

```tsx
import { useAuth } from './services/auth';

const YourComponent = () => {
  const { user, signOut, error } = useAuth();
  
  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {user.email}</p>
          <button onClick={signOut}>Sign Out</button>
        </>
      ) : (
        <p>Please sign in</p>
      )}
    </div>
  );
};
```

### 3. Customizing Auth UI

The authentication UI is styled with Tailwind CSS and can be customized by modifying the respective components.

## Security Considerations

### 1. Row-Level Security

The database uses Row-Level Security (RLS) to ensure users can only access their own data. The policies are defined in the SQL schema.

### 2. User Identification

All database queries automatically filter data based on the authenticated user's ID, which is handled transparently by Supabase.

### 3. Password Requirements

Passwords must:
- Be at least 6 characters long
- Match when confirming during registration

## Error Handling

The authentication system provides clear error messages for various scenarios:
- Invalid credentials
- Registration errors
- Password reset errors
- Network issues

These errors are displayed in user-friendly notifications using the `ErrorMessage` component.

## What's Next

Consider implementing:
1. Social authentication (Google, GitHub, etc.)
2. Multi-factor authentication
3. Team/organization features for sharing invoices
4. Role-based permissions
