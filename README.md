# HR Workflow Designer Module

A mini workflow designer for HR admins to model and test processes like onboarding, leave approvals, and document verification.

## Tech Stack

- Next.js (App Router, TypeScript)
- React Flow for visual workflow building
- Tailwind CSS for UI
- Mock API route for automated action definitions

## Features Implemented

### Workflow Canvas

- Node creation from a node library sidebar
- Click-to-add node support
- Edge connections between steps
- Node and edge deletion via Backspace/Delete
- Pan, zoom, mini-map, and controls (React Flow built-ins)
- Basic workflow validation:
  - Exactly one Start node
  - At least one End node
  - Start node cannot have incoming connections
  - End nodes cannot have outgoing connections

### Supported Node Types

- Start Node
- Task Node
- Approval Node
- Automated Step Node
- End Node

### Node Configuration Panel

Selecting a node opens a right-side form panel with type-specific fields:

- **Start**: title + metadata key-value pairs
- **Task**: title (required), description, assignee, due date, custom key-value fields
- **Approval**: title, approver role, auto-approve threshold
- **Automated**: title, action picker from mock API, dynamic action parameters
- **End**: completion message

### Mock API Integration

- `GET /api/automations` returns mock automated actions:
  - `{ "id": "send_email", "label": "Send Email", "params": ["to", "subject"] }`
  - `{ "id": "generate_doc", "label": "Generate Document", "params": ["template", "recipient"] }`
- `POST /api/simulate` accepts serialized workflow JSON and returns step-by-step execution output
- API calls are separated in reusable hooks and an API client module

### Workflow Sandbox

- Serializes full graph payload (nodes + edges)
- Sends payload to `/api/simulate` and renders step-by-step log
- Displays validation warnings for:
  - Missing connections
  - Invalid start/end rules
  - Cycles in the graph

## Project Structure

- `src/app/page.tsx` - app entry, mounts workflow designer
- `src/components/workflow/workflow-designer.tsx` - main state orchestration and canvas
- `src/components/workflow/custom-nodes.tsx` - React Flow custom node rendering
- `src/components/workflow/node-palette.tsx` - node library
- `src/components/workflow/node-inspector.tsx` - node configuration forms
- `src/components/workflow/sandbox-panel.tsx` - test/simulation panel
- `src/lib/workflow.ts` - helper logic (default config, validation, serialization)
- `src/lib/api/workflow-api.ts` - API layer abstraction
- `src/hooks/use-automations.ts` - reusable hook for loading automations
- `src/hooks/use-simulate-workflow.ts` - reusable hook for simulation workflow calls
- `src/types/workflow.ts` - shared workflow and node config types
- `src/app/api/automations/route.ts` - automations API
- `src/app/api/simulate/route.ts` - simulation API

## Assumptions

- No backend persistence (in-memory only)
- No authentication
- Validation is intentionally basic for prototype scope
- Simulation runs as deterministic graph traversal (not full BPM engine semantics)
- UI is optimized for clarity and functionality over pixel-perfect design

## What I would Add with More Time
- Drag and drop nodes
- Undo/Redo options
- Highlighting of active nodes in a path as each step executes

## How to Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.
