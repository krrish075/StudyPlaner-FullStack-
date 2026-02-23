import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import progressRoutes from './routes/progressRoutes.js';

dotenv.config();

// Connect Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/timetables', timetableRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/progress', progressRoutes);

// Base route
app.get('/', (req, res) => {
    res.send('Smart Study Planner API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
