# CodeMind AI - Project Roadmap

## Phase 1: Landing Dashboard (Current Focus)
**Goal**: Build the core UI shell, navigation, and static/mocked views for all major dashboards.
- Project Initialization (Next.js, Tailwind, shadcn/ui)
- Core Layout (Sidebar, Topbar, Main Content Area)
- Dashboard Home (Quick Stats, Action Buttons)
- Overview Page (File statistics, Folder tree UI)
- Placeholder Views for:
  - Component Tree
  - Dependency Graph
  - API Flow
  - Routing
  - Refactor Suggestions
  - Documentation
- File Preview Panel (UI only)

## Phase 2: Landing Page & Authentication (Current Focus)
**Goal**: Create the entry point with uploads and secure access.
- **Landing Page**: Modern UI with "Hero" section.
- **Input Methods**:
  - Drag & Drop Zone (Zip/Files)
  - GitHub URL Input
  - Paste Code Snippet
- **Authentication**:
  - Firebase Integration
  - GitHub & Google Sign-in
- **Theming**: Dark/Light mode toggle (default Light).
- **Navigation**: Redirect to Dashboard after analysis/login.

## Phase 3: Analysis Engine Integration
**Goal**: Connect the dashboard to a real analysis backend (or local processing).
- File System Access (Upload Zip or Local Path)
- AST Parsing (Babel/SWC/TypeScript Compiler API)
- Metadata Extraction (Components, Imports, Exports)
- State Management for Analysis Data (Zustand)
- Real-time Analysis Progress UI

## Phase 3: Detailed Visualization Views
**Goal**: Make the graph and tree views interactive and real.
- Interactive Component Tree (Collapsible, Linked to Code)
- Force-Directed Dependency Graph (D3.js or React Flow)
- Routing Tree Visualization
- API Flow Diagrams

## Phase 4: Refactoring & Documentation Engine
**Goal**: Implement the "AI" features for suggestions and docs.
- AI Integration (OpenAI/Gemini API) for Refactoring Suggestions
- Diff Viewer Implementation
- Documentation Generator (Markdown export)
- Architecture Report Generation

## Phase 5: Chat & Advanced Features
**Goal**: Add the conversational interface and polish.
- Context-Aware Chat Panel
- Deep Search capabilities
- Settings & Configuration
- Dark/Light Mode Polish
- Mobile Responsiveness Refinement
