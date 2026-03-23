# tasks Chart Manager

A Monday.com-style tasks Chart application focused on software development project management. Built with React, TypeScript, and Tailwind CSS.

## Features

### Project Management
- Create, rename, and delete multiple projects
- Dark sidebar with project navigation
- Auto-save all changes to localStorage

### Task Organization
- **Groups (Epics)**: Organize tasks into collapsible groups
- **Tasks**: Complete task management with:
  - Title and assignee
  - Status: Backlog, In Progress, In Review, Done, Blocked
  - Priority: Critical, High, Medium, Low (with colored indicators)
  - Start and end dates
  - Estimated story points

### tasks Timeline
- Visual timeline with task bars
- Week/Month zoom controls
- Today marker (red vertical line)
- **Drag & Drop**: Move task bars to change dates
- **Resize**: Drag bar edges to adjust start/end dates
- **Dependencies**: Connect tasks with finish-to-start relationships
  - Click a task bar's right edge to start connecting
  - Click another task's bar to complete the connection
  - Dependencies shown as curved arrows

### List View
- Flat list/board view alternative to tasks
- Inline editing for all fields
- Status and priority dropdowns
- Date pickers

### Keyboard Shortcuts
- `N` - Create new task
- `G` - Create new group
- `Del` - Delete selected task
- `Esc` - Cancel connection mode or deselect task

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Data Storage**: localStorage (no backend required)
- **Container**: Docker + docker-compose

## Getting Started

### Prerequisites
- Docker and docker-compose installed on your system

### Installation & Running

1. Clone the repository:
```bash
git clone <repository-url>
cd tasks-chart-app
```

2. Build and run with Docker:
```bash
docker-compose up --build
```

3. Open your browser and navigate to:
```
http://localhost:3000
```

The app will start with sample data including one project "My App v1.0" with three groups (Frontend, Backend, DevOps) and sample development tasks.

### Development Mode (without Docker)

If you prefer to run locally for development:

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── Sidebar.tsx           # Project navigation sidebar
│   ├── ListView.tsx           # List/board view with inline editing
│   ├── tasksView.tsx          # tasks timeline with drag & drop
│   ├── StatusBadge.tsx        # Status indicator component
│   └── PriorityIndicator.tsx  # Priority dot indicator
├── hooks/
│   └── useProjects.ts         # Main data management hook
├── types/
│   └── index.ts               # TypeScript type definitions
├── utils/
│   ├── dateHelpers.ts         # Date manipulation utilities
│   └── storageHelpers.ts      # localStorage operations & seed data
├── App.tsx                    # Main application component
└── main.tsx                   # Application entry point
```

## Usage Guide

### Creating Projects
1. Click the `+` button in the sidebar next to "Projects"
2. Enter a project name
3. The project will be added to your sidebar

### Managing Groups and Tasks
1. Select a project from the sidebar
2. Click "Add Group" to create a new epic/group
3. Click "Add Task" within a group to create tasks
4. Use keyboard shortcuts `G` and `N` for quick creation

### tasks View Features
- **Move Task**: Click and drag a task bar horizontally
- **Resize Task**: Drag the left or right edge of a task bar
- **Create Dependency**: Click the right edge of a task bar, then click another task
- **Zoom**: Use the zoom controls to switch between week and month views
- **Today Marker**: The red vertical line shows the current date

### List View Features
- Click any field to edit inline
- Use dropdowns for status and priority
- Date pickers for start/end dates
- Click the delete icon to remove tasks or groups

## Data Persistence

All data is automatically saved to localStorage after every change. Your data persists across browser sessions and page refreshes. To reset the application:

1. Open browser developer tools
2. Go to Application/Storage > Local Storage
3. Clear all items starting with `tasks_`
4. Refresh the page to reload with sample data

## Docker Commands

Start the application:
```bash
docker-compose up
```

Start in detached mode:
```bash
docker-compose up -d
```

Stop the application:
```bash
docker-compose down
```

Rebuild after code changes:
```bash
docker-compose up --build
```

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT
