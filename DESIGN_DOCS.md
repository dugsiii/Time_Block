# Time Blocking App - Design Documentation

## Project Overview

A minimalistic single-column time blocking application where users can insert tasks between existing blocks and drag-drop to reorder their day.

**MVP Scope:**
- Single-column timeline view with task blocks
- Insert tasks between blocks via [+] insertion points
- Drag and drop tasks to reorder with automatic time recalculation
- Lock tasks to prevent them from being moved
- Real-time visual feedback during drag operations
- Offline-first (localStorage persistence)
- Web application (starting platform)

**Current UI Shell (Concept Art Implementation):**
- Left navigation rail (Calendar / Tasks / Stats / Settings)
- Centered day view with header and timeline
- Floating [+] button (top-right) as primary task creation entry point

**Key Innovation:** Tasks auto-calculate times based on position and duration. Dragging triggers intelligent SWAP or PUSH operations that respect locked tasks.

---

## UX Interaction Model

### Core Concepts

**1. Single Column Timeline**
- All tasks displayed in one vertical column
- Each task shows start time and duration
- Times auto-calculate based on task order and durations
- First task defaults to 8:00 AM
- Timeline dynamically expands as you add/drag tasks

**2. Insertion-Based Task Creation**
```
08:00 AM
┌──────────────┐
│ Task A: 2h   │
└──────────────┘
       ↓ Hover here reveals [+]
10:00 AM
┌──────────────┐
│ Task B: 1h   │
└──────────────┘
       ↓ Hover here reveals [+]
11:00 AM
```

- Hover between tasks → [+] button appears
- Click [+] → inline form appears
- Enter task name and duration → task inserted
- All subsequent tasks shift to accommodate

**3. SWAP vs PUSH Operations**

Tasks can be reordered via drag-and-drop. The system determines whether to SWAP or PUSH based on drop position:

**SWAP (Exchange positions):**
```
Before:              After SWAP:
08:00 Task 1 (1h)    08:00 Task 2 (2h)
09:00 Task 2 (2h)    10:00 Task 1 (1h)
11:00 Task 3 (1h)    11:00 Task 3 (1h)
```
- Triggered when dropping Task 1 deep into Task 2's slot (past threshold, e.g., midpoint)
- Only the two tasks exchange positions
- Times recalculate: Task 2 takes Task 1's start time, Task 1 starts at (Task 2's new start + Task 2's duration)
- Other tasks (Task 3) don't move

**PUSH (Shift all subsequent tasks):**
```
Before:              After PUSH:
08:00 Task 1 (1h)    08:00 Task 2 (1h)
09:00 Task 2 (1h)    09:00 Task 1 (1h)
10:00 Task 3 (1h)    10:00 Task 3 (1h)
```
- Triggered when dropping Task 1 into Task 2's slot but not deep enough to swap
- Task 1 takes Task 2's exact start time (no fragmentation)
- Task 2 and all subsequent tasks shift down by Task 1's duration
- Cascading effect: Task 2 shifts, which shifts Task 3, etc.
- **Key difference from SWAP:** Order changes (Task 2 → Task 1 → Task 3) but only dragged task moves position

**Threshold (Configurable):**
- SWAP threshold determines when drag becomes swap vs push (e.g., 0.5 = 50% into target task)
- Must be easily adjustable for UX tuning
- Visual preview must exactly match what will happen on drop

**4. Locking Mechanism**

Tasks can be locked to prevent movement:

```
08:00 AM
┌──────────────┐
│ Task A: 2h   │
└──────────────┘
10:00 AM
┌──────────────┐
│ Task B: 1h   │ 🔒 (locked at 10:00)
└──────────────┘
11:00 AM
┌──────────────┐
│ Task C: 1h   │
└──────────────┘
```

**Lock UI:**
- Hover over task block → lock icon appears
- Click lock icon → toggles isLocked state
- Locked tasks show persistent lock icon

**Lock Behavior:**
- **SWAP attempt with locked task:** Swap fails, dragged task returns to original position
- **PUSH that would move locked task:** Dragged task snaps back to original position
- **Inserting between unlocked and locked tasks:**
  - New task inserted at the insertion point
  - Locked task stays in place
  - Unlocked task shifts to accommodate

**Example - Insertion with locked task:**
```
Before:                    After inserting Task D (1h) between A and B:
08:00 Task A (2h)          07:00 Task A (2h) ← Shifted UP
10:00 Task B (1h) 🔒       09:00 Task D (1h) ← New task
11:00 Task C (1h)          10:00 Task B (1h) 🔒 ← Stayed locked
                           11:00 Task C (1h) ← Moved with B
```

**5. Overlap Handling**

If insertion or drag creates overlap with locked tasks (e.g., inserting between two locked tasks with insufficient space):
- Task is created/moved but flagged as overlapping
- Visual state: Semi-transparent + light red pulsing animation
- Indicates user needs to manually adjust

**6. Time Snapping & Timeline Expansion**

**Task Boundary Snapping:**
- **PUSH operations:** Tasks snap to existing task boundaries (no fragmentation)
- **SWAP operations:** Tasks exchange exact positions (clean times maintained)
- **Insertion:** New tasks placed between existing tasks
- 15-minute rounding only applies to manually inserted tasks (via [+] button)
- Result: Timeline stays organized without scattered times like 8:37 AM
- Dragging is smooth (not snappy), snapping happens on drop

**Dynamic Timeline:**
- Normally shows ±1 hour buffer around tasks
- When dragging starts: reveal ±1 hour from dragged task
- As drag approaches timeline edge: smoothly expand in that direction
- Example: Dragging toward 7:00 AM boundary → 6:00 AM appears
- Infinite expansion (can schedule tasks at any time)
- Smooth but not slow (responsive expansion)

**Focused Time Indicator:**
- Time label where task will be placed: **solid black** (focused)
- Other visible time labels: **gray/light** (unfocused)
- Provides clear visual feedback during drag

**7. Real-Time Drag Preview**

As you drag, the UI shows preview of what will happen:

**Visual Feedback:**
1. **Dragged task:** Follows cursor, slight opacity
2. **Target task (if SWAP zone):**
   - At 1/3 position into target: Target shifts slightly down (making room preview)
   - At 2/3 position into target: Target shifts slightly up (preparing to swap)
   - Smooth interpolated animation based on exact cursor position
3. **Affected tasks (if PUSH zone):**
   - Show preview positions where they'll land
   - Slight opacity to indicate "preview state"
4. **Time labels:**
   - Drop time highlighted in solid black
   - Other times in gray

**Preview Accuracy:**
- What you see during drag is exactly what happens on drop
- No surprises when releasing the mouse/touch

---

## Tech Stack & Design Decisions

### Core Technologies

#### React 18+ with TypeScript
**Decision:** Use React with TypeScript for the frontend framework

**Rationale:**
- Component-based architecture perfect for task blocks and timeline
- Hooks enable complex drag state management
- TypeScript prevents bugs in time calculation logic
- Type safety for Task model (required fields: id, title, durationMinutes, startTime, isLocked)
- Excellent IDE support for refactoring complex algorithms

#### Vite
**Decision:** Use Vite as the build tool

**Rationale:**
- 10-100x faster dev server than Create React App
- Instant hot module replacement for rapid iteration
- Built-in TypeScript support with zero config
- CRA is no longer maintained
- No need for Next.js (no server-side rendering for local-first app)

#### Pragmatic Drag and Drop
**Decision:** Use @atlaskit/pragmatic-drag-and-drop for drag-and-drop functionality

**Rationale:**
- Atlassian's modern library (successor to react-beautiful-dnd)
- Uses native browser drag-and-drop APIs (best performance)
- Battle-tested in Jira, Trello, Confluence (complex UIs)
- Framework-agnostic (future-proof for React Native)
- Small bundle size (~4.7KB core)
- Actively maintained (new releases every few weeks)
- Built-in accessibility (keyboard navigation, screen reader support)
- Excellent touch support for mobile web
- Low-level control perfect for custom SWAP/PUSH logic

**Why Pragmatic DnD for this app:**
- Need custom drop behavior (SWAP vs PUSH based on position)
- Need real-time preview of affected tasks
- Need to respect locked tasks during drag
- Low-level API gives full control over drag logic

**Alternatives Considered:**
- `@dnd-kit`: Higher-level abstraction, harder to customize SWAP/PUSH logic
- `react-beautiful-dnd`: No longer maintained
- `react-dnd`: More complex API, unnecessary overhead

#### Material-UI (MUI)
**Decision:** Use Material-UI for component library and styling

**Rationale:**
- Pre-built TextField, Button components speed up MVP
- Built-in form validation for inline task creation
- Accessibility (ARIA attributes) handled automatically
- Mobile-responsive inputs out of the box
- Customizable to achieve minimalistic design
- Consistent design system
- 300KB gzipped acceptable for local-first app

**Customization for Minimalism:**
```typescript
const minimalTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#000000ff' },
    background: { default: '#fafafa' },
    text: {
      primary: '#000000', // Solid black for focused time
      secondary: '#9e9e9e' // Gray for unfocused time
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // No uppercase
          borderRadius: 8 // Softer corners
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)' // Subtle shadow
        }
      }
    }
  }
})
```

**Why MUI over Tailwind:**
- Inline form (insertion point) benefits from MUI TextField validation
- Faster to build clean, minimal UI
- Accessibility critical for drag-and-drop app

#### Zustand
**Decision:** Use Zustand for state management

**Rationale:**
- Minimal boilerplate for complex state (tasks, drag state, config)
- No Context providers needed
- Simple API: `useTaskStore(state => state.tasks)`
- ~1KB gzipped
- Better performance than Context API (selective subscriptions)
- Redux DevTools support for debugging complex SWAP/PUSH logic

**State Structure:**
```typescript
interface TaskStore {
  tasks: Task[]
  dragConfig: { swapThreshold: number }

  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'color'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  insertTask: (afterTaskId: string | null, task: Omit<Task, 'id' | 'createdAt' | 'order' | 'color'>) => void
  swapTasks: (taskId1: string, taskId2: string) => void
  pushTask: (draggedTaskId: string, targetTaskId: string) => void
  toggleLock: (taskId: string) => void
  setSwapThreshold: (threshold: number) => void
}

// Note: 'color' is auto-assigned on task creation based on total task count
// It persists with the task through reordering operations
```

#### LocalStorage
**Decision:** Use browser localStorage for data persistence

**Rationale:**
- Built into browsers (zero dependencies)
- Synchronous API (simple to use)
- Perfect for offline-first requirement
- Persists across page refreshes
- 5-10MB limit sufficient for thousands of tasks

**Persistence Strategy:**
- Auto-save to localStorage on every state update
- Load from localStorage on app initialization
- Store tasks array as JSON
- Migration: Tasks without 'color' field get assigned one on load (backwards compatibility)
- Date serialization: Convert Date objects to/from ISO strings

---

## Visual Design

### Design Philosophy
Minimalistic, clean, Notion-inspired aesthetic with focus on clarity and functionality. Black and white base with green task blocks for visual organization.

### Color Palette

#### Base Colors
```
App Background: #FFFFFF (Pure white)
Text Primary (Task titles): #000000 (Black - bold, high contrast)
Text Secondary (Duration, labels): #666666 (Medium gray)
Buttons/Accents: #000000 (Black - strong, clear)
Time Labels (Focused): #000000 (Solid black - indicates drop target)
Time Labels (Unfocused): #BDBDBD (Light gray - faded)
```

#### Task Block Colors (Alternating Greens)
Tasks cycle through 5 green shades for visual variety:
```css
taskColors = [
  '#E8F5E9',  // Green 1: Pastel green (very light, soft)
  '#C8E6C9',  // Green 2: Light mint green
  '#A5D6A7',  // Green 3: Medium green
  '#81C784',  // Green 4: Medium-dark green
  '#66BB6A',  // Green 5: Forest green (richest)
]

/* Color Assignment: Assigned on task creation based on total task count */
/* Color Persistence: Once assigned, color stays with the task even when reordered */
/* Example: If you create 3 tasks, they get Green 1, 2, 3. When reordered, colors stay */
/* Stored in theme.ts for easy customization */
```

#### Special State Colors
```
Lock Icon: #FFB74D (Pastel orange - consistent, friendly)
Overlap Warning Border: #EF5350 (Red - alert)
Insertion [+] Button: #000000 (Black - matches accent color)
Hover Effects: rgba(0,0,0,0.1) (Subtle black shadow)
```

### Typography

#### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto",
             "Helvetica Neue", Arial, sans-serif;

/* System fonts for clean, native feel - easy to swap later */
```

#### Font Sizes & Weights
```
Task Title: 18px, weight 600 (semi-bold)
Task Duration: 13px, weight 400 (regular)
Time Labels: 14px, weight 400 (regular) / 600 (focused)
Buttons: 15px, weight 500 (medium)
```

### Task Block Styling

#### Normal State
```css
Background: Green from task.color (assigned on creation, persists through reordering)
Border: None (spacing provides separation)
Border Radius: 8px (soft, rounded corners)
Padding: 16px (comfortable internal spacing)
Margin Bottom: 8px (compact gap between tasks)
Box Shadow: None (clean, flat)
```

#### Hover State
```css
Box Shadow: 0 2px 8px rgba(0,0,0,0.1) (subtle lift)
Cursor: grab
Lock icon fades in (if unlocked)
Transition: 150ms ease (snappy response)
```

#### Dragging State
```css
Border: 2px dashed #000000 (clear visual feedback)
Opacity: 85% (semi-transparent)
Box Shadow: 0 4px 12px rgba(0,0,0,0.15) (elevated)
Cursor: grabbing
```

#### Locked State
```css
Background: Same green (no change)
Lock icon: #FFB74D (pastel orange, always visible)
Cursor: not-allowed
```

#### Overlapping State
```css
Border: 2px solid #EF5350 (red alert)
Warning icon: Red, top-right corner
Animation: Subtle pulse on border (1.5s cycle)
Background: Same green
```

### Buttons & Interactive Elements

#### Insertion [+] Button
```css
/* Container */
Height: 0px (overlaps task blocks, no vertical space)
Position: Relative, z-index: 10 (sits above task blocks)
Opacity: 0 (hidden), 1 on hover

/* Button */
Size: 24px × 24px circle (compact)
Background: #FFFFFF (white)
Border: 1.5px solid #000000 (black, thinner for delicate look)
Icon: #000000 (black), 16px
Padding: 0 (exact size control)

/* Hover */
Background: #000000 (inverted - black)
Icon: #FFFFFF (white)
Transition: 200ms ease
Cursor: pointer
```

#### Submit Buttons
```css
Background: #000000 (black)
Text: #FFFFFF (white)
Padding: 10px 20px
Border Radius: 6px
Font Weight: 500

/* Hover */
Background: #333333 (lighter black)
```

#### Cancel Buttons
```css
Background: Transparent
Text: #666666 (gray)
Border: 1px solid #E0E0E0 (light gray)

/* Hover */
Border Color: #000000 (black)
```

### Layout & Spacing

#### Timeline Container
```css
Width: 650px (desktop - accommodates time labels + task blocks)
Max Width: 100% (mobile responsive)
Margin: 0 auto (centered)
Padding: 24px 16px
Background: #FFFFFF (pure white)

/* Two-Column Layout */
Layout: Flex row with gap: 24px
- Left Column: Time labels (90px wide, right-aligned)
- Right Column: Task blocks (400px fixed width)
- Alignment: Time labels aligned with top of task blocks (pt: 16px)
```

#### Task Spacing
```css
Gap Between Tasks: 8px (compact visual separation)
Insertion Point Height: 0px (overlaps task blocks, no vertical space)
Task Minimum Height: 50px (even for short tasks)
Task Height Formula: durationMinutes * 1.33px (e.g., 60min = 80px)
```

### Icons

#### Lock Icon
- Style: Material Icons (outlined when unlocked, filled when locked)
- Size: 20px
- Color: #FFB74D (pastel orange)
- Position: Absolute, top-right corner (8px from edges)
- Visibility: Shows on hover (unlocked), always visible (locked)

#### Warning/Overlap Icon
- Style: Material Icons alert triangle
- Size: 18px
- Color: #EF5350 (red)
- Position: Top-right corner (next to lock icon if both present)

#### Insertion [+] Icon
- Style: Plus symbol in circle
- Size: 20px icon in 32px circle
- Color: #000000 (black), inverts on hover

### Animations

```css
/* Task Position Changes (shift during insert/drag) */
transition: transform 250ms ease-out, margin 250ms ease-out;

/* Hover Effects */
transition: box-shadow 150ms ease, opacity 150ms ease;

/* Button Interactions */
transition: background-color 200ms ease, color 200ms ease;

/* Overlap Pulse (border animation) */
animation: pulse 1.5s ease-in-out infinite;
@keyframes pulse {
  0%, 100% { border-color: #EF5350; opacity: 1; }
  50% { border-color: #EF5350; opacity: 0.6; }
}
```

### Responsive Design

#### Desktop (> 768px)
```css
Timeline Width: 600px
Font Sizes: As specified above
Task Padding: 16px
```

#### Mobile (≤ 768px)
```css
Timeline Width: 100% (with 16px side padding)
Font Sizes: Slightly reduced (title 16px, duration 12px)
Task Padding: 12px
Touch targets: Minimum 44px height
```

### Visual Hierarchy

1. **Task Titles** - Largest, boldest (18px, weight 600, black)
2. **Time Labels (Focused)** - Bold black (14px, weight 600)
3. **Time Labels (Unfocused)** - Light gray (14px, weight 400, #BDBDBD)
4. **Task Duration** - Small gray subscript (13px, weight 400, #666666)
5. **Buttons** - Black background, white text (high contrast)

### Accessibility

- **Color Contrast:** All text meets WCAG AA standards
  - Black on white: 21:1 ratio
  - Gray (#666666) on white: 5.74:1 ratio
  - Green backgrounds: Text remains black for contrast
- **Focus States:** Visible keyboard focus (2px solid black outline)
- **Touch Targets:** Minimum 44px × 44px for mobile interactions
- **Screen Reader:** ARIA labels on all interactive elements

---

## Architecture

### Data Model

```typescript
interface Task {
  id: string              // Unique identifier (crypto.randomUUID())
  title: string           // User-entered task name (required)
  durationMinutes: number // Task duration (any value >= 1, no constraints)
  startTime: Date         // Calculated start time (NOT optional)
  isLocked: boolean       // Lock state (prevents movement)
  order: number           // Position in task list (for sorting)
  isOverlapping: boolean  // Flagged when overlapping with locked tasks
  createdAt: Date         // Metadata for sorting
  color: string           // Background color (assigned on creation, persists)
}

interface DragConfig {
  swapThreshold: number   // 0.0 to 1.0 (e.g., 0.5 = 50% into target task)
}

interface AppState {
  tasks: Task[]
  dragConfig: DragConfig
  // Future: selectedDate, viewMode, etc.
}
```

**Field Decisions:**

- **id:** Required for React keys and CRUD operations
- **title:** Always required, never empty
- **durationMinutes:** Number for arithmetic (time calculations, block heights), any value >= 1
- **startTime:** Always has a value (no optional "unscheduled" state)
- **isLocked:** Default false, toggleable via lock icon
- **order:** Explicit ordering (0, 1, 2...) for maintaining sequence
- **color:** Assigned on creation based on task count, persists through reordering
- **isOverlapping:** Flag for visual warning state (translucent + red pulse)
- **createdAt:** Metadata, useful for default sorting

**Why startTime is always set:**
- First task defaults to 8:00 AM
- Every task has a position in the timeline
- Times auto-calculate based on previous task's end time
- No "backlog" concept in this design

**Fields NOT in MVP:**
- `description`: Minimalistic - just title
- `color`, `category`: Nice-to-have
- `completedAt`: Not tracking completion
- `recurringPattern`: Future feature

### Component Architecture

```
src/
├── components/
│   ├── Timeline.tsx          # Main timeline container
│   ├── TaskBlock.tsx         # Individual draggable task block
│   ├── InsertionPoint.tsx    # Hoverable gap with [+] button
│   ├── InlineTaskForm.tsx    # Form that appears when [+] clicked
│   ├── TimeLabel.tsx         # Hour label with focused/unfocused state
│   └── OverlapIndicator.tsx  # Visual warning for overlapping tasks
├── store/
│   └── taskStore.ts          # Zustand store
├── utils/
│   ├── storage.ts            # localStorage helpers
│   ├── timeCalculations.ts   # Time rounding, range calculation
│   └── dragLogic.ts          # SWAP/PUSH algorithms
├── hooks/
│   ├── useDragPreview.ts     # Real-time drag preview logic
│   └── useTimelineExpansion.ts # Dynamic timeline expansion
├── theme/
│   └── theme.ts              # MUI theme customization
├── types/
│   └── index.ts              # TypeScript interfaces
├── App.tsx
└── main.tsx
```

**Component Responsibilities:**

**Timeline.tsx** (Main Container)
- Renders all tasks in vertical column
- Renders InsertionPoint components between tasks
- Handles dynamic timeline range calculation
- Shows TimeLabel components for hours
- Manages drag state and preview
- Coordinates SWAP/PUSH operations

**TaskBlock.tsx** (Draggable Task)
- Visual representation of task (title, duration, time)
- Draggable via Pragmatic Drag and Drop
- Shows lock icon on hover
- Height calculated from durationMinutes
- Visual states:
  - Normal: solid background
  - Dragging: follows cursor, slight opacity
  - Preview: semi-transparent position preview
  - Locked: shows lock icon
  - Overlapping: semi-transparent + red pulse animation
- Props: `task: Task`, `isDragging: boolean`, `isPreview: boolean`

**InsertionPoint.tsx** (Hoverable Gap)
- Invisible by default
- Shows [+] button on hover
- Positioned between task blocks
- Click triggers inline form
- Props: `afterTaskId: string | null`, `onInsert: (task: Task) => void`

**InlineTaskForm.tsx** (Task Creation Form)
- Appears when [+] clicked
- MUI TextField for title (autofocus)
- MUI TextField for duration (number input, default 30 minutes)
  - Min: 1 minute (flexible, allows any duration)
  - Step: 1 minute (no 15-minute constraint)
  - Allows arbitrary durations (e.g., 7 minutes, 23 minutes, 100 minutes)
- Submit button (or Enter key)
- Cancel button (or Escape key)
- Compact, inline design
- Props: `onSubmit: (title: string, duration: number) => void`, `onCancel: () => void`

**TimeLabel.tsx** (Hour Indicator)
- Displays hour (e.g., "8:00 AM", "9:00 AM")
- Two visual states:
  - Focused: solid black text (indicates drop target)
  - Unfocused: gray text
- Positioned on left side of timeline
- Props: `time: Date`, `isFocused: boolean`

**OverlapIndicator.tsx** (Warning UI)
- Small warning icon/text near overlapping task
- Tooltip: "This task overlaps with a locked task. Please adjust."
- Props: `taskId: string`

### Layout Structure

**Single Column Design (Centered Day View):**
```
┌───────────────────────────────────────────┐
│ Nav Rail │        Centered Day View       │
│ (icons)  │   Time Blocking App    [+]     │
│          │   Yesterday  Today  Tomorrow   │
│          │   08:00  ┌───────────────┐     │
│          │          │ Task A        │     │
│          │          │ Est. 2h       │     │
│          │          └───────────────┘     │
│          │   10:00  ┌───────────────┐     │
│          │          │ Task B   🔒    │     │
│          │          └───────────────┘     │
└───────────────────────────────────────────┘
```

---

## Key Algorithms

### 1. Time Rounding (Round up to 15 minutes)

```typescript
function roundTimeUp(date: Date): Date {
  const minutes = date.getMinutes()
  const remainder = minutes % 15

  if (remainder === 0) return date

  const roundedMinutes = minutes + (15 - remainder)
  const newDate = new Date(date)
  newDate.setMinutes(roundedMinutes)
  newDate.setSeconds(0)
  newDate.setMilliseconds(0)

  return newDate
}

// Examples:
// 8:00 → 8:00
// 8:01 → 8:15
// 8:37 → 8:45
// 8:45 → 8:45
```

### 2. Calculate Task Start Times (Sequential)

```typescript
function recalculateTaskTimes(tasks: Task[]): Task[] {
  const sorted = [...tasks].sort((a, b) => a.order - b.order)
  let currentTime = new Date()
  currentTime.setHours(8, 0, 0, 0) // Default start: 8:00 AM

  return sorted.map(task => {
    const updatedTask = { ...task, startTime: currentTime }
    currentTime = new Date(currentTime.getTime() + task.durationMinutes * 60000)
    return updatedTask
  })
}
```

### 3. Insert Task (With Lock Handling)

```typescript
function insertTask(
  tasks: Task[],
  afterTaskId: string | null,
  newTask: Task
): Task[] {
  // If afterTaskId is null, insert at beginning
  if (afterTaskId === null) {
    return [{ ...newTask, order: -1 }, ...tasks].map(reorderTask)
  }

  const afterIndex = tasks.findIndex(t => t.id === afterTaskId)
  const beforeTask = tasks[afterIndex + 1]

  // Check if next task is locked
  if (beforeTask?.isLocked) {
    // Shift previous task up instead
    const newTasks = [...tasks]
    newTasks.splice(afterIndex + 1, 0, newTask)
    return recalculateTimes(newTasks)
  }

  // Normal insertion
  const newTasks = [...tasks]
  newTasks.splice(afterIndex + 1, 0, newTask)
  return recalculateTimes(newTasks)
}

function reorderTask(task: Task, index: number): Task {
  return { ...task, order: index }
}
```

### 4. Determine Drag Action (SWAP vs PUSH)

```typescript
function getDragAction(
  draggedTask: Task,
  targetTask: Task | null,
  dropPosition: { y: number }, // Cursor Y position
  targetBounds: { top: number, height: number },
  swapThreshold: number // e.g., 0.5
): 'SWAP' | 'PUSH' | 'NONE' {
  if (!targetTask) return 'NONE'
  if (targetTask.isLocked) return 'NONE' // Can't interact with locked tasks

  // Calculate how far into target task we are (0.0 to 1.0)
  const relativePosition = (dropPosition.y - targetBounds.top) / targetBounds.height

  // If past threshold, it's a SWAP
  if (relativePosition >= swapThreshold) {
    return 'SWAP'
  }

  // Otherwise it's a PUSH
  return 'PUSH'
}
```

### 5. Execute SWAP

```typescript
function executeSwap(
  tasks: Task[],
  taskId1: string,
  taskId2: string
): Task[] | null {
  const task1 = tasks.find(t => t.id === taskId1)
  const task2 = tasks.find(t => t.id === taskId2)

  if (!task1 || !task2) return null
  if (task1.isLocked || task2.isLocked) return null // Swap fails with locked tasks

  // Swap order values
  const newTasks = tasks.map(task => {
    if (task.id === taskId1) return { ...task, order: task2.order }
    if (task.id === taskId2) return { ...task, order: task1.order }
    return task
  })

  // Recalculate times based on new order
  return recalculateTaskTimes(newTasks)
}
```

### 6. Execute PUSH

```typescript
function executePush(
  tasks: Task[],
  draggedTaskId: string,
  targetTaskId: string
): Task[] | null {
  const draggedTask = tasks.find(t => t.id === draggedTaskId)
  const targetTask = tasks.find(t => t.id === targetTaskId)

  if (!draggedTask || !targetTask) return null
  if (targetTask.isLocked) return null // Can't push into locked task

  // Get the target task's current start time
  const newStartTime = targetTask.startTime

  // Check if push would conflict with locked tasks
  const conflictsWithLocked = checkLockedConflict(tasks, draggedTask, newStartTime, targetTaskId)
  if (conflictsWithLocked) return null // Snap back

  // Reorder tasks: dragged task takes target's position
  const draggedOrder = draggedTask.order
  const targetOrder = targetTask.order

  const reorderedTasks = tasks.map(task => {
    if (task.id === draggedTaskId) {
      // Dragged task takes target's order
      return { ...task, order: targetOrder }
    } else if (task.order >= targetOrder && task.order < draggedOrder) {
      // Tasks between target and dragged shift up
      return { ...task, order: task.order + 1 }
    } else if (task.order <= targetOrder && task.order > draggedOrder) {
      // Tasks between dragged and target shift down
      return { ...task, order: task.order - 1 }
    }
    return task
  })

  // Recalculate times based on new order
  return recalculateTaskTimes(reorderedTasks)
}

function checkLockedConflict(
  tasks: Task[],
  draggedTask: Task,
  newStartTime: Date,
  targetTaskId: string
): boolean {
  const draggedEnd = new Date(newStartTime.getTime() + draggedTask.durationMinutes * 60000)

  // Check if any locked task (except target) would need to move
  return tasks.some(task => {
    if (!task.isLocked || task.id === draggedTask.id || task.id === targetTaskId) return false

    const taskEnd = new Date(task.startTime.getTime() + task.durationMinutes * 60000)

    // Check for overlap with the new position
    return (newStartTime < taskEnd && draggedEnd > task.startTime)
  })
}
```

### 7. Detect Overlaps

```typescript
function detectOverlaps(tasks: Task[]): Task[] {
  return tasks.map(task => {
    const taskEnd = new Date(task.startTime.getTime() + task.durationMinutes * 60000)

    const hasOverlap = tasks.some(other => {
      if (other.id === task.id) return false
      const otherEnd = new Date(other.startTime.getTime() + other.durationMinutes * 60000)
      return (task.startTime < otherEnd && taskEnd > other.startTime)
    })

    return { ...task, isOverlapping: hasOverlap }
  })
}
```

### 8. Calculate Visible Timeline Range

```typescript
function getVisibleTimeRange(
  tasks: Task[],
  draggingTask?: Task,
  dragPosition?: Date
): { start: Date, end: Date } {
  if (tasks.length === 0) {
    // Default range: 8 AM to 8 PM
    const start = new Date()
    start.setHours(8, 0, 0, 0)
    const end = new Date()
    end.setHours(20, 0, 0, 0)
    return { start, end }
  }

  // Find earliest and latest times
  let earliest = tasks[0].startTime
  let latest = new Date(
    tasks[tasks.length - 1].startTime.getTime() +
    tasks[tasks.length - 1].durationMinutes * 60000
  )

  // If dragging, expand range if needed
  if (draggingTask && dragPosition) {
    if (dragPosition < earliest) earliest = dragPosition
    const dragEnd = new Date(dragPosition.getTime() + draggingTask.durationMinutes * 60000)
    if (dragEnd > latest) latest = dragEnd
  }

  // Add ±1 hour buffer
  const start = new Date(earliest.getTime() - 60 * 60000)
  const end = new Date(latest.getTime() + 60 * 60000)

  return { start, end }
}
```

### 9. Get Drag Preview State

```typescript
interface DragPreview {
  action: 'SWAP' | 'PUSH' | 'NONE'
  affectedTasks: Array<{
    taskId: string
    previewPosition: Date
  }>
  focusedTime: Date
}

function getDragPreview(
  tasks: Task[],
  draggedTask: Task,
  currentPosition: Date,
  targetTask: Task | null,
  swapThreshold: number
): DragPreview {
  const action = getDragAction(draggedTask, targetTask, currentPosition, swapThreshold)

  if (action === 'SWAP' && targetTask) {
    return {
      action: 'SWAP',
      affectedTasks: [
        { taskId: targetTask.id, previewPosition: draggedTask.startTime },
        { taskId: draggedTask.id, previewPosition: targetTask.startTime }
      ],
      focusedTime: targetTask.startTime
    }
  }

  if (action === 'PUSH') {
    // Calculate cascading push positions
    const roundedPosition = roundTimeUp(currentPosition)
    const affectedTasks = calculatePushPreview(tasks, draggedTask, roundedPosition)

    return {
      action: 'PUSH',
      affectedTasks,
      focusedTime: roundedPosition
    }
  }

  return {
    action: 'NONE',
    affectedTasks: [],
    focusedTime: currentPosition
  }
}
```

---

## Plan

### Phase 1: Project Setup & Foundation
**Goal:** Get development environment running with basic structure

**Steps:**
1. Initialize Vite project with React + TypeScript
   ```bash
   npm create vite@latest . -- --template react-ts
   ```

2. Install dependencies
   ```bash
   npm install
   npm install @mui/material @emotion/react @emotion/styled
   npm install zustand
   npm install @atlaskit/pragmatic-drag-and-drop
   npm install @atlaskit/pragmatic-drag-and-drop-react-drop-indicator
   ```

3. Set up project folder structure
   - Create directories: `src/components/`, `src/store/`, `src/utils/`, `src/hooks/`, `src/theme/`, `src/types/`
   - Remove default Vite boilerplate files

4. Create TypeScript interfaces in `src/types/index.ts`
   - Define Task, DragConfig, AppState interfaces

5. Configure MUI theme in `src/theme/theme.ts`
   - Minimal theme with solid black / gray color scheme
   - Custom button and card styles
   - Wrap App in ThemeProvider

6. Test dev server
   ```bash
   npm run dev
   ```

**Deliverable:** Dev server running with MUI theme applied, folder structure ready

---

### Phase 2: State Management & Core Utilities
**Goal:** Set up Zustand store, localStorage, and time calculation utilities

**Steps:**
1. Create localStorage utilities (`src/utils/storage.ts`)
   - `saveTasksToStorage(tasks: Task[]): void`
   - `loadTasksFromStorage(): Task[]`
   - Handle JSON serialization of Date objects

2. Create time calculation utilities (`src/utils/timeCalculations.ts`)
   - `roundTimeUp(date: Date): Date`
   - `recalculateTaskTimes(tasks: Task[]): Task[]`
   - `getVisibleTimeRange(tasks, draggingTask?, dragPosition?): {start, end}`
   - `formatTime(date: Date): string` (e.g., "8:00 AM")
   - `formatDuration(minutes: number): string` (e.g., "1h 30m")

3. Create drag logic utilities (`src/utils/dragLogic.ts`)
   - `getDragAction(...): 'SWAP' | 'PUSH' | 'NONE'`
   - `executeSwap(tasks, taskId1, taskId2): Task[] | null`
   - `executePush(tasks, taskId, newTime): Task[] | null`
   - `checkLockedConflict(...): boolean`
   - `detectOverlaps(tasks): Task[]`

4. Build Zustand store (`src/store/taskStore.ts`)
   - State: tasks, dragConfig
   - Actions: addTask, updateTask, deleteTask, insertTask, swapTasks, pushTask, toggleLock, setSwapThreshold
   - Integrate with localStorage (auto-save on updates)
   - Load initial state from localStorage

5. Test in browser console
   - Manually create tasks, verify localStorage
   - Test time calculations
   - Test SWAP and PUSH logic

**Deliverable:** Working state management with persistence and tested algorithms

---

### Phase 3: Basic UI Components (Static, No Drag-Drop)
**Goal:** Build static UI to display tasks

**Steps:**
1. Build TimeLabel component (`src/components/TimeLabel.tsx`)
   - Display formatted time (e.g., "8:00 AM")
   - Props: `time: Date`, `isFocused: boolean`
   - Focused: black text, Unfocused: gray text

2. Build TaskBlock component (`src/components/TaskBlock.tsx`)
   - MUI Card displaying task title and duration
   - Calculate height based on durationMinutes (e.g., 1h = 80px)
   - Show lock icon on hover (click to toggle)
   - Visual states: normal, locked, overlapping (translucent + red pulse)
   - Props: `task: Task`, `onToggleLock: () => void`
   - Not draggable yet (just static display)

3. Build InsertionPoint component (`src/components/InsertionPoint.tsx`)
   - Small hoverable area between tasks
   - Shows [+] button on hover
   - Click triggers callback
   - Props: `afterTaskId: string | null`, `onClick: () => void`

4. Build InlineTaskForm component (`src/components/InlineTaskForm.tsx`)
   - MUI TextField for title (autofocus, required)
   - MUI TextField for duration (type="number", default 30, min 5, step 15)
   - Submit button (or Enter key)
   - Cancel button (or Escape key)
   - Props: `onSubmit: (title, duration) => void`, `onCancel: () => void`

5. Build Timeline component (`src/components/Timeline.tsx`)
   - Fetch tasks from Zustand store
   - Calculate visible time range
   - Render TimeLabel components for each hour
   - Render TaskBlock components for each task
   - Render InsertionPoint components between tasks
   - Handle insertion (show/hide InlineTaskForm)

6. Build App component (`src/App.tsx`)
   - Simple layout: header + Timeline
   - MUI AppBar with app title
   - ThemeProvider wrapper

**Deliverable:** Static UI showing tasks, insertion points, and inline forms (no drag yet)

---

### Phase 4: Insertion Logic
**Goal:** Make task insertion functional

**Steps:**
1. Wire up InsertionPoint to show InlineTaskForm
   - State to track which insertion point is active
   - Click [+] → show form, hide other insertion points

2. Wire up InlineTaskForm to create tasks
   - OnSubmit: call `insertTask()` from store
   - Auto-calculate start time based on previous task
   - Recalculate all subsequent task times
   - Close form after submission

3. Test insertion scenarios:
   - Insert at beginning (no previous task)
   - Insert between two tasks
   - Insert between unlocked and locked task (verify shift logic)
   - Insert at end

4. Add visual feedback:
   - Smooth animation when tasks shift
   - CSS transitions for task position changes

**Deliverable:** Fully functional task insertion with automatic time recalculation

---

### Phase 5: Drag-and-Drop Integration
**Goal:** Implement SWAP and PUSH via drag-and-drop

**Steps:**
1. Make TaskBlock draggable
   - Import `draggable` from Pragmatic DnD
   - Register TaskBlock as draggable in useEffect
   - Set `getInitialData` to include task ID
   - Add dragging visual state (opacity, cursor)

2. Create useDragPreview hook (`src/hooks/useDragPreview.ts`)
   - Track drag position in real-time
   - Determine target task under cursor
   - Calculate SWAP vs PUSH action
   - Return preview state (affected tasks, focused time, action type)

3. Integrate drag preview into Timeline
   - Use useDragPreview during drag
   - Show affected tasks in preview positions (semi-transparent)
   - Highlight focused time label (solid black)
   - Animate preview state smoothly (1/3, 2/3 interpolation for SWAP)

4. Implement drop handlers
   - OnDrop: execute SWAP or PUSH based on final action
   - Call store methods: `swapTasks()` or `pushTask()`
   - Handle locked task failures (snap back animation)

5. Add snap-back animation
   - If drop fails (locked conflict), animate task back to original position
   - CSS transition for smooth snap-back

**Deliverable:** Fully functional drag-and-drop with SWAP and PUSH

---

### Phase 6: Lock Feature & Overlap Handling
**Goal:** Implement locking and overlap detection

**Steps:**
1. Add lock icon to TaskBlock
   - Show on hover
   - Click toggles `toggleLock()` from store
   - Persist locked state to localStorage

2. Implement overlap detection
   - After every insert/swap/push, run `detectOverlaps()`
   - Flag overlapping tasks with `isOverlapping: true`

3. Build OverlapIndicator component
   - Small warning icon with tooltip
   - Display on overlapping tasks

4. Add visual state for overlapping tasks
   - Semi-transparent background
   - Light red pulsing animation (CSS keyframes)

5. Test lock scenarios:
   - Swap with locked task (should fail)
   - Push that would move locked task (should snap back)
   - Insert between locked tasks (should allow overlap with warning)

**Deliverable:** Lock feature and overlap warnings working

---

### Phase 7: Dynamic Timeline Expansion
**Goal:** Timeline expands as you drag near edges

**Steps:**
1. Create useTimelineExpansion hook (`src/hooks/useTimelineExpansion.ts`)
   - Monitor drag position
   - When near top edge, expand range upward
   - When near bottom edge, expand range downward
   - Smooth expansion (not instant jumps)

2. Integrate with Timeline component
   - Use useTimelineExpansion during drag
   - Update visible time range dynamically
   - Render new TimeLabel components as range expands

3. Add smooth scrolling
   - Auto-scroll timeline as range expands
   - Keep dragged task visible

4. Test expansion:
   - Drag task toward 7 AM → 6 AM appears
   - Drag task toward 9 PM → 10 PM appears
   - Expansion is smooth and responsive

**Deliverable:** Dynamic timeline that expands infinitely during drag

---

### Phase 8: Visual Polish & UX Refinement
**Goal:** Make the app feel polished and production-ready

**Steps:**
1. Refine task block sizing
   - Ensure height accurately represents duration
   - Minimum height for very short tasks (e.g., 15min = 30px minimum)

2. Improve drag animations
   - Smooth interpolation for preview positions
   - Drag ghost/preview image
   - Drop animation (snap to final position)

3. Add keyboard shortcuts
   - Escape to cancel inline form
   - Enter to submit inline form
   - Tab navigation between inputs

4. Responsive design
   - Test on mobile viewport
   - Ensure touch drag works (Pragmatic DnD handles this)
   - Adjust spacing for smaller screens

5. Accessibility audit
   - Verify keyboard navigation works
   - Test with screen reader
   - Ensure color contrast meets WCAG AA

6. Empty state
   - "No tasks yet. Click [+] to add your first task" when empty

7. Add subtle micro-interactions
   - Hover effects on insertion points
   - Button press animations
   - Task block hover effect (slight elevation)

**Deliverable:** Polished, production-ready MVP

---

### Phase 9: Testing & Bug Fixes
**Goal:** Ensure app is stable and bug-free

**Steps:**
1. Manual testing
   - Create 20+ tasks, verify performance
   - Test all SWAP/PUSH scenarios
   - Test all lock scenarios
   - Test insertion at various positions
   - Test overlap detection

2. Edge case testing
   - Very short tasks (5 minutes)
   - Very long tasks (8+ hours)
   - Many tasks (50+)
   - Rapid insertion/deletion
   - Rapid drag-drop

3. Browser testing
   - Chrome, Firefox, Safari, Edge
   - Mobile browsers (iOS Safari, Chrome Android)

4. Fix identified bugs
   - Track bugs in GitHub Issues or todo list
   - Priority: critical bugs → UX improvements → nice-to-haves

5. Code cleanup
   - Remove console.logs
   - Remove unused imports
   - Add JSDoc comments to complex functions
   - Clean up any commented-out code

**Deliverable:** Stable, tested MVP

---

### Phase 10: Deployment (Optional for MVP)
**Goal:** Deploy web app for easy access

**Steps:**
1. Build production bundle
   ```bash
   npm run build
   ```

2. Test production build locally
   ```bash
   npm run preview
   ```

3. Deploy to hosting platform
   - Recommended: Vercel or Netlify (zero-config for Vite)
   - Connect GitHub repository
   - Auto-deploy on push to main branch

4. Verify deployed app
   - Test all functionality in production
   - Verify localStorage works
   - Check performance (bundle size, load time)

**Deliverable:** Live web app accessible via URL

---

## Future Enhancements (Post-MVP)

1. **Multi-day view**
   - Week view with columns for each day
   - Navigate between dates
   - Drag tasks between days

2. **Task editing**
   - Click task to edit title/duration
   - Inline editing (similar to insertion form)

3. **Task deletion**
   - Delete button on task block (on hover or in menu)
   - Confirmation dialog

4. **Undo/Redo**
   - Track history of SWAP/PUSH operations
   - Cmd+Z / Cmd+Shift+Z shortcuts

5. **Configurable swap threshold**
   - Settings panel to adjust threshold slider
   - Real-time preview of how threshold affects behavior

6. **Task templates**
   - Save frequently used tasks (e.g., "Lunch: 1h")
   - Quick-insert from template

7. **Categories/Tags**
   - Color-code tasks by category
   - Filter timeline by category

8. **Time analytics**
   - Total scheduled time per day
   - Category breakdown
   - Productivity insights

9. **Recurring tasks**
   - Daily, weekly, monthly patterns
   - Auto-generate instances

10. **Cloud sync**
    - Backend API for multi-device sync
    - User authentication

11. **Calendar integrations**
    - Import from Google Calendar
    - Export to iCal format

12. **Keyboard shortcuts**
    - Cmd+N: Add task at end
    - Cmd+K: Quick search/jump to task
    - Arrow keys: Navigate tasks
    - Space: Toggle lock

---

## Development Guidelines

### Code Style
- Use TypeScript strict mode
- Prefer functional components with hooks
- Use named exports (not default exports)
- Keep components under 200 lines (split if larger)
- Keep functions pure where possible (easier to test)

### Git Workflow
- Initialize git repository
- Commit after each phase completion
- Descriptive commit messages (conventional commits format)
- Branch naming: `feature/insertion-points`, `fix/swap-logic`

### Performance Considerations
- Use `useMemo` for expensive calculations (time range, overlaps)
- Use `React.memo` for TaskBlock if rendering 50+ tasks
- Debounce localStorage writes if performance issues arise
- Use `useCallback` for stable function references in drag handlers

### Accessibility
- ARIA labels for all interactive elements
- Keyboard navigation for all operations
- Screen reader announcements for SWAP/PUSH actions
- Focus management (return focus after inline form)
- Color contrast WCAG AA minimum

### Testing Strategy (Post-MVP)
- Unit tests for time calculation functions
- Unit tests for SWAP/PUSH logic
- Integration tests for insertion/drag flows
- E2E tests for critical user journeys

---

## Technical Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-04 | Single-column design over two-panel | Simpler UX, more focused workflow |
| 2026-01-04 | Insertion-based creation over backlog | Eliminates unscheduled state, cleaner mental model |
| 2026-01-04 | SWAP/PUSH distinction over simple reorder | More intelligent and predictable behavior |
| 2026-01-04 | PUSH snaps to task boundaries (no fragmentation) | Keeps timeline clean, easier to adjust tasks |
| 2026-01-04 | Configurable swap threshold | Allows UX tuning based on user feedback |
| 2026-01-04 | Black & white theme with green task blocks | Minimalistic, Notion-inspired, easy to customize |
| 2026-01-04 | No borders on task blocks (spacing only) | Cleaner look, spacing provides visual separation |
| 2026-01-04 | Subtle shadow on hover (not border) | Minimal feedback without visual clutter |
| 2026-01-04 | Lock feature for tasks | Essential for real-world use (fixed meetings, etc.) |
| 2026-01-04 | Overlap warning vs prevention | Allows flexibility while flagging issues |
| 2026-01-04 | 15-minute rounding (up) | Granular enough for most tasks, simplifies grid |
| 2026-01-04 | Dynamic timeline expansion | Infinite scheduling range without clutter |
| 2026-01-04 | Pragmatic DnD over @dnd-kit | Better performance, more control for custom logic |
| 2026-01-04 | MUI over Tailwind | Faster MVP, built-in validation and accessibility |
| 2026-01-04 | Zustand over Redux | Minimal boilerplate for complex state |
| 2026-01-04 | localStorage over IndexedDB | Simpler API, sufficient for MVP scale |

---

## Known Limitations (MVP)

1. **Single-day view:** Only shows one day at a time (no week view)
2. **No task editing:** Can only create and delete (edit comes post-MVP)
3. **No undo/redo:** Accidental operations can't be undone
4. **Overlap allowed:** Overlapping tasks flagged but not prevented
5. **No mobile app:** Web-only for MVP
6. **5MB storage limit:** Browser localStorage cap (unlikely to hit)
7. **No cloud sync:** Data stored locally only
8. **Hardcoded 8 AM start:** First task always starts at 8:00 AM

---

## Success Criteria for MVP

- [ ] User can insert tasks via [+] insertion points
- [ ] Tasks display with auto-calculated times
- [ ] User can drag tasks to reorder
- [ ] SWAP operation works correctly (exchanges two tasks)
- [ ] PUSH operation works correctly (shifts all tasks down)
- [ ] Visual preview during drag exactly matches final result
- [ ] Lock feature prevents tasks from moving
- [ ] Locked task conflicts handled (snap back)
- [ ] Overlapping tasks flagged with visual warning
- [ ] Timeline expands dynamically during drag
- [ ] 15-minute time snapping works
- [ ] Tasks persist across page refreshes (localStorage)
- [ ] UI is clean and minimalistic
- [ ] Works on desktop browsers (Chrome, Firefox, Safari, Edge)
- [ ] Basic touch support for mobile web browsers
- [ ] No critical bugs or crashes

---

**Last Updated:** 2026-01-04 (Complete redesign for single-column insertion-based UX)