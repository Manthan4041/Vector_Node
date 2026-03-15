# VectorShift Pipeline Builder

![VectorShift Preview](./public/app_overview.png)

VectorShift Pipeline Builder is a comprehensive, interactive node-based visual editor designed for constructing and evaluating Directed Acyclic Graphs (DAGs). Build pipelines visually to connect inputs, language models (LLMs), text transformations, filters, APIs, and outputs.

## 🚀 Key Features

### **Phase 1: Core Infrastructure**
- **Toast Notifications:** Animated toast notifications for success, error, info, and warnings.
  <br/>![Save Toast](./public/save_toast.png)
- **Save/Load:** Persist pipelines directly to `localStorage`, preventing data loss on page refresh.
- **Auto-save:** Debounced auto-save triggers on every state change.
- **Export/Import:** Download pipelines as JSON files and import them back at any time.

### **Phase 2: Editor Essentials**
- **Undo/Redo:** 50-entry history stack using Zustand for full state recovery.
- **Keyboard Shortcuts:** Full suite of editor shortcuts (e.g., `Ctrl+S`, `Ctrl+Z`, `Ctrl+Y`, `Ctrl+C/V/D/A`).
- **Context Menu:** Right-click nodes or the canvas for quick contextual actions (Duplicate, Delete, Copy, Paste).
  <br/>![Context Menu](./public/context_menu.png)
- **Copy/Paste:** Seamlessly duplicate node groups with offset positioning.

### **Phase 3: Validation & Feedback**
- **Connection Validation:** Prevents self-connections, duplicate edges, and type mismatches natively.
- **Inline Results Panel:** Beautifully animated statistics panel for Pipeline Submission (Nodes, Edges, DAG validity).
  <br/>![Submit Results](./public/submit_results.png)
- **Orphan Detection:** Identifies and reports disconnected (orphan) nodes during submission.

### **Phase 4: Backend Capabilities**
- **Backend Graph Parsing:** Kahn's Algorithm implementation via FastAPI to validate DAG integrity.
- **Pipeline CRUD API:** Built-in REST API endpoints to Create, Read, Update, and Delete pipelines.
- **Pipeline Versioning:** Auto-incrementing pipeline versions upon update.

## 🛠 Available Nodes
- **Input Node:** Entry point for Text or File inputs.
- **Output Node:** Exit point to output Text or Image formatting.
- **LLM Node:** Language Model configuration with System and Prompt inputs.
- **Text Node:** Auto-resizing text area with dynamic `{{variable}}` handle generation.
- **Transformation Node:** Perform regex operations, string manipulation, or custom scripts.
- **Filter Node:** Filter incoming data based on robust conditions.
- **API Node:** Make external HTTP requests directly from the graph.
- **Merge Node:** Combine multiple inputs logically.
- **Note Node:** Interactive, free-form sticky notes for documentation.

## 💻 Tech Stack
- **Frontend:** React, React Flow, Zustand (State Management), Vanilla CSS
- **Backend:** Python, FastAPI, Uvicorn, Pydantic

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` / `Cmd+S` | Save Pipeline |
| `Ctrl+Z` / `Cmd+Z` | Undo |
| `Ctrl+Y` / `Cmd+Shift+Z` | Redo |
| `Ctrl+C` / `Cmd+C` | Copy Selection |
| `Ctrl+V` / `Cmd+V` | Paste Selection |
| `Ctrl+D` / `Cmd+D` | Duplicate Selection |
| `Ctrl+A` / `Cmd+A` | Select All Nodes |
| `Delete` / `Backspace` | Delete Selection |

## ⚙️ Quick Start

### Prerequisites
- Node.js (v16+)
- Python (3.9+)

### 1. Backend Setup (FastAPI)
Navigate to the backend directory, install the required packages, and run the server.

```bash
cd vector_backend
pip install fastapi uvicorn pydantic
python -m uvicorn main:app --reload --port 8000
```
*The API will be available at `http://127.0.0.1:8000`*
*Swagger UI docs available at `http://127.0.0.1:8000/docs`*

### 2. Frontend Setup (React)
Navigate to the frontend directory, install dependencies, and start the app.

```bash
cd vector
npm install
npm start
```
*The app will automatically open at `http://localhost:3000`*

## 🧑‍💻 Usage
1. Open the app in your browser at `http://localhost:3000`.
2. Drag and drop nodes from the top toolbar onto the canvas.
3. Connect node handles to construct your pipeline.
4. Click **Submit Pipeline** to analyze the graph structure and see if it is a valid DAG.
5. Save, export, or import your creations using the top-bar controls.
