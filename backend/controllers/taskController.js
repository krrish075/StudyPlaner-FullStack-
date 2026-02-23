import Task from '../models/Task.js';
import Progress from '../models/Progress.js';

// @desc    Get all user tasks (optional filter by date)
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
    const { date } = req.query; // optional date filter (YYYY-MM-DD)

    try {
        let query = { user: req.user._id };

        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            query.date = { $gte: startOfDay, $lte: endOfDay };
        }

        const tasks = await Task.find(query).sort({ date: 1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update task status (complete/incomplete) and update progress
// @route   PUT /api/tasks/:id/status
// @access  Private
export const updateTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const wasCompleted = task.completed;
        task.completed = req.body.completed;
        const updatedTask = await task.save();

        // Update Progress tracking
        if (wasCompleted !== task.completed) {
            const taskDate = new Date(task.date);
            taskDate.setHours(0, 0, 0, 0);

            let progress = await Progress.findOne({ user: req.user._id, date: taskDate });

            if (!progress) {
                progress = new Progress({
                    user: req.user._id,
                    date: taskDate,
                    totalStudyMinutes: 0,
                    tasksCompleted: 0
                });
            }

            const timeDelta = task.completed ? task.durationMinutes : -task.durationMinutes;
            const tasksDelta = task.completed ? 1 : -1;

            progress.totalStudyMinutes = Math.max(0, progress.totalStudyMinutes + timeDelta);
            progress.tasksCompleted = Math.max(0, progress.tasksCompleted + tasksDelta);

            await progress.save();
        }

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
