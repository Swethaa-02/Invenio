# Invenio: Innovation Discovery Engine

**Invenio** is a premium, production-grade **AI-powered R&D and Venture Acceleration Platform** designed to help software teams, CTOs, startup founders, and investors discover blue-ocean opportunities, model tech stacks, evaluate market viability, and generate investor-ready pitch decks.

---

## 🚀 Key Features

### 1. Innovation Console (Dashboard)
* **Real-Time Portfolio Metrics**: Tracks total concepts, active workspace instances, network connectivity, and R&D velocity.
* **Dynamic Analytics**: Includes interactive charts:
  * **Innovation Velocity (Area Chart)**: Growth of your R&D pipeline.
  * **Submissions by Tag (Bar Chart)**: Sector distribution (AI, Core Platform, Web3, Spatial UI).
  * **Resource Allocation (Donut Chart)**: Visualizes personnel and computing budget distribution.
* **AI SWOT Auditor**: Streams a real-time, terminal-like AI SWOT analysis auditing your entire idea database.

### 2. Innovation Lab (Brainstorm Canvas)
* **Draggable Whiteboard**: An open-canvas visual board powered by Framer Motion.
* **Auto-Sync Positions**: Coordinates are automatically saved back to the database.
* **Double-Click Edit**: Double-click text zones on sticky notes to edit titles and descriptions inline.
* **AI Brainstorm Assistant**: Input a rough idea, and the AI agent automatically synthesizes a fully structured concept card.

### 3. Knowledge Graph Explorer (Tech Map)
* **Floating Physics Network**: Explores relational paths and technological overlaps on a canvas.
* **Zoom & Pan Controls**: Features zoom, drag-to-pan, and click-to-center.
* **Node Dossier Panel**: Inspects individual nodes, confidence ratings, and lists active links.
* **AI Graph Compiler**: Describe a custom system design (e.g. *"micro-frontend Spatial UI console"*), and the AI compiles a new dependency node-link network.

### 4. Project Workspace (Collaborative Spec Editor)
* **Markdown Spec Editor**: Draft full-scale PRDs and technical architecture documents.
* **AI Copilot Sidebar**: Query an AI assistant for code blocks or threat models, and inject them into the editor with one click.

### 5. AI Roadmap Generator (Chronological Gantt-Timeline)
* **6-Phase Chronological Timeline**: Generates product phases (Research, Prototype, MVP, Testing, Deployment, Scaling).
* **Gantt Progression Nodes**: Displays completion percentages, task lists, dependencies, and deliverables.
* **Export tools**: Instantly copy to clipboard or download roadmaps.

### 6. Startup Potential Analyzer (Venture Auditor)
* **Viability Indexes**: Scores your concept across 5 crucial VC metrics: Market Size, Competition Moat, Revenue Potential, Scalability, and Customer Demand.
* **Business Dossier**: Synthesizes custom business models, buyer personas, monetization streams, and Go-To-Market strategies.
* **VC Investment Thesis**: Generates an investment justification report.

### 7. Investor Demo Mode (Presentation Slide Deck)
* **16:9 Pitch Stage**: Steps through an interactive 8-slide presentation deck.
* **Live Charts**: Integrates interactive SVG pie charts (TAM/SAM/SOM), performance speed comparators, and competitive moat grids.
* **Copy & Export Assets**: Copy the generated Executive Summary and Investment Highlights.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js (React 19 / TypeScript), Tailwind CSS, Framer Motion, Lucide Icons.
* **Backend**: FastAPI (Python 3.11), SQLAlchemy 2.0, Alembic, Neo4j, LangChain, LangGraph.
* **AI Engine**: Google Gemini API (using `gemini-1.5-flash`).
* **Database**: SQLite (local fallback) / PostgreSQL (production setup).

---

## 💻 Local Setup Guide

### 1. Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18 or higher)
* [Python](https://www.python.org/) (v3.10 or higher)
* Git (optional)

### 2. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .\.venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations to initialize the SQLite database:
   ```bash
   alembic upgrade head
   ```
5. Start the FastAPI local server:
   ```bash
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
   * *Swagger documentation will be available at: `http://localhost:8000/docs`*

### 3. Frontend Setup
1. Return to the root folder:
   ```bash
   cd ..
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   * *The interface will be live at: `http://localhost:3000`*

### 4. Running with Docker Compose
If you prefer running the entire project inside containers, run the following from the root directory:
```bash
docker-compose up --build
```
* Frontend will bind to: `http://localhost:3000`
* Backend will bind to: `http://localhost:8000`

---

## 🧪 Testing & Verification

We have created built-in verification scripts inside the `backend/` folder to check code integrity and AI simulations.
To run these, activate your virtual environment in `backend/` and run:

```bash
# Check FastAPI routing and import maps
python verify_backend.py

# Verify LangGraph Multi-Agent generator nodes
python verify_generator.py

# Test Feasibility scoring and GTM algorithms
python verify_feasibility.py

# Validate Venture viability metrics
python verify_startup.py

# Check 8-slide presentation deck compilers
python verify_investor_demo.py

# Test TF-IDF vector similarity duplicates math
python verify_novelty.py

# Check BFS graph distances and Collision scores
python verify_collisions.py
```

---

## ☁️ Deployment Instructions

### Deploying Backend to Render (via Docker)
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** -> **Blueprint**.
3. Link your GitHub repository.
4. Render will read the root `render.yaml` file. Add your `GEMINI_API_KEY` under the requested environment variable box.
5. Click **Apply**. Render will build the container and spin up your FastAPI backend.

### Deploying Frontend to Vercel (Next.js)
1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New** -> **Project** and select your repository.
3. Keep the **Framework Preset** as **Next.js** and **Root Directory** as `.` (the default root).
4. Add the following **Environment Variables**:
   * `BACKEND_API_URL`: *(your live Render backend URL, e.g. `https://invenio-backend.onrender.com`)*
   * `GEMINI_API_KEY`: *(your Google Gemini API Key)*
5. Click **Deploy**.
