import Progress from '../models/Progress.js';
import Task from '../models/Task.js';

// @desc    Get user progress summary
// @route   GET /api/progress
// @access  Private
export const getProgress = async (req, res) => {
    try {
        // Get progress from last 7 days for charts
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const progressLogs = await Progress.find({
            user: req.user._id,
            date: { $gte: sevenDaysAgo }
        }).sort({ date: 1 });

        res.json(progressLogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get AI adaptive study insights based on habits
// @route   GET /api/progress/insights
// @access  Private
export const getInsights = async (req, res) => {
    try {
        const insights = [];

        // Analyze last 7 days of tasks
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const tasks = await Task.find({
            user: req.user._id,
            date: { $gte: sevenDaysAgo }
        });

        if (tasks.length === 0) {
            return res.json(["Start completing some tasks to receive personalized AI Study Insights!"]);
        }

        const completedTasks = tasks.filter(t => t.completed);
        const completionRate = completedTasks.length / tasks.length;

        // 1. General Completion Heuristic
        if (completionRate < 0.3) {
            insights.push("Your completion rate this week is quite low. Try generating a new schedule with fewer Daily Study Hours to prevent burnout.");
        } else if (completionRate > 0.8) {
            insights.push("Incredible work! You are crushing your schedule consistently. Keep up the high focus, but don't forget to take your breaks.");
        }

        // 2. Priority/Difficulty Heuristics
        const missedTasks = tasks.filter(t => !t.completed);
        const hardMissed = missedTasks.filter(t => t.difficulty === 'Hard').length;
        const totalHard = tasks.filter(t => t.difficulty === 'Hard').length;

        if (totalHard > 0 && (hardMissed / totalHard) > 0.5) {
            insights.push("You seem to be skipping your 'Hard' difficulty tasks. Try tackling these first thing in the morning when your energy is highest, using a shorter Pomodoro interval.");
        }

        const easyMissed = missedTasks.filter(t => t.difficulty === 'Easy' && t.taskType !== 'Break').length;
        if (easyMissed > 3) {
            insights.push("You are missing 'Easy' tasks. Make sure you aren't procrastinating on minor assignments that can pile up quickly.");
        }

        // 3. Break Skipping Heuristic
        const breakTasks = tasks.filter(t => t.taskType === 'Break');
        const missedBreaks = breakTasks.filter(t => !t.completed).length;
        if (breakTasks.length > 0 && (missedBreaks / breakTasks.length) > 0.7) {
            insights.push("You are constantly skipping your Rest Blocks. Skipping breaks destroys long-term retention. Use the Pomodoro Timer and step away from the desk when instructed.");
        }

        // 4. Default Motivation (If no major issues)
        if (insights.length === 0) {
            insights.push("You are maintaining a balanced study routine. Ensure you are drinking enough water and getting 8 hours of sleep.");
        }

        // We only want to surface the top 3 most relevant insights
        res.json(insights.slice(0, 3));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
