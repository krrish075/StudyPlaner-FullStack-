import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, BrainCircuit, BarChart3, Clock, ArrowRight, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const { loginAsGuest, user } = useAuth();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    const handleGuestLogin = async () => {
        try {
            await loginAsGuest();
            // Router will naturally redirect to /dashboard via App.jsx
        } catch (error) {
            console.error("Guest login failed", error);
        }
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-64px)] overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-400/20 dark:bg-primary-600/10 blur-3xl -z-10" />
            <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-accent-400/20 dark:bg-accent-600/10 blur-3xl -z-10" />

            {/* Hero Section */}
            <div className="flex-1 flex flex-col justify-center items-center text-center px-4 sm:px-6 lg:px-8 pt-20 pb-16">
                <motion.div
                    className="max-w-4xl mx-auto space-y-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-200 mb-6">
                        <Zap size={16} className="text-accent-500" />
                        <span>AI-Powered Study Planning</span>
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                        Study Smarter, Not <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">Longer.</span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="mt-4 max-w-2xl mx-auto text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                        Generate personalized, optimized study timetables based on your upcoming exams, subjects, and available hours in seconds.
                    </motion.p>

                    <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                        {user ? (
                            <Link to="/dashboard" className="px-8 py-4 text-base font-semibold text-white bg-primary-600 hover:bg-primary-500 rounded-2xl shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all flex items-center justify-center gap-2 group">
                                Go to Dashboard
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                            </Link>
                        ) : (
                            <>
                                <Link to="/signup" className="px-8 py-4 text-base font-semibold text-white bg-primary-600 hover:bg-primary-500 rounded-2xl shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 transition-all flex items-center justify-center gap-2 group">
                                    Get Started Free
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                                </Link>
                                <button onClick={handleGuestLogin} className="px-8 py-4 text-base font-semibold text-slate-800 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-all">
                                    Continue as Guest
                                </button>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            </div>

            {/* Features Section */}
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Why SmartPlanner?</h2>
                        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Everything you need to ace your next exam.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.color}`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div >
    );
};

const features = [
    {
        title: "Smart Distribution",
        description: "Our algorithm weights difficult subjects and prioritizes them automatically to ensure you spend time where it matters most.",
        icon: <BrainCircuit size={28} className="text-blue-600 dark:text-blue-400" />,
        color: "bg-blue-50 dark:bg-blue-500/10"
    },
    {
        title: "Dynamic Timetables",
        description: "Generate comprehensive daily schedules that fit your available study hours seamlessly.",
        icon: <Calendar size={28} className="text-purple-600 dark:text-purple-400" />,
        color: "bg-purple-50 dark:bg-purple-500/10"
    },
    {
        title: "Visual Progress Tracking",
        description: "Stay motivated with beautiful charts and analytics showing your daily streaks and subject mastery.",
        icon: <BarChart3 size={28} className="text-emerald-600 dark:text-emerald-400" />,
        color: "bg-emerald-50 dark:bg-emerald-500/10"
    }
];

export default LandingPage;
