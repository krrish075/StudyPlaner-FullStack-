import Timetable from '../models/Timetable.js';
import Task from '../models/Task.js';

// @desc    Create a new timetable and generate tasks
// @route   POST /api/timetables
// @access  Private
export const createTimetable = async (req, res) => {
    const { title, daysOfWeek, dailyStudyHours, examDate, subjects, studyStyle, pomodoroSettings } = req.body;
    // subjects: [{ name: 'Math', topics: [{ name: 'Algebra', difficulty: 'Hard', priority: 'High' }] }]

    try {
        // 1. Create Timetable
        const timetable = await Timetable.create({
            user: req.user._id,
            title,
            daysOfWeek: daysOfWeek || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            dailyStudyHours,
            examDate,
            studyStyle: studyStyle || 'Pomodoro',
            pomodoroSettings: pomodoroSettings || { focusTime: 25, breakTime: 5 }
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

        // Core Pomodoro parameters
        const isPomodoro = timetable.studyStyle === 'Pomodoro';
        const focusDuration = parseInt(timetable.pomodoroSettings?.focusTime, 10) || 25;
        const breakDuration = parseInt(timetable.pomodoroSettings?.breakTime, 10) || 5;

        allTopics.forEach(topic => {
            // Find next valid day
            while (!validDays.includes(simDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase())) {
                simDate.setDate(simDate.getDate() + 1);
                dailyMinutesAvailable = dailyStudyHours * 60;
            }

            let totalMinutesForTopic = topic.weight * CHUNK_MINUTES;

            // Fast forward day if topic can't fit at all
            if (dailyMinutesAvailable < totalMinutesForTopic && dailyMinutesAvailable <= 0) {
                simDate.setDate(simDate.getDate() + 1);
                dailyMinutesAvailable = dailyStudyHours * 60;
                while (!validDays.includes(simDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase())) {
                    simDate.setDate(simDate.getDate() + 1);
                }
            }

            if (isPomodoro) {
                // Break massive topics into Pomodoro Focus & Break cycles
                while (totalMinutesForTopic > 0) {

                    // 1. Focus block
                    // We can either do a full focusDuration, or whatever is left for the topic, or whatever is left in the day
                    const currentFocus = Math.min(totalMinutesForTopic, focusDuration, dailyMinutesAvailable);

                    if (currentFocus > 0) {
                        tasksToCreate.push({
                            user: req.user._id,
                            timetable: timetable._id,
                            subject: topic.subject,
                            topic: topic.topic,
                            durationMinutes: currentFocus,
                            date: new Date(simDate),
                            priority: topic.priority,
                            difficulty: topic.difficulty,
                            taskType: 'Focus'
                        });

                        totalMinutesForTopic -= currentFocus;
                        dailyMinutesAvailable -= currentFocus;
                    }

                    // Move to next day if out of time AFTER focus
                    if (dailyMinutesAvailable <= 0) {
                        simDate.setDate(simDate.getDate() + 1);
                        dailyMinutesAvailable = dailyStudyHours * 60;
                        while (!validDays.includes(simDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase())) {
                            simDate.setDate(simDate.getDate() + 1);
                        }
                        // Skip the break if we are moving to a new day immediately
                        continue;
                    }

                    // 2. Break block (only if we still have time left to study today AND a new focus block is coming)
                    if (totalMinutesForTopic > 0 && dailyMinutesAvailable > 0) {
                        const currentBreak = Math.min(dailyMinutesAvailable, breakDuration);
                        tasksToCreate.push({
                            user: req.user._id,
                            timetable: timetable._id,
                            subject: 'Break',
                            topic: 'Rest & Recharge',
                            durationMinutes: currentBreak,
                            date: new Date(simDate),
                            priority: 'Low',
                            difficulty: 'Easy',
                            taskType: 'Break'
                        });
                        dailyMinutesAvailable -= currentBreak;
                    }

                    // Move to next day if out of time AFTER break
                    if (dailyMinutesAvailable <= 0 && totalMinutesForTopic > 0) {
                        simDate.setDate(simDate.getDate() + 1);
                        dailyMinutesAvailable = dailyStudyHours * 60;
                        while (!validDays.includes(simDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase())) {
                            simDate.setDate(simDate.getDate() + 1);
                        }
                    }
                }
            } else {
                // Deep Work single chunk logic
                tasksToCreate.push({
                    user: req.user._id,
                    timetable: timetable._id,
                    subject: topic.subject,
                    topic: topic.topic,
                    durationMinutes: totalMinutesForTopic,
                    date: new Date(simDate),
                    priority: topic.priority,
                    difficulty: topic.difficulty,
                    taskType: 'Focus'
                });

                dailyMinutesAvailable -= totalMinutesForTopic;
                if (dailyMinutesAvailable <= 0) {
                    simDate.setDate(simDate.getDate() + 1);
                    dailyMinutesAvailable = dailyStudyHours * 60;
                }
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
