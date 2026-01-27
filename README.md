# Time Blocking App

A minimalistic time blocking application for organizing your day through intuitive drag-and-drop task management.

![Time Blocking App](https://img.shields.io/badge/Status-MVP%20Complete-success)
![React](https://img.shields.io/badge/React-18.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)
![Vite](https://img.shields.io/badge/Vite-5.0-purple)

## ✨ Features

### Core Functionality
- **Task Creation** - Add tasks with custom durations via inline forms
- **Drag & Drop Reordering** - Intuitive drag-and-drop with SWAP and PUSH operations
- **Auto-Calculated Times** - Tasks automatically arrange sequentially starting at 8:00 AM
- **Lock Tasks** - Prevent specific tasks from being moved (e.g., fixed meetings)
- **Offline-First** - All data persists locally via localStorage
- **Overlap Detection** - Visual warnings when tasks conflict with locked items

### Smart Drag Operations

**SWAP** - Exchange positions when dropped deep into another task
```
Before:              After SWAP:
08:00 Task A (1h)    08:00 Task B (1h)
09:00 Task B (1h)    09:00 Task A (1h)
```

**PUSH** - Snap to task boundaries when dropped at the edge
```
Before:              After PUSH:
08:00 Task A (1h)    08:00 Task B (1h)
09:00 Task B (1h)    09:00 Task A (1h)
10:00 Task C (1h)    10:00 Task C (1h)
```

### Design Philosophy
- **Minimalistic** - Clean, airy layout with soft depth and green task blocks
- **Concept Art Inspired** - Left navigation rail + centered day view
- **No Clutter** - Spacing-based separation, no unnecessary borders
- **Accessible** - WCAG AA contrast ratios, keyboard navigation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (or Node 20+ recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd time_block_app

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:3001/` (or another available port)

### Build for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 📖 Usage

### Adding Tasks

1. **Click the [+] button** between tasks or at the top
2. **Enter task name** (e.g., "Write design docs")
3. **Enter duration** in minutes (e.g., 120 for 2 hours)
4. **Click "Add Task"** or press Enter

You can add tasks from:
- The **floating [+] button** in the top-right of the day view
- Any **insertion point** between tasks

### Reordering Tasks

**SWAP (Exchange Positions):**
- Drag a task **deep into** another task (past 50% mark)
- Tasks exchange positions
- Only the two tasks move

**PUSH (Insert and Shift):**
- Drag a task to the **top portion** of another task
- Dragged task takes the target's position
- All tasks below shift down

### Locking Tasks

1. **Hover** over a task block
2. **Click the lock icon** (top-right corner)
3. Locked tasks show an orange lock icon and can't be moved
4. Other tasks can't be swapped/pushed with locked tasks

### Visual Feedback

- **Hover** - Subtle shadow appears
- **Dragging** - Dashed black border, elevated shadow
- **Drop Target** - Solid black border highlights target
- **Overlapping** - Red pulsing border indicates conflicts

## 🛠 Tech Stack

### Core
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool (fast dev server)

### UI & Styling
- **Material-UI (MUI)** - Component library
- **Emotion** - CSS-in-JS styling
- **System Fonts** - Native, clean typography

### State & Data
- **Zustand** - Lightweight state management
- **localStorage** - Offline-first persistence

### Drag & Drop
- **Pragmatic Drag and Drop** - Atlassian's modern DnD library
- Native browser APIs for performance
- Accessible keyboard navigation

## 📁 Project Structure

```
src/
├── components/
│   ├── Timeline.tsx          # Main timeline container
│   ├── TaskBlock.tsx         # Draggable task block component
│   ├── InsertionPoint.tsx    # [+] button between tasks
│   ├── InlineTaskForm.tsx    # Task creation form
│   └── TimeLabel.tsx         # Hour labels (8:00 AM, etc.)
├── store/
│   └── taskStore.ts          # Zustand store with CRUD operations
├── utils/
│   ├── storage.ts            # localStorage helpers
│   ├── timeCalculations.ts   # Time formatting & calculations
│   └── dragLogic.ts          # SWAP/PUSH algorithms
├── theme/
│   └── theme.ts              # MUI theme (colors, typography)
├── types/
│   └── index.ts              # TypeScript interfaces
└── App.tsx                   # Root component
```

## 🧭 UI Layout (Concept Art)

- **Left navigation rail**
  - Calendar / Tasks / Stats / Settings
  - Note: navigation is currently visual-only (single view MVP).
- **Centered day view**
  - Title + scheduled count
  - Day header row (Yesterday / Today / Tomorrow)
  - Timeline with time labels and pill task cards
- **Floating [+] button**
  - Primary way to add a new task

## 🎨 Design System

### Colors
```typescript
// Base
Background:    #FFFFFF → #F7FBF8 (soft gradient)
Text Primary:  #000000 (Black)
Text Secondary: #666666 (Medium gray)
Accents:       #000000 (Black buttons)

// Task Blocks (Alternating Greens)
Green 1: #E8F5E9  // Pastel green
Green 2: #C8E6C9  // Light mint
Green 3: #A5D6A7  // Medium green
Green 4: #81C784  // Med-dark green
Green 5: #66BB6A  // Forest green

// Special States
Lock Icon:     #FFB74D (Pastel orange)
Overlap:       #EF5350 (Red)
```

### Typography
- **Font Family:** System fonts (-apple-system, Segoe UI, Roboto)
- **Task Title:** 18px, weight 600 (semi-bold)
- **Duration:** 13px, weight 400 (regular)
- **Time Labels:** 14px, weight 400/600 (focused)

## 🧠 Key Algorithms

### Time Calculation
- First task starts at 8:00 AM
- Subsequent tasks follow sequentially
- Times recalculate after every operation

### SWAP vs PUSH Detection
```typescript
// Configurable threshold (default 0.5 = 50%)
if (dropPosition >= threshold) {
  executeSwap()  // Exchange positions
} else {
  executePush()  // Snap to boundary
}
```

### Locked Task Handling
- SWAP with locked task → Operation fails
- PUSH would move locked task → Snap back
- Insertion between locked tasks → Overlap warning

## 🔮 Future Enhancements

### Planned Features
- [ ] Task editing (click to edit title/duration)
- [ ] Task deletion
- [ ] Undo/Redo functionality
- [ ] Multi-day calendar view
- [ ] Recurring tasks
- [ ] Categories/tags with color coding
- [ ] Time analytics and insights
- [ ] Cloud sync (multi-device)
- [ ] Calendar integrations (Google Calendar, iCal)
- [ ] Keyboard shortcuts (Cmd+N, arrow keys)

### Visual Polish
- [ ] Smooth animations for position changes
- [ ] Dynamic timeline expansion during drag
- [ ] Task completion tracking
- [ ] Dark mode
- [ ] Mobile app (React Native)

## 📝 Design Decisions

See [DESIGN_DOCS.md](./DESIGN_DOCS.md) for comprehensive design rationale, including:
- Why Pragmatic DnD over @dnd-kit
- Why MUI over Tailwind
- Why Zustand over Redux
- Complete UX interaction model
- All algorithms with examples

## 🐛 Known Limitations (MVP)

1. **Single-day view** - Only shows one day at a time
2. **No task editing** - Can only create and delete
3. **No undo/redo** - Accidental operations can't be undone
4. **Overlaps allowed** - Flagged but not prevented
5. **Hardcoded 8 AM start** - First task always starts at 8:00 AM
6. **localStorage only** - No cloud sync

## 🤝 Contributing

This is currently a personal project, but suggestions and feedback are welcome!

## 📄 License

MIT License - Feel free to use this project as you wish.

---

## 🎯 Quick Start Guide

### First Time Using the App?

1. **Add your first task**
   ```
   Click [+] → "Morning routine" → 30 minutes → Add
   ```

2. **Add a few more tasks**
   ```
   Click [+] → "Deep work session" → 120 minutes → Add
   Click [+] → "Lunch break" → 60 minutes → Add
   ```

3. **Try reordering**
   ```
   Drag "Lunch break" to the top → PUSH operation
   Drag "Deep work" into "Morning routine" → SWAP operation
   ```

4. **Lock a task**
   ```
   Hover over a task → Click lock icon
   Try moving other tasks around the locked one
   ```

5. **Data persists**
   ```
   Refresh the page → Your tasks are still there!
   ```

---

**Built with ❤️ using React, TypeScript, and Vite**

**Questions?** Check the [DESIGN_DOCS.md](./DESIGN_DOCS.md) for detailed documentation.
