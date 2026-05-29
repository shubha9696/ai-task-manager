# AI Task Manager — Premium Kanban Task Manager

AI Task Manager is a modern, high-fidelity, full-stack Kanban-based Task Manager application. It provides an intuitive, responsive dashboard with custom authentication, persistent database storage, visual statistics, and an elegant glassmorphism aesthetic supporting both dark and light modes.

### 🌐 Live Production Deployment
- **Frontend App**: [https://ai-task-manager-drab.vercel.app](https://ai-task-manager-drab.vercel.app)
- **GitHub Repository**: [https://github.com/shubha9696/ai-task-manager](https://github.com/shubha9696/ai-task-manager)

---

## 🚀 Key Features

- **Custom Security & Auth**: Full secure user registration and login utilizing **JSON Web Tokens (JWT)** and **Bcrypt.js** password hashing.
- **Kanban Task Board**: A fluid 3-stage board (`Todo`, `In Progress`, `Done`) that organizes tasks dynamically.
- **Accessible Task Progression**: Move tasks across columns using **drag-and-drop** actions or single-click quick arrow indicators.
- **Full CRUD Support**: Add new tasks, update titles/descriptions/priorities/stages in a beautifully animated modal, and delete tasks.
- **Priority Categorization**: Color-coded badges for `Low`, `Medium`, and `High` priorities.
- **Dynamic Analytics**: Header progress bar demonstrating project completion percentage and count-specific tracking cards.
- **Seamless Filtering**: Fast, responsive instant search and priority level filtering.
- **Rich Aesthetics**: High-end glassmorphism design with deep radial gradients, glow effects, micro-interactions, responsive flex layout, and seamless **Dark/Light Mode Theme Toggle**.
- **Robust Performance**: Handled loading states, skeleton screen panels, optimistic UI status transitions, and dynamic auto-dismiss toasts.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**:
  - **Core**: React 19, Vite (Scaffolded React JavaScript template)
  - **Styling**: Tailored, responsive Vanilla CSS variables & layout grids
  - **Icons**: Lucide React
- **Backend**:
  - **Server**: Node.js, Express.js
  - **Database**: SQLite3 (Local serverless database)
  - **Authentication**: JWT (jsonwebtoken) & Bcrypt.js password hashing

---

## 📖 Assumptions, Tradeoffs, & Technical Decisions

### 1. Database Decision: SQLite3 over Cloud Databases
- **Decision**: Used SQLite3 for local persistence.
- **Rationale**: SQLite is highly portable, self-contained, and requires zero installation overhead (no docker containers, no local service credentials, no remote cloud database connectivity errors). This ensures the app compiles and executes out-of-the-box on the evaluator's local machine instantly.
- **Tradeoff**: SQLite runs in-process and writes to a local file (`backend/data/database.sqlite`). For large scale cloud-native applications, a client-server database like PostgreSQL would be preferred, but SQLite is perfect for the assignment's scope.

### 2. Password Hashing: Bcrypt.js over Bcrypt
- **Decision**: Utilized the pure-Javascript `bcryptjs` package rather than the native C++ `bcrypt` package.
- **Rationale**: The native `bcrypt` library has a compilation step during `npm install` that relies on native node-gyp build tools (Python, C++ compiler). On Windows environments, this compilation frequently fails. By utilizing `bcryptjs`, we guarantee 100% platform-agnostic installation reliability.

### 3. User Experience: Optimistic UI Updates
- **Decision**: Implemented Optimistic UI updates when transferring tasks between Kanban stages.
- **Rationale**: When a user drags a task card or clicks a status change button, the card immediately updates in the React state. The user experiences zero visual latency. The API call is processed in the background.
- **Robustness**: If the server-side update fails (e.g. network disconnect), the application automatically rolls back the task to its original column and alerts the user via a toast notification.

### 4. Interactive Actions: Drag & Drop + Shifting Arrows
- **Decision**: Implemented native HTML5 drag-and-drop combined with direct button action arrows.
- **Rationale**: Drag and drop is the standard desktop design pattern for Kanban boards. However, drag-and-drop does not work well on touch interfaces (mobiles/tablets) and lacks screen-reader accessibility. Adding quick left/right arrow buttons in the card footers ensures full mobile accessibility and device compatibility.

---

## 💻 Running the Project Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 1. Start the Backend Server
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm start
   ```
   *The backend will boot up on [http://localhost:5000](http://localhost:5000). It will automatically create the SQLite database file and initialize schemas.*

### 2. Start the Frontend Dev Server
1. Open a new terminal window and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Boot up the Vite dev server:
   ```bash
   npm run dev
   ```
   *The client application will open at [http://localhost:5173](http://localhost:5173).*

---

## 🧪 Running Automated API Verification Suite
A fully programmatic test suite is provided to verify backend API endpoint integrity (Authentication routes + Task CRUD endpoints). 
To run this test:
1. Ensure the Express server is running on port 5000.
2. Under the root workspace, execute:
   ```bash
   # From root workspace directory
   node backend/db.js  # Make sure DB helper resolves
   ```
   *Alternatively, the verification script can be found inside the agent scratch space. Tests cover: registering new users, secure login, creating tasks, listing all tasks, shifting task stages, and deleting tasks.*

---

## 📁 Repository Structure
```
├── backend/
│   ├── data/
│   │   └── database.sqlite      # SQLite database file (auto-generated)
│   ├── middleware/
│   │   └── auth.js              # Token validation middleware
│   ├── routes/
│   │   ├── auth.js              # Register & Login endpoints
│   │   └── tasks.js             # Task CRUD endpoints
│   ├── db.js                    # Database setup & Promise queries helpers
│   ├── server.js                # Express app configuration & bootstrap
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Auth.jsx         # Card layout for sign in & registration
    │   │   ├── Board.jsx        # Column grids, searches & filters
    │   │   ├── Column.jsx       # Kanban Stage container (drag-over events)
    │   │   ├── TaskCard.jsx     # Individual task, status controls, drag hooks
    │   │   ├── TaskModal.jsx    # Pop-up details editing form
    │   │   ├── Stats.jsx        # Dashboard progress overview
    │   │   └── Toast.jsx        # Dynamic toast alert panels
    │   ├── context/
    │   │   └── AppContext.jsx   # Auth operations, API requests & global state
    │   ├── styles/
    │   │   ├── App.css          # Theme variables, layouts, skeleton shimmers
    │   │   └── components.css   # Auth cards, grids, buttons, toast transitions
    │   ├── App.jsx              # Main routing shell & light/dark modes toggler
    │   └── main.jsx
    ├── index.html
    └── package.json

---

## 🌐 Deploving to the Cloud (Submission Ready)

This monorepo is fully structured to deploy easily on free tiers of popular cloud services.

### 1. Backend Deployment (e.g., Render)
1. Sign up on [Render](https://render.com/).
2. Create a new **Web Service** and connect your GitHub repository.
3. Configure the settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Under **Environment Variables**, add:
   - `JWT_SECRET`: `your_custom_secure_key_here`
5. Click **Deploy Web Service**. Render will host the Express API and auto-generate a persistent SQLite database in the service folder.

### 2. Frontend Deployment (e.g., Vercel)
1. Sign up on [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project** and select your GitHub repository.
3. Configure the deployment settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite` (automatically detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   - Update `frontend/src/config.js` to read from environment variables if desired, or simply edit `frontend/src/config.js` and change the `API_URL` to point to your newly deployed Render URL (e.g., `https://ai-task-manager-backend.onrender.com/api`).
5. Click **Deploy**. Vercel will build your assets and host your client application on a secure public domain.
