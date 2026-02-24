import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Trash2, CheckCircle, Circle, ChevronLeft, ChevronRight, Loader2, BookOpen, Play } from 'lucide-react';
import api from '../services/api';
import PomodoroTimer from '../components/PomodoroTimer';

const Planner = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTask, setActiveTask] = useState(null);

  const fetchTasksForDate = async (date) => {
    setLoading(true);
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const res = await api.get(`/tasks?date=${formattedDate}`);
      setTasks(res.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksForDate(currentDate);
  }, [currentDate]);

  const changeDate = (days) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const setToday = () => {
    setCurrentDate(new Date());
  };

  const toggleTaskStatus = async (taskId, currentStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}/status`, { completed: !currentStatus });
      setTasks(tasks.map(t => t._id === taskId ? res.data : t));
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleTaskComplete = async (taskId) => {
    await toggleTaskStatus(taskId, false); // Mark true
    setActiveTask(null);
  };

  const isToday = new Date().toDateString() === currentDate.toDateString();
  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Study Planner</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your daily study targets.</p>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="flex flex-col items-center min-w-[140px]">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
            </span>
          </div>

          <button
            onClick={() => changeDate(1)}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <ChevronRight size={20} />
          </button>

          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1"></div>

          <button
            onClick={setToday}
            disabled={isToday}
            className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${isToday ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed' : 'text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10'}`}
          >
            Today
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Daily Progress</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">{progress}% ({completedCount}/{tasks.length})</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-gradient-to-r from-primary-500 to-accent-500 h-3 rounded-full"
          />
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="animate-spin text-primary-500 w-8 h-8" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
            <CalendarIcon size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No tasks scheduled</h3>
            <p className="text-slate-500 dark:text-slate-400">Enjoy your free time or schedule a new plan.</p>
          </div>
        ) : (
          <AnimatePresence>
            {tasks.map((task, index) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-5 rounded-2xl border ${task.completed
                  ? 'bg-slate-50/80 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800'
                  : task.taskType === 'Break'
                    ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700'
                  } transition-all`}
              >
                <button
                  onClick={() => toggleTaskStatus(task._id, task.completed)}
                  className={`shrink-0 relative group flex items-center justify-center w-8 h-8 rounded-full transition-colors ${task.completed ? 'text-emerald-500 bg-emerald-50 max-dark:bg-emerald-500/10' : 'text-slate-300 dark:text-slate-600 hover:text-emerald-500'}`}
                >
                  {task.completed ? (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckCircle size={28} className="fill-emerald-100 dark:fill-emerald-900/50" /></motion.div>
                  ) : (
                    <Circle size={28} strokeWidth={2} />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-lg font-bold truncate ${task.completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>
                      {task.subject}
                    </h3>

                    {task.taskType === 'Break' ? (
                      <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                        Rest Block
                      </span>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${task.priority === 'High' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' :
                        task.priority === 'Medium' ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400' :
                          'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                        }`}>
                        {task.priority} Prio
                      </span>
                    )}
                  </div>
                  <p className={`text-sm truncate ${task.completed ? 'text-slate-400 dark:text-slate-600' : 'text-slate-600 dark:text-slate-300'}`}>
                    {task.topic}
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <Clock size={16} className="text-primary-500" />
                    {task.durationMinutes} min
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <BookOpen size={16} className="text-accent-500" />
                    {task.difficulty}
                  </div>

                  {!task.completed && (
                    <button
                      onClick={() => setActiveTask(task)}
                      className="flex items-center gap-1 text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 px-4 py-1.5 rounded-lg shadow-sm transition-transform active:scale-95 ml-2"
                    >
                      <Play size={14} fill="currentColor" /> Start
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {activeTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            <PomodoroTimer
              task={activeTask}
              onComplete={handleTaskComplete}
              onCancel={() => setActiveTask(null)}
            />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Planner;
