import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, ChevronLeft, Loader2, BrainCircuit } from 'lucide-react';
import api from '../services/api';

const AICoachWidget = () => {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                const { data } = await api.get('/progress/insights');
                setInsights(data);
            } catch (error) {
                console.error("Failed to fetch AI insights:", error);
                setInsights(["Keep studying to unlock personalized AI insights!"]);
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, []);

    const nextInsight = () => {
        setCurrentIndex((prev) => (prev + 1) % insights.length);
    };

    const prevInsight = () => {
        setCurrentIndex((prev) => (prev - 1 + insights.length) % insights.length);
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/5 dark:via-purple-500/5 dark:to-pink-500/5 border border-indigo-100 dark:border-indigo-500/20 rounded-3xl p-6 sm:p-8 flex items-center justify-center min-h-[160px]">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-1 shadow-lg shadow-indigo-500/20 group">
            {/* Animated background subtle pulse */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-50 blur-xl group-hover:opacity-70 transition-opacity duration-700" />

            <div className="relative bg-white dark:bg-slate-900 rounded-[22px] p-6 sm:p-8 h-full flex flex-col justify-between z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl">
                            <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                            AI Study Coach
                        </h3>
                    </div>
                    <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                </div>

                <div className="relative flex-1 min-h-[80px] flex items-center">
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={currentIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed font-medium"
                        >
                            "{insights[currentIndex]}"
                        </motion.p>
                    </AnimatePresence>
                </div>

                {insights.length > 1 && (
                    <div className="flex items-center justify-between mt-6 border-t border-slate-100 dark:border-slate-800 pt-4">
                        <div className="flex gap-1">
                            {insights.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex
                                            ? 'w-6 bg-indigo-500'
                                            : 'w-2 bg-slate-200 dark:bg-slate-800'
                                        }`}
                                />
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={prevInsight}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={nextInsight}
                                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AICoachWidget;
