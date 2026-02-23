import Progress from '../models/Progress.js';

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
