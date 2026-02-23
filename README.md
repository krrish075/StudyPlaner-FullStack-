# Smart Timetable & Study Planner Generator

A modern, minimal, AI-assisted study planner aiming to help students optimize their daily schedules intelligently.

Features a beautiful, responsive UI built with React + Tailwind CSS and a robust backend built with Node.js + Express.

## Tech Stack
* **Frontend:** React, Vite, Tailwind CSS (v4), Framer Motion, Recharts, Lucide React
* **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT Auth

## Project Structure
The repository is split into two directories:
* \`frontend/\` - React front-end application
* \`backend/\` - Express back-end application

## Prerequisites
* Node.js (v18+ recommended)
* MongoDB (Local instance or Atlas URI)

## Setup & Installation

### 1. Database & Backend Environment
1. Navigate to the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Create a \`.env\` file in the \`backend\` directory with the following variables:
   \`\`\`env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/smart-study-planner
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   \`\`\`
   *(Note: Ensure your MongoDB server is running if using a local DB.)*

### 2. Frontend Environment
1. Navigate to the frontend directory:
   \`\`\`bash
   cd frontend
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

## Running the Application Locally

You will need two terminal windows to run the frontend and backend concurrently.

**Terminal 1 (Backend):**
\`\`\`bash
cd backend
npm start
# OR for development with auto-restart
npx nodemon index.js
\`\`\`

**Terminal 2 (Frontend):**
\`\`\`bash
cd frontend
npm run dev
\`\`\`

The frontend config automatically proxies API requests matching \`/api/*\` to \`http://localhost:5000\`.
Open your browser and navigate to the address shown by Vite (usually \`http://localhost:5173\`).

## Key Features Implemented
* JWT Authentication System & Guest Sessions
* Dynamic Smart Scheduling Algorithm
* Daily Task Planner with Progress Tracking
* Analytics Dashboard Visualization
* Framer Motion Animations
* Dark/Light Mode Theme Toggle

*Developed by Antigravity AI*
