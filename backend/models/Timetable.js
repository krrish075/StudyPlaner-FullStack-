import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: { type: String, required: true },
    daysOfWeek: [{ type: String }],
    dailyStudyHours: { type: Number, required: true },
    examDate: { type: Date },
    isActive: { type: Boolean, default: true },
    studyStyle: { type: String, enum: ['Pomodoro', 'Deep Work'], default: 'Pomodoro' },
    pomodoroSettings: {
        focusTime: { type: Number, default: 25 },
        breakTime: { type: Number, default: 5 }
    },
}, { timestamps: true });

const Timetable = mongoose.model('Timetable', timetableSchema);
export default Timetable;
