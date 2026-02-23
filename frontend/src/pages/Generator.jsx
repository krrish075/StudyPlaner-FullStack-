import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Loader2, Calendar as CalendarIcon, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const Generator = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    dailyStudyHours: 4,
    examDate: '',
    daysOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  });

  const [subjects, setSubjects] = useState([
    {
      id: Date.now(),
      name: '',
      topics: [{ id: Date.now() + 1, name: '', difficulty: 'Medium', priority: 'Medium' }]
    }
  ]);

  const handleSubjectChange = (subjectId, field, value) => {
    setSubjects(subjects.map(s => s.id === subjectId ? { ...s, [field]: value } : s));
  };

  const handleTopicChange = (subjectId, topicId, field, value) => {
    setSubjects(subjects.map(s => {
      if (s.id === subjectId) {
        return {
          ...s,
          topics: s.topics.map(t => t.id === topicId ? { ...t, [field]: value } : t)
        };
      }
      return s;
    }));
  };

  const addSubject = () => {
    setSubjects([...subjects, {
      id: Date.now(),
      name: '',
      topics: [{ id: Date.now() + 1, name: '', difficulty: 'Medium', priority: 'Medium' }]
    }]);
  };

  const removeSubject = (id) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  const addTopic = (subjectId) => {
    setSubjects(subjects.map(s => {
      if (s.id === subjectId) {
        return {
          ...s,
          topics: [...s.topics, { id: Date.now(), name: '', difficulty: 'Medium', priority: 'Medium' }]
        };
      }
      return s;
    }));
  };

  const removeTopic = (subjectId, topicId) => {
    setSubjects(subjects.map(s => {
      if (s.id === subjectId && s.topics.length > 1) {
        return {
          ...s,
          topics: s.topics.filter(t => t.id !== topicId)
        };
      }
      return s;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Input validation could be added here

      const payload = {
        title: formData.title || 'New Study Plan',
        dailyStudyHours: formData.dailyStudyHours,
        examDate: formData.examDate || undefined,
        daysOfWeek: formData.daysOfWeek,
        subjects: subjects.map(s => ({
          name: s.name || 'Untitled Subject',
          topics: s.topics.map(t => ({
            name: t.name || 'Untitled Topic',
            difficulty: t.difficulty,
            priority: t.priority
          }))
        }))
      };

      await api.post('/timetables', payload);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to generate timetable. Check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDay = (day) => {
    if (formData.daysOfWeek.includes(day)) {
      setFormData({ ...formData, daysOfWeek: formData.daysOfWeek.filter(d => d !== day) });
    } else {
      setFormData({ ...formData, daysOfWeek: [...formData.daysOfWeek, day] });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Smart Timetable Generator</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure your subjects and let our AI distribute them sensibly.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex gap-3 items-start">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Settings Block */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-900 dark:text-white">
            <CalendarIcon className="text-primary-500" /> Goal Parameters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Timetable Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Finals Prep 2026"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all dark:text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Target Exam Date (Optional)</label>
              <input
                type="date"
                value={formData.examDate}
                onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all dark:text-white"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Daily Study Hours Goal</label>
                <span className="text-sm font-bold text-primary-600 dark:text-primary-400">{formData.dailyStudyHours} hours</span>
              </div>
              <input
                type="range"
                min="1" max="14" step="0.5"
                value={formData.dailyStudyHours}
                onChange={(e) => setFormData({ ...formData, dailyStudyHours: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Study Days</label>
              <div className="flex flex-wrap gap-2">
                {allDays.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${formData.daysOfWeek.includes(day) ? 'bg-primary-50 dark:bg-primary-500/20 border-primary-200 dark:border-primary-500/30 text-primary-700 dark:text-primary-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary-300'}`}
                  >
                    {day.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Subjects Curriculum Block */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <BookOpen className="text-accent-500" /> Curriculum
            </h2>
            <button
              type="button"
              onClick={addSubject}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus size={16} /> Add Subject
            </button>
          </div>

          {subjects.map((subject, sIdx) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              key={subject.id}
              className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden"
            >
              <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 flex items-center gap-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Subject Name (e.g. Mathematics)"
                    value={subject.name}
                    onChange={(e) => handleSubjectChange(subject.id, 'name', e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-0 text-lg font-bold outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSubject(subject.id)}
                  disabled={subjects.length === 1}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {subject.topics.map((topic, tIdx) => (
                    <div key={topic.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <div className="flex-1 w-full">
                        <input
                          type="text"
                          placeholder="Topic (e.g. Linear Algebra)"
                          value={topic.name}
                          onChange={(e) => handleTopicChange(subject.id, topic.id, 'name', e.target.value)}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm dark:text-white"
                          required
                        />
                      </div>

                      <div className="flex gap-2 w-full sm:w-auto">
                        <select
                          value={topic.difficulty}
                          onChange={(e) => handleTopicChange(subject.id, topic.id, 'difficulty', e.target.value)}
                          className="flex-1 sm:w-32 px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm text-slate-700 dark:text-slate-300"
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                        <select
                          value={topic.priority}
                          onChange={(e) => handleTopicChange(subject.id, topic.id, 'priority', e.target.value)}
                          className="flex-1 sm:w-32 px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm text-slate-700 dark:text-slate-300"
                        >
                          <option value="Low">Low Prio</option>
                          <option value="Medium">Med Prio</option>
                          <option value="High">High Prio</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeTopic(subject.id, topic.id)}
                          disabled={subject.topics.length === 1}
                          className="px-3 py-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-100 dark:hover:border-red-500/20 transition-all disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => addTopic(subject.id)}
                  className="mt-4 text-sm font-medium flex items-center gap-1.5 text-primary-600 dark:text-primary-400 hover:text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-900/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus size={16} /> Add Topic
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-2xl shadow-lg shadow-primary-500/20 flex items-center gap-2 group transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Clock size={20} />}
            Generate Smart Schedule
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default Generator;
