# Smart Timetable & Study Planner Generator

A modern, full-stack productivity web application designed to help students optimize their study habits. Built with the MERN stack (MongoDB, Express, React, Node.js), this application features AI-driven smart scheduling, an integrated Pomodoro timer with local camera-based focus tracking, and an adaptive learning coach.

## Features

*   **Smart Timetable Generator**: Input your subjects and available hours, and the backend algorithm will intelligently distribute tasks across your week based on priority and difficulty.
*   **Pomodoro Timer & Sprint Chunking**: Choose between Deep Work or Pomodoro styles. The scheduler automatically chunks large subjects into focus and break intervals.
*   **Camera-Based Focus Mode**: Uses local TensorFlow.js (`blazeface`) embedded in the browser to detect if you leave the camera frame during a focus session, triggering accountability alerts. (100% private, no video data is sent to the server).
*   **Adaptive AI Study Coach**: A backend heuristic engine analyzes your completion rates and study habits over a rolling 7-day period to provide personalized, actionable tips on your dashboard.
*   **Dark Mode**: Sleek light and dark themes using Tailwind CSS v4.
*   **Analytics Dashboard**: Visualizes your daily study hours using `recharts` and summarizes your streaks.
*   **Secure Authentication**: JWT-based login with an option to explore the app via temporary Guest sessions.

## Tech Stack

*   **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Recharts, TensorFlow.js (Blazeface), React Webcam, Lucide React
*   **Backend**: Node.js, Express, MongoDB, Mongoose, JSON Web Tokens (JWT), bcryptjs

## Prerequisites

*   Node.js (v18+ recommended)
*   MongoDB (A local instance or a MongoDB Atlas URI)

## Installation & Setup

1.  **Clone the repository** (or download the source).

    ```bash
    git clone <repository-url>
    cd smart-study-planner
    ```

2.  **Environment Variables**

    You need to set up environment variables for the backend. Copy the example file and update it with your own credentials.

    ```bash
    cd backend
    cp .env.example .env
    ```

    *Open `.env` and configure your `MONGO_URI` and `JWT_SECRET`.*

3.  **Install Dependencies**

    Open two terminals to install dependencies for both the frontend and backend.

    ```bash
    # Terminal 1: Backend
    cd backend
    npm install

    # Terminal 2: Frontend
    cd frontend
    npm install
    ```

4.  **Run the Development Servers**

    ```bash
    # Terminal 1: Backend
    cd backend
    node index.js
    # The backend will start on http://localhost:5000

    # Terminal 2: Frontend
    cd frontend
    npm run dev
    # The frontend will start on http://localhost:5173
    ```

## Usage

1.  Navigate to `http://localhost:5173`.
2.  Sign up for a new account or "Continue as Guest".
3.  Click "New Timetable" to generate your first smart schedule. Be sure to select the "Pomodoro" study style to see the chunking algorithm in action.
4.  Navigate to the **Planner** tab and click **Start** on a Focus task to test the Camera-Based Focus Mode.

## License

MIT License
