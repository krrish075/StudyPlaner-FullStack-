import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, Clock, TrendingUp, Calendar as CalendarIcon, Loader2, Plus, BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];

        const [tasksRes, progressRes] = await Promise.all([
          api.get(`/tasks?date=${today}`),
          api.get('/progress')
        ]);

        setTasks(tasksRes.data);
        setProgress(progressRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const toggleTaskStatus = async (taskId, currentStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}/status`, { completed: !currentStatus });
      setTasks(tasks.map(t => t._id === taskId ? res.data : t));

      // Refresh progress after modifying a task
      const progressRes = await api.get('/progress');
      setProgress(progressRes.data);
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center h-[calc(100vh-64px)]">
        <Loader2 className="animate-spin text-primary-500 w-8 h-8" />
      </div>
    );
  }

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const todayProgressObj = progress.length > 0 &&
    new Date(progress[progress.length - 1].date).toDateString() === new Date().toDateString()
    ? progress[progress.length - 1] : null;

  const totalMinutesStudied = todayProgressObj ? todayProgressObj.totalStudyMinutes : 0;
  const hours = Math.floor(totalMinutesStudied / 60);
  const minutes = totalMinutesStudied % 60;

  // Format data for chart
  const chartData = progress.map(p => ({
    name: new Date(p.date).toLocaleDateString('en-US', { weekday: 'short' }),
    hours: Number((p.totalStudyMinutes / 60).toFixed(1))
  }));

  // if not enough days, fill with empty
  while (chartData.length < 7) {
    chartData.unshift({ name: '-', hours: 0 });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Hi, {user.name.split(' ')[0]} 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here is your study overview for today.</p>
        </div>

        <Link
          to="/generator"
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl shadow-sm transition-colors"
        >
          <Plus size={18} />
          New Timetable
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Today's Tasks"
          value={`${completedTasks}/${totalTasks}`}
          subtitle={`${progressPercentage}% completed`}
          icon={<BookOpen className="text-blue-600 dark:text-blue-400" />}
          color="bg-blue-50 dark:bg-blue-500/10"
        />
        <StatCard
          title="Time Studied"
          value={`${hours}h ${minutes}m`}
          subtitle="Today"
          icon={<Clock className="text-purple-600 dark:text-purple-400" />}
          color="bg-purple-50 dark:bg-purple-500/10"
        />
        <StatCard
          title="Current Streak"
          value="3 Days"
          subtitle="Keep going!"
          icon={<TrendingUp className="text-orange-600 dark:text-orange-400" />}
          color="bg-orange-50 dark:bg-orange-500/10"
        />
        <StatCard
          title="Next Exam"
          value="14 Days"
          subtitle="Mathematics"
          icon={<CalendarIcon className="text-emerald-600 dark:text-emerald-400" />}
          color="bg-emerald-50 dark:bg-emerald-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Plan */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 overflow-hidden flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Today's Plan</h2>
              <span className="px-3 py-1 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-medium rounded-lg">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>

            {tasks.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <BookOpen size={48} className="text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No tasks for today</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">Take a break, or generate a new study timetable to get started.</p>
                <Link to="/generator" className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-xl shadow-sm transition-colors">
                  Generate Timetable
                </Link>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {tasks.map((task) => (
                  <motion.div
                    layout
                    key={task._id}
                    className={`group flex items - center justify - between p - 4 rounded - 2xl border ${task.completed ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'} transition - all`}
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleTaskStatus(task._id, task.completed)}
                        className={`shrink - 0 w - 6 h - 6 rounded - full border - 2 flex items - center justify - center transition - colors ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600 text-transparent hover:border-emerald-500 hover:text-emerald-500/30'}`}
                      >
                        <CheckCircle size={14} className="stroke-[3]" />
                      </button>
                      <div>
                        <h4 className={`font - medium ${task.completed ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>{task.subject}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{task.topic} • {task.durationMinutes} mins</p>
                      </div>
                    </div>
                    <div className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {task.priority} Prio
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Weekly Progress Chart */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 h-full flex flex-col">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Study Hours</h2>

            <div className="flex-1 min-h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9', opacity: 0.1 }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar
                    dataKey="hours"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-500/10 rounded-2xl flex items-start gap-3">
              <BrainCircuit className="text-primary-600 dark:text-primary-400 shrink-0" size={20} />
              <p className="text-sm text-primary-900 dark:text-primary-100/80 leading-relaxed">
                You've studied <strong>12% more</strong> this week compared to last week. Keep up the excellent work!
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Helper Component
const StatCard = ({ title, value, subtitle, icon, color }) => (
  <motion.div
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 flex items-start space-x-4 cursor-default"
  >
    <div className={`p - 3 rounded - 2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
    </div>
  </motion.div>
);

export default Dashboard;
