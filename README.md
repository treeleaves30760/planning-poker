# Planning Poker Game 🎯

A collaborative task difficulty estimation tool for agile teams. Planning Poker Game enables distributed teams to conduct story point estimation sessions where members vote on task uncertainty, complexity, and effort levels in real-time.

## Features

- **Fibonacci Scoring System**: Advanced combination-based scoring using Fibonacci sequence (1, 2, 3, 5, 8, 13, 21)
- **Multi-dimensional Scoring**: Rate tasks on uncertainty, complexity, and effort with 27 possible combinations
- **Real-time Score Display**: See your current selection score update instantly as you vote
- **Real-time Collaboration**: Multiple users can join and vote simultaneously
- **Admin Controls**: Manage estimation sessions with reveal/change controls
- **Cross-device Support**: Works across devices on the same network
- **Dual Scoring Systems**: Choose between Fibonacci (recommended) or Legacy additive scoring
- **Task History**: Complete tracking of all completed tasks with statistics
- **Anonymous Voting**: Votes are hidden until admin reveals results

## Quick Start

### Option 1: Docker (Recommended)

1. **Pull and run the Docker image:**

```bash
docker run -p 3000:3000 ghcr.io/treeleaves30760/planning-poker:main
```

2. **Open your browser:**
Visit [http://localhost:3000](http://localhost:3000)

### Option 2: Local Development

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

1. **Choose Scoring System**:
   - **Fibonacci Scoring** (Recommended): `/admin-fibonacci` - Advanced combination-based scoring
   - **Legacy Scoring**: `/admin` - Simple additive scoring
2. **Configure Scoring**: Set up your preferred scoring values (27 combinations for Fibonacci)
3. **Create Game**: Enter game name and generate game session
4. **Share Join Link**: Copy the join URL from the admin panel and share with team
5. **Add Tasks**: Enter task descriptions for estimation
6. **Manage Voting**: Reveal votes, allow changes, and move to next tasks
7. **View History**: Track all completed tasks with statistics and averages

### For Team Members

1. **Join Game**: Use the shared link to join with your username
2. **Vote on Tasks**: Rate each task on uncertainty, complexity, and effort
3. **Real-time Feedback**: See your current selection score update instantly
4. **See Results**: View everyone's votes when admin reveals them
5. **Task History**: Review all previous tasks and their outcomes
6. **Participate**: Join/leave sessions anytime during the meeting

### Network Access

To allow team members on different devices to join:

1. Find your computer's IP address (usually `192.168.x.x`)
2. Share: `http://[YOUR-IP]:3000/game/[gameId]/join`
3. Team members can join from phones, tablets, or other computers

## Scoring Systems

### Fibonacci Scoring (Recommended)

- **27 Combinations**: Every combination of uncertainty × complexity × effort has a pre-configured Fibonacci score
- **Fibonacci Values**: Uses 1, 2, 3, 5, 8, 13, 21 for intuitive story point estimation
- **Real-time Preview**: See your score instantly as you make selections
- **Customizable**: Admin can modify any of the 27 combination scores
- **Example**: Low uncertainty + High complexity + Mid effort = 8 points

### Legacy Scoring

- **Additive System**: Final score = uncertainty + complexity + effort scores
- **Simple Configuration**: Set individual dimension scores (low/mid/high)
- **Backward Compatible**: Supports existing games and familiar workflows
- **Example**: Uncertainty(2) + Complexity(3) + Effort(1) = 6 points

## Technical Details

Built with modern web technologies:

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **React 19** for UI components
- **Tailwind CSS 4** for styling
- **File-based API** for game state management

## Docker Usage

### Building Locally

```bash
# Build the Docker image
docker build -t story-point-party .

# Run the container
docker run -p 3000:3000 story-point-party
```

### Using Pre-built Image

```bash
# Pull and run from GitHub Container Registry
docker run -p 3000:3000 ghcr.io/[username]/story-point-party:latest

# Or run with custom port
docker run -p 8080:3000 ghcr.io/[username]/story-point-party:latest
```

### Docker Compose (Optional)

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  story-point-party:
    image: ghcr.io/[username]/story-point-party:latest
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data  # Persist game data
```

Then run: `docker-compose up`

## Development Commands

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Create production build
npm run start        # Run production server
npm run lint         # Run ESLint for code quality

# Installation
npm install          # Install dependencies

# Docker
docker build -t story-point-party .  # Build Docker image
docker run -p 3000:3000 story-point-party  # Run container
```

## Project Structure

```
src/
├── app/
│   ├── admin/                    # Legacy admin setup page
│   ├── admin-fibonacci/          # Fibonacci scoring admin setup
│   ├── game/[gameId]/
│   │   ├── admin/               # Admin control panel
│   │   ├── join/                # User join page
│   │   └── play/                # User voting interface
│   └── api/games/               # Game state API endpoints
├── hooks/
│   └── useGameState.ts          # Game state management hook
├── types/
│   └── game.ts                  # TypeScript interfaces
├── utils/
│   └── scoreCalculation.ts      # Scoring system utilities
└── data/
    ├── defaultScores.json       # Legacy scoring configuration
    └── defaultFibonacciScores.json # Fibonacci scoring configuration
```

## Contributing

This project uses standard Next.js patterns and TypeScript. See `CLAUDE.md` for detailed development guidance.

## License

MIT License - feel free to use this for your team's estimation sessions!
