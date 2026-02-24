import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    timetable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Timetable',
    },
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    durationMinutes: { type: Number, required: true },
    date: { type: Date, required: true },
    completed: { type: Boolean, default: false },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    difficulty: { type: String, enum: ['Hard', 'Medium', 'Easy'], default: 'Medium' },
    taskType: { type: String, enum: ['Focus', 'Break'], default: 'Focus' }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);
export default Task;
