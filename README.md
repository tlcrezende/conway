# Nearsure Take Home Assessment - Conway's Game of Life

A production-ready, fullstack implementation of Conway's Game of Life built with Next.js 14+, TypeScript, Prisma, and SQLite.

## Features

- **Fullstack Architecture**: Server-side API routes with client-side React components
- **Persistent Storage**: SQLite database with Prisma ORM
- **Type Safety**: Strict TypeScript throughout
- **Validation**: Zod schemas for API input validation
- **Optimized Performance**: Memoized React components for large boards
- **Modern UI**: Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS 4
- **Database**: SQLite
- **ORM**: Prisma 7.2.0
- **Validation**: Zod 4.3.5
- **Data Fetching**: SWR 2.3.8
- **Testing**: Jest 30.2.0, React Testing Library, ts-jest

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   The `.env` file should contain:
   ```
   DATABASE_URL="file:./dev.db"
   ```

4. **Set up the database**:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
   
   This will:
   - Generate the Prisma Client
   - Create the SQLite database file (`dev.db`)
   - Run the initial migration

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
conway/
├── app/
│   ├── api/
│   │   └── boards/
│   │       ├── upload/route.ts          # POST - Upload a new board
│   │       ├── next-state/route.ts      # POST - Get next generation
│   │       ├── future-state/route.ts    # POST - Get future N generations
│   │       ├── final-state/route.ts     # POST - Find stable state
│   │       └── [id]/route.ts            # GET - Get board by ID
│   ├── layout.tsx                        # Root layout
│   └── page.tsx                          # Main page
├── components/
│   ├── Board.tsx                         # Board display component
│   ├── BoardEditor.tsx                   # Interactive board editor
│   ├── Cell.tsx                          # Individual cell component
│   └── Controls.tsx                      # Control buttons
├── lib/
│   ├── config.ts                         # Centralized configuration constants
│   ├── gameLogic.ts                      # Pure Conway's Game of Life logic
│   ├── prisma.ts                         # Prisma client singleton
│   └── validations.ts                    # Zod validation schemas
├── prisma/
│   └── schema.prisma                     # Database schema
└── public/                               # Static assets
```

## API Endpoints

### POST `/api/boards/upload`

Upload a new board to the database.

**Request Body**:
```json
{
  "board": [[0, 1, 0], [1, 1, 1], [0, 1, 0]]
}
```

**Response** (201):
```json
{
  "id": "clx...",
  "state": [[0, 1, 0], [1, 1, 1], [0, 1, 0]],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### POST `/api/boards/next-state`

Calculate and return the next generation of a board.

**Request Body**:
```json
{
  "id": "clx..."
}
```

**Response** (200):
```json
{
  "id": "clx...",
  "state": [[1, 1, 1], [1, 0, 1], [1, 1, 1]],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### POST `/api/boards/future-state`

Advance the board by N generations.

**Request Body**:
```json
{
  "id": "clx...",
  "generations": 10
}
```

**Response** (200):
```json
{
  "id": "clx...",
  "state": [[...]],
  "generations": 10,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### POST `/api/boards/final-state`

Find the final stable state of the board (or empty state).

**Request Body**:
```json
{
  "id": "clx..."
}
```

**Response** (200):
```json
{
  "id": "clx...",
  "state": [[...]],
  "generations": 42,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Response** (422):
```json
{
  "error": "Board did not converge",
  "message": "The board did not stabilize within [MAX_ITERATIONS] iterations"
}
```

Note: `[MAX_ITERATIONS]` is configurable via `lib/config.ts` (default: 1000).

### GET `/api/boards/[id]`

Get a board by its ID.

**Response** (200):
```json
{
  "id": "clx...",
  "state": [[...]],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Game Rules

Conway's Game of Life follows these rules:

1. **Underpopulation**: Any live cell with fewer than two live neighbors dies
2. **Survival**: Any live cell with two or three live neighbors survives
3. **Overpopulation**: Any live cell with more than three live neighbors dies
4. **Reproduction**: Any dead cell with exactly three live neighbors becomes alive

## Configuration

All magic numbers and constants used throughout the application are centralized in `lib/config.ts`. This makes it easy to adjust limits, defaults, and game rules without searching through multiple files.

### Configuration File: `lib/config.ts`

The configuration object includes:

- **Board size limits**: `MAX_BOARD_SIZE` (default: 1000) - Maximum board dimensions
- **Iteration and generation limits**: 
  - `MAX_ITERATIONS` (default: 1000) - Maximum iterations for final state calculation
  - `MAX_GENERATIONS` (default: 1000) - Maximum generations allowed in future state requests
- **Display settings**:
  - `MAX_DISPLAY_SIZE` (default: 50) - Maximum board size displayed (larger boards are cropped)
  - `DEFAULT_CELL_SIZE` (default: 12) - Default pixel size for cells
- **Default values**:
  - `DEFAULT_GENERATIONS` (default: 10) - Default number of generations in the UI input
  - `DEFAULT_BOARD_ROWS` (default: 30) - Default rows for the board editor
  - `DEFAULT_BOARD_COLS` (default: 30) - Default columns for the board editor
- **Game rules** (Conway's Game of Life):
  - `MIN_NEIGHBORS_TO_SURVIVE` (default: 2) - Minimum neighbors for a live cell to survive
  - `MAX_NEIGHBORS_TO_SURVIVE` (default: 3) - Maximum neighbors for a live cell to survive
  - `NEIGHBORS_TO_REPRODUCE` (default: 3) - Exact number of neighbors for a dead cell to become alive

To modify any of these values, simply edit `lib/config.ts`. All parts of the application that use these constants will automatically use the updated values.

## Database Schema

```prisma
model Board {
  id        String   @id @default(cuid())
  state     String   // JSON string representing the board matrix
  createdAt DateTime @default(now())

  @@index([createdAt])
}
```

## Development

### Running Prisma Studio

To view and edit the database visually:

```bash
npx prisma studio
```

### Building for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Testing

The project includes comprehensive test coverage for both the game logic and API endpoints using Jest and React Testing Library.

### Running Tests

**Run all tests**:
```bash
npm test
```

**Run tests in watch mode** (useful during development):
```bash
npm run test:watch
```

**Run tests with coverage report**:
```bash
npm run test:coverage
```

After running coverage, you can view a detailed HTML report by opening `coverage/lcov-report/index.html` in your browser.

### Test Structure

The test suite is organized in the `__tests__` directory:

```
__tests__/
├── api/
│   └── boards/
│       ├── [id].test.ts          # GET /api/boards/[id] endpoint tests
│       ├── final-state.test.ts   # POST /api/boards/final-state endpoint tests
│       ├── future-state.test.ts  # POST /api/boards/future-state endpoint tests
│       ├── next-state.test.ts    # POST /api/boards/next-state endpoint tests
│       ├── route.test.ts         # GET /api/boards endpoint tests
│       └── upload.test.ts        # POST /api/boards/upload endpoint tests
└── lib/
    ├── gameLogic.test.ts         # Core game logic tests (rules, generations, etc.)
    └── validations.test.ts       # Zod validation schema tests
```

### Test Coverage

The test suite covers:

- **Game Logic** (`lib/gameLogic.test.ts`):
  - Next generation calculation
  - Game rules (underpopulation, survival, overpopulation, reproduction)
  - Future state calculation (N generations)
  - Final state detection (stable states and empty boards)
  - Edge cases (empty boards, single cells, patterns)

- **Validations** (`lib/validations.test.ts`):
  - Board format validation
  - Size constraints
  - Data type validation
  - Error messages

- **API Endpoints** (`__tests__/api/boards/`):
  - Request/response validation
  - Error handling
  - Database operations
  - Edge cases and boundary conditions


## Performance Considerations

- Boards larger than the configured `MAX_DISPLAY_SIZE` (default: 50x50) are automatically cropped in the display (but full state is preserved)
- React components are memoized to prevent unnecessary re-renders
- The final state calculation has a maximum iteration limit (configured via `MAX_ITERATIONS`, default: 1000) to prevent infinite loops
- Board size is limited by `MAX_BOARD_SIZE` (default: 1000x1000) in validation

## Future Improvements

This section outlines potential enhancements that could add value to the project across different areas:

### User Experience (UX) Improvements

- **Board Management**:
  - Implement undo/redo functionality for board editing
  - Save favorite boards locally
  - Add statistics panel (live cell count, generation, population trends)
  - Implement toast notifications for user actions
  - Add tooltips explaining game rules and controls
  - Show estimated time for operations

- **Test Coverage**:
  - Add React component tests using React Testing Library
  - Implement E2E tests with Playwright or Cypress
  - Add visual regression tests
  - Set up test coverage thresholds in CI/CD

- **Infrastructure & DevOps**:

  - Set up GitHub Actions or GitLab CI for automated testing
  - Add automated deployment pipeline
  - Implement automated dependency updates (Dependabot, Renovate)
  - Add automated code quality checks
  - Create Dockerfile for easy deployment
  - Consider migration to PostgreSQL for production scalability


### Documentation

- **Developer Documentation**:
  - Add API documentation with OpenAPI/Swagger
  - Create architecture decision records (ADRs)

## License

This project is created for technical interview purposes.
