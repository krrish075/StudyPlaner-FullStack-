import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Award, Target, Zap, Clock, Loader2 } from 'lucide-react';
import api from '../services/api';

const Analytics = () => {
    const [progressData, setProgressData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/progress');
                setProgressData(res.data);
            } catch (error) {
                console.error('Failed to fetch analytics', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex justify-center items-center h-[calc(100vh-64px)]">
                <Loader2 className="animate-spin text-primary-500 w-8 h-8" />
            </div>
        );
    }

    // Format Chart Data
    const weeklyHoursData = progressData.map(p => ({
        name: new Date(p.date).toLocaleDateString('en-US', { weekday: 'short' }),
        hours: Number((p.totalStudyMinutes / 60).toFixed(1)),
        tasks: p.tasksCompleted
    }));

    // Ensure we have 7 days for the chart
    while (weeklyHoursData.length < 7) {
        weeklyHoursData.unshift({ name: '-', hours: 0, tasks: 0 });
    }

    // Summary Stats
    const totalMinutes = progressData.reduce((acc, curr) => acc + curr.totalStudyMinutes, 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalTasks = progressData.reduce((acc, curr) => acc + curr.tasksCompleted, 0);

    // Mock distribution data since our simple backend doesn't aggregate by subject easily
    const subjectDistribution = [
        { name: 'Mathematics', value: 45 },
        { name: 'Physics', value: 25 },
        { name: 'Computer Science', value: 20 },
        { name: 'Literature', value: 10 },
    ];
    const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Track your productivity and study trends.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatWidget icon={<Clock className="text-blue-500" />} title="Total Study Time" value={`${totalHours}h ${totalMinutes % 60}m`} label="Past 7 days" bg="bg-blue-50 dark:bg-blue-500/10" />
                <StatWidget icon={<Target className="text-emerald-500" />} title="Tasks Finished" value={totalTasks} label="Past 7 days" bg="bg-emerald-50 dark:bg-emerald-500/10" />
                <StatWidget icon={<Zap className="text-amber-500" />} title="Current Streak" value="3 Days" label="Personal best: 14" bg="bg-amber-50 dark:bg-amber-500/10" />
                <StatWidget icon={<Award className="text-purple-500" />} title="Productivity Score" value="A-" label="Top 15% of users" bg="bg-purple-50 dark:bg-purple-500/10" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Hours Trend Line Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Study Hours Trend</h2>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={weeklyHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--tw-bg-opacity, white)' }}
                                />
                                <Area type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Task Completion Bar Chart */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Tasks Completed</h2>
                    <div className="h-40 w-full mb-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyHoursData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={5} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <RechartsTooltip cursor={{ fill: '#f1f5f9', opacity: 0.1 }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="tasks" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Subject Focus</h2>
                        <div className="h-40 w-full flex items-center justify-center relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={subjectDistribution}
                                        innerRadius={45}
                                        outerRadius={70}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {subjectDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3 mt-2">
                            {subjectDistribution.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-1.5 cursor-help" title={entry.name}>
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{entry.name.substring(0, 10)}{entry.name.length > 10 ? '...' : ''}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatWidget = ({ icon, title, value, label, bg }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 flex flex-col items-center text-center relative overflow-hidden group"
    >
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-50 transition-transform group-hover:scale-110 ${bg}`} />
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 z-10 ${bg}`}>
            {icon}
        </div>
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white z-10 mb-1">{value}</h3>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 z-10">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 z-10">{label}</p>
    </motion.div >
);

export default Analytics;
