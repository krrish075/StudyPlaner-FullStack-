import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, RefreshCcw, CheckCircle } from 'lucide-react';
import FocusMode from './FocusMode';

const PomodoroTimer = ({ task, onComplete, onCancel }) => {
    // initial time in seconds
    const [timeLeft, setTimeLeft] = useState(task.durationMinutes * 60);
    const [isActive, setIsActive] = useState(false);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        let interval = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => {
                    const newTime = time - 1;
                    const totalSeconds = task.durationMinutes * 60;
                    setProgress((newTime / totalSeconds) * 100);
                    return newTime;
                });
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            onComplete(task._id);
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, task, onComplete]);

    const toggleTimer = () => setIsActive(!isActive);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const isBreak = task.taskType === 'Break';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-6 rounded-3xl border shadow-lg ${isBreak
                ? 'bg-emerald-500 text-white border-emerald-600'
                : 'bg-slate-900 dark:bg-black text-white border-slate-800'
                }`}
        >
            <div className="flex justify-between items-start mb-6">
                <div>
                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${isBreak ? 'bg-emerald-600/50' : 'bg-primary-500/20 text-primary-400'
                        }`}>
                        {isBreak ? 'Rest Cycle' : 'Focus Session'}
                    </span>
                    <h3 className="text-xl font-bold mt-2">{task.subject}</h3>
                    <p className="text-sm opacity-80">{task.topic}</p>
                </div>
                <button
                    onClick={onCancel}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <Square size={20} />
                </button>
            </div>

            {!isBreak && (
                <div className="mb-6">
                    <FocusMode isActive={isActive} />
                </div>
            )}

            <div className="flex flex-col items-center justify-center my-8">
                <div className="relative w-48 h-48 flex items-center justify-center">
                    {/* SVG Progress Circle */}
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            className="opacity-20"
                        />
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={2 * Math.PI * 88}
                            strokeDashoffset={2 * Math.PI * 88 * ((100 - progress) / 100)}
                            className="transition-all duration-1000 ease-linear"
                        />
                    </svg>
                    <span className="text-5xl font-mono font-bold tracking-tight">
                        {formatTime(timeLeft)}
                    </span>
                </div>
            </div>

            <div className="flex justify-center gap-4">
                <button
                    onClick={toggleTimer}
                    className={`px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 transition-transform active:scale-95 ${isBreak ? 'bg-white text-emerald-600 hover:bg-emerald-50' : 'bg-primary-500 hover:bg-primary-400 text-white'
                        }`}
                >
                    {isActive ? (
                        <>
                            <Pause size={24} fill="currentColor" /> Pause
                        </>
                    ) : (
                        <>
                            <Play size={24} fill="currentColor" /> {timeLeft < task.durationMinutes * 60 ? 'Resume' : 'Start'}
                        </>
                    )}
                </button>

                {timeLeft === 0 && (
                    <button
                        onClick={() => onComplete(task._id)}
                        className="px-6 py-4 rounded-full font-bold flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white transition-transform active:scale-95"
                    >
                        <CheckCircle size={24} /> Finish
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export default PomodoroTimer;
