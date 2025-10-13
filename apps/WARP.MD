# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Infinitas is a CRM platform designed to streamline business relationships and unlock Google Business Profile potential. The project consists of a marketing website and a CRM application built with modern web technologies.

## Architecture

This is a **Turbo monorepo** with the following structure:

- **apps/web** - Marketing website (Next.js 15 with React 19)
- **apps/crm** - CRM application (Next.js 15 with extensive UI component library)
- **packages/** - Shared packages (referenced but not yet implemented)
  - `@infinitas/database` - Database layer (Supabase integration)
  - `@infinitas/shared` - Shared utilities and types

### Technology Stack

**CRM Application:**
- Next.js 15 with App Router
- React 18.3.1 with TypeScript 5
- Radix UI component primitives
- Tailwind CSS with shadcn/ui components
- Supabase for database and authentication
- Vercel Analytics & Speed Insights
- Sentry for error monitoring

**Web Application:**
- Next.js 15 with React 19
- TypeScript with optimized Inter font loading
- Tailwind CSS

## Development Commands

### Core Development
```bash
# Start all apps in development mode
npm run dev

# Build all applications
npm run build

# Run type checking across all apps
npm run type-check

# Lint all applications
npm run lint

# Format code with Prettier
npm run format

# Clean all build artifacts
npm run clean
```

### Database Operations
```bash
# Generate database types/schemas
npm run db:generate

# Push database schema changes
npm run db:push

# Run database migrations
npm run db:migrate
```

### Individual App Commands

**CRM Application (`apps/crm`):**
```bash
cd apps/crm
npm run dev          # Start CRM in development
npm run build        # Build CRM for production
npm run type-check   # TypeScript type checking
```

**Web Application (`apps/web`):**
```bash
cd apps/web
npm run dev              # Start web app in development
npm run build:analyze    # Build with bundle analysis
npm run type-check       # TypeScript type checking
```

## Environment Configuration

The applications require the following environment variables (see `turbo.json` for complete list):

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `SUPABASE_PROJECT_ID` - Supabase project ID
- `NEXTAUTH_URL` - NextAuth.js callback URL
- `NEXTAUTH_SECRET` - NextAuth.js secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `GOOGLE_REDIRECT_URI` - Google OAuth redirect URI

## Key Implementation Details

### Path Aliases
TypeScript is configured with the following path mappings:
- `@/*` → `./apps/web/src/*`
- `@infinitas/database` → `./packages/database/src`
- `@infinitas/shared` → `./packages/shared/src`

### CRM Application Structure
- **App Router** structure with layout and page components
- **Sidebar-based navigation** using Radix UI Sidebar primitives
- **Component-driven architecture** with shadcn/ui components
- **Client-side state management** (components marked with "use client")
- **Form handling** with React Hook Form and Zod validation

### Build Configuration
- **Turbo** for monorepo task orchestration and caching
- **Standalone output** configured for containerized deployments
- **Image optimization** with Next.js Image component (remote patterns allowed)
- **Bundle analysis** available for the web app

### Performance Optimizations
- Font optimization with `next/font/google`
- Package import optimization for lucide-react icons
- Vercel Analytics and Speed Insights integration
- Proper font loading strategies with fallbacks

## Testing

Currently no test framework is configured. Consider adding Jest or Vitest for unit testing and Playwright or Cypress for end-to-end testing.




Evidence
•  I fetched your built CSS and confirmed the rule was missing var():
◦  Before: .w-[--sidebar-width]{width:--sidebar-width} (invalid)
•  I’ve rebuilt and verified the DOM now uses the corrected classes:
◦  wrapper: w-[var(--sidebar-width)]
◦  spacer: w-[var(--sidebar-width)]
◦  collapsed state: group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]
•  Live CSS is served (URL below) and DOM shows those corrected classes.

What I changed
•  apps/crm/components/ui/sidebar.tsx:
◦  Replaced all occurrences:
▪  w-[--sidebar-width] → w-[var(--sidebar-width)]
▪  w-[--sidebar-width-icon] → w-[var(--sidebar-width-icon)]
◦  This includes:
▪  “none” variant container
▪  mobile SheetContent width
▪  desktop wrapper width
▪  spacer width
▪  fixed panel width
•  Also fixed one related utility:
◦  Sidebar menu skeleton: max-w-[--skeleton-width] → max-w-[var(--skeleton-width)]

Why this is the correct fix
•  It aligns with Tailwind v4’s requirement to wrap CSS variables in var() when using arbitrary values.
•  It preserves the original shadcn/ui layout pattern (fixed sidebar + spacer), without adding non-standard padding hacks to SidebarInset.
