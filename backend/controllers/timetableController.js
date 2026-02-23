import Timetable from '../models/Timetable.js';
import Task from '../models/Task.js';

// @desc    Create a new timetable and generate tasks
// @route   POST /api/timetables
// @access  Private
export const createTimetable = async (req, res) => {
    const { title, daysOfWeek, dailyStudyHours, examDate, subjects } = req.body;
    // subjects: [{ name: 'Math', topics: [{ name: 'Algebra', difficulty: 'Hard', priority: 'High' }] }]

    try {
        // 1. Create Timetable
        const timetable = await Timetable.create({
            user: req.user._id,
            title,
            daysOfWeek: daysOfWeek || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            dailyStudyHours,
            examDate
        });

        // 2. Smart Scheduling Logic
        const tasksToCreate = [];
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        // Calculate normalized weights
        const getWeight = (diff, prio) => {
            const d = diff === 'Hard' ? 3 : diff === 'Medium' ? 2 : 1;
            const p = prio === 'High' ? 3 : prio === 'Medium' ? 2 : 1;
            return d * p;
        };

        let allTopics = [];
        subjects.forEach(subject => {
            subject.topics.forEach(topic => {
                allTopics.push({
                    subject: subject.name,
                    topic: topic.name,
                    difficulty: topic.difficulty,
                    priority: topic.priority,
                    weight: getWeight(topic.difficulty, topic.priority)
                });
            });
        });

        // Sort by priority/difficulty weight descending
        allTopics.sort((a, b) => b.weight - a.weight);

        // Distribute topics into days avoiding exceeding dailyStudyHours
        let dailyMinutesAvailable = dailyStudyHours * 60;

        // Very simplified scheduling: Allocate standard chunks per weight
        const CHUNK_MINUTES = 30;

        // We will iterate and assign tasks to days based on daysOfWeek
        const validDays = timetable.daysOfWeek.map(d => d.toLowerCase());

        let simDate = new Date(currentDate);

        allTopics.forEach(topic => {
            // Find next valid day
            while (!validDays.includes(simDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase())) {
                simDate.setDate(simDate.getDate() + 1);
                dailyMinutesAvailable = dailyStudyHours * 60;
            }

            const durationMinutes = topic.weight * CHUNK_MINUTES;

            if (dailyMinutesAvailable < durationMinutes && dailyMinutesAvailable > 0) {
                // Just fit it if it's the only logic or move to next day
                simDate.setDate(simDate.getDate() + 1);
                dailyMinutesAvailable = dailyStudyHours * 60;
                // make sure it's a valid day again
                while (!validDays.includes(simDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase())) {
                    simDate.setDate(simDate.getDate() + 1);
                }
            }

            tasksToCreate.push({
                user: req.user._id,
                timetable: timetable._id,
                subject: topic.subject,
                topic: topic.topic,
                durationMinutes,
                date: new Date(simDate),
                priority: topic.priority,
                difficulty: topic.difficulty
            });

            dailyMinutesAvailable -= durationMinutes;
            if (dailyMinutesAvailable <= 0) {
                simDate.setDate(simDate.getDate() + 1);
                dailyMinutesAvailable = dailyStudyHours * 60;
            }
        });

        const tasks = await Task.insertMany(tasksToCreate);

        res.status(201).json({ timetable, tasksAssigned: tasks.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all user timetables
// @route   GET /api/timetables
// @access  Private
export const getTimetables = async (req, res) => {
    try {
        const timetables = await Timetable.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(timetables);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete timetable
// @route   DELETE /api/timetables/:id
// @access  Private
// Also deletes associated tasks
export const deleteTimetable = async (req, res) => {
    try {
        const timetable = await Timetable.findById(req.params.id);

        if (timetable && timetable.user.toString() === req.user._id.toString()) {
            await Task.deleteMany({ timetable: timetable._id });
            await timetable.deleteOne();
            res.json({ message: 'Timetable removed' });
        } else {
            res.status(404).json({ message: 'Timetable not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
