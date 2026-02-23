import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: { type: Date, required: true },
    totalStudyMinutes: { type: Number, default: 0 },
    tasksCompleted: { type: Number, default: 0 }
}, { timestamps: true });

const Progress = mongoose.model('Progress', progressSchema);
export default Progress;
