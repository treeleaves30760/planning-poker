# Story Point Party 🎯

A collaborative task difficulty estimation tool for agile teams. Story Point Party enables distributed teams to conduct story point estimation sessions where members vote on task uncertainty, complexity, and effort levels in real-time.

## Features

- **Multi-dimensional Scoring**: Rate tasks on uncertainty, complexity, and effort
- **Real-time Collaboration**: Multiple users can join and vote simultaneously
- **Admin Controls**: Manage estimation sessions with reveal/change controls
- **Cross-device Support**: Works across devices on the same network
- **Customizable Scoring**: Configure your own scoring values or use defaults
- **Anonymous Voting**: Votes are hidden until admin reveals results

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Start the development server:**
```bash
npm run dev
```

3. **Open your browser:**
Visit [http://localhost:3000](http://localhost:3000)

## How to Use

### For Admins (Session Leaders)

1. **Setup Game**: Go to `/admin` to configure scoring and create a new game
2. **Share Join Link**: Copy the join URL from the admin panel and share with team
3. **Add Tasks**: Enter task descriptions for estimation
4. **Manage Voting**: Reveal votes, allow changes, and move to next tasks

### For Team Members

1. **Join Game**: Use the shared link to join with your username
2. **Vote on Tasks**: Rate each task on uncertainty, complexity, and effort
3. **See Results**: View everyone's votes when admin reveals them
4. **Participate**: Join/leave sessions anytime during the meeting

### Network Access

To allow team members on different devices to join:
1. Find your computer's IP address (usually `192.168.x.x`)
2. Share: `http://[YOUR-IP]:3000/game/[gameId]/join`
3. Team members can join from phones, tablets, or other computers

## Technical Details

Built with modern web technologies:
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **React 19** for UI components
- **Tailwind CSS 4** for styling
- **File-based API** for game state management

## Development Commands

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Create production build
npm run start        # Run production server
npm run lint         # Run ESLint for code quality

# Installation
npm install          # Install dependencies
```

## Project Structure

```
src/
├── app/
│   ├── admin/                    # Admin setup page
│   ├── game/[gameId]/
│   │   ├── admin/               # Admin control panel
│   │   ├── join/                # User join page
│   │   └── play/                # User voting interface
│   └── api/games/               # Game state API endpoints
├── hooks/
│   └── useGameState.ts          # Game state management hook
├── types/
│   └── game.ts                  # TypeScript interfaces
└── data/
    └── defaultScores.json       # Default scoring configuration
```

## Contributing

This project uses standard Next.js patterns and TypeScript. See `CLAUDE.md` for detailed development guidance.

## License

MIT License - feel free to use this for your team's estimation sessions!
