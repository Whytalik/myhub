# Research Note: Google OAuth Migration & Landing Page Removal

## Background
The user wants to remove the marketing/landing page of the main page and simplify authentication to use Google OAuth exclusively.

## Objectives
1. Eliminate the landing page by redirecting `/` to `/home` (if authenticated) or `/login` (if not authenticated).
2. Remove credentials (email/password) registration and login.
3. Integrate Google OAuth provider in NextAuth.
4. Redesign the login page to offer only Google Sign-In.

## Architecture & Implementation Decisions

### 1. Root Redirection (Landing Page Bypass)
Rather than serving the landing page from `src/app/page.tsx`, we will update the `src/proxy.ts` middleware to intercept `/` and redirect immediately based on authentication status:
- Authenticated -> `/home`
- Unauthenticated -> `/login`

This keeps response times fast and avoids loading page components.

### 2. NextAuth Configuration (`src/auth.ts`)
- Replace the `Credentials` provider with `Google` provider (`next-auth/providers/google`).
- Enable `allowDangerousEmailAccountLinking: true` so that existing users can log in via Google with the same email without creating duplicate accounts or throwing errors.

### 3. Login Page Redesign
- Remove the `email` and `password` forms from `src/app/(auth)/login/page.tsx`.
- Create a server action `loginWithGoogleAction` that calls `signIn("google", { redirectTo: "/home" })`.
- Add a "Sign in with Google" button styled according to the project's **Void Terminal** aesthetic: card layout, monochrome colors, glassmorphism elements, and smooth transitions.

### 4. Registration Decommission
- Remove `/register` routes and page files.
- Redirect `/register` to `/login` in middleware to avoid dead links.
