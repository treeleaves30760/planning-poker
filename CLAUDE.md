# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Story Point Party is a collaborative task difficulty estimation tool built with Next.js 15, TypeScript, React 19, and Tailwind CSS 4. It enables agile teams to conduct story point estimation sessions where team members vote on task uncertainty, complexity, and effort levels. The application supports real-time multi-user sessions with admin controls for managing the estimation process.

## Common Development Commands

```bash
# Development
npm run dev          # Start development server with Turbopack at http://localhost:3000
npm run build        # Create production build
npm run start        # Run production server
npm run lint         # Run ESLint for code quality checks

# Installation
npm install          # Install dependencies
```

## Architecture and Code Structure

**App Router Pattern**: Uses Next.js App Router with the `src/app/` directory structure

**Application Structure**:
- `src/app/page.tsx` - Landing page with navigation to admin setup
- `src/app/admin/page.tsx` - Admin scoring configuration and game creation
- `src/app/game/[gameId]/admin/page.tsx` - Admin game control panel
- `src/app/game/[gameId]/join/page.tsx` - User join/lobby page
- `src/app/game/[gameId]/play/page.tsx` - User voting interface
- `src/app/api/games/` - REST API endpoints for game state management
- `src/types/game.ts` - TypeScript interfaces for game data structures
- `src/hooks/useGameState.ts` - Custom hook for game state management
- `src/data/defaultScores.json` - Default scoring configuration

**Key Technologies**:
- Next.js 15 with App Router and Server Components
- TypeScript with strict configuration and path aliases (`@/*` → `./src/*`)
- Tailwind CSS 4.x for responsive UI components
- File-based API storage system for multi-user game state
- Real-time polling for live game synchronization

**Game Features**:
- Admin scoring configuration (uncertainty, complexity, effort dimensions)
- Real-time multi-user voting sessions
- Vote reveal and change management
- Cross-device/network game access
- Automatic user connection handling

## Configuration Files

- `next.config.ts` - Next.js configuration (minimal, ready for customization)
- `tsconfig.json` - TypeScript configuration with strict mode and path mapping
- `eslint.config.mjs` - ESLint with Next.js and TypeScript rules
- `postcss.config.mjs` - PostCSS configuration for Tailwind processing

## Development Notes

- Turbopack is enabled for faster development builds
- No testing framework is currently configured
- Project uses React 19 and modern Next.js patterns
- Game state is persisted using file-based storage in `data/games/` directory
- Real-time synchronization uses polling (2-second intervals)
- Games are accessible across devices on the same network (use IP address)

## Usage Workflow

1. **Admin Setup**: Visit `/admin` to configure scoring (uncertainty, complexity, effort) and create a game
2. **Game Management**: Admin uses `/game/[gameId]/admin` to add tasks, reveal votes, and control session flow
3. **User Participation**: Users join via `/game/[gameId]/join` with username, then vote on `/game/[gameId]/play`
4. **Voting Process**: Users rate tasks on three dimensions, admin reveals results and can allow vote changes
5. **Network Access**: Share `http://[LOCAL-IP]:3000/game/[gameId]/join` for cross-device participation

## Game State Management

- Game data stored as JSON files in `data/games/[gameId].json`
- API endpoints: `GET/PUT /api/games/[gameId]` and `POST /api/games`
- Real-time sync via `useGameState` hook with automatic polling
- User session management through localStorage for user IDs
- Automatic cleanup when users leave (browser close detection)
