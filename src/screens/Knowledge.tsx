import { motion, AnimatePresence } from 'motion/react';
import { Search, Database, FileText, Sparkles, History, CheckCircle2, Circle, Clock, ShieldCheck, ShieldAlert, Upload, Cpu, Activity, AlertCircle, AlertTriangle, Info, Plus, X, ArrowUpDown } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { Task, Note, RoutineSettings, AutomationStatus } from '../types';

interface KnowledgeProps {
  tasks: Task[];
  notes: Note[];
  routineSettings: RoutineSettings;
  automationStatus: AutomationStatus;
  onUploadTimetable: () => void;
  onToggleDND: (active: boolean) => void;
  onAddTask: (title: string, priority: 'low' | 'medium' | 'high', dueDate?: string, dependencies?: string[]) => void;
  onUpdateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
  onUpdateTaskStatus: (id: string, status: Task['status']) => void;
  onDeleteTasks: (ids: string[]) => void;
  onBulkUpdateStatus: (ids: string[], status: Task['status']) => void;
}

export default function Knowledge({ tasks, notes, routineSettings, automationStatus, onUploadTimetable, onToggleDND, onAddTask, onUpdateTask, onUpdateTaskStatus, onDeleteTasks, onBulkUpdateStatus }: KnowledgeProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskDependencies, setNewTaskDependencies] = useState<string[]>([]);
  
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskPriority, setEditTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [editTaskDueDate, setEditTaskDueDate] = useState('');
  const [editTaskDependencies, setEditTaskDependencies] = useState<string[]>([]);

  const [sortOrder, setSortOrder] = useState<'none' | 'high-to-low' | 'low-to-high'>('none');
  const [searchQuery, setSearchQuery] = useState('');

  const priorityWeight = {
    high: 3,
    medium: 2,
    low: 1
  };

  const sortedTasks = useMemo(() => {
    if (sortOrder === 'none') return tasks;
    
    return [...tasks].sort((a, b) => {
      const weightA = priorityWeight[a.priority];
      const weightB = priorityWeight[b.priority];
      
      if (sortOrder === 'high-to-low') {
        return weightB - weightA;
      } else {
        return weightA - weightB;
      }
    });
  }, [tasks, sortOrder]);

  const toggleSort = () => {
    setSortOrder(prev => {
      if (prev === 'none') return 'high-to-low';
      if (prev === 'high-to-low') return 'low-to-high';
      return 'none';
    });
  };

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter(note => 
      note.title.toLowerCase().includes(query) || 
      note.content.toLowerCase().includes(query) ||
      note.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [notes, searchQuery]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle, newTaskPriority, newTaskDueDate || undefined, newTaskDependencies.length > 0 ? newTaskDependencies : undefined);
    setNewTaskTitle('');
    setNewTaskPriority('medium');
    setNewTaskDueDate('');
    setNewTaskDependencies([]);
    setIsAddingTask(false);
  };

  const startEditing = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
    setEditTaskPriority(task.priority);
    setEditTaskDueDate(task.dueDate || '');
    setEditTaskDependencies(task.dependencies || []);
  };

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTaskId || !editTaskTitle.trim()) return;
    onUpdateTask(editingTaskId, {
      title: editTaskTitle,
      priority: editTaskPriority,
      dueDate: editTaskDueDate || undefined,
      dependencies: editTaskDependencies.length > 0 ? editTaskDependencies : undefined
    });
    setEditingTaskId(null);
  };

  const toggleTaskSelection = (id: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTaskIds.length === tasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(tasks.map(t => t.id));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedTaskIds.length} tasks?`)) {
      onDeleteTasks(selectedTaskIds);
      setSelectedTaskIds([]);
    }
  };

  const handleBulkStatusUpdate = (status: Task['status']) => {
    onBulkUpdateStatus(selectedTaskIds, status);
    setSelectedTaskIds([]);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 pb-12"
    >
      {/* Automation Dashboard */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-low p-6 rounded-[2rem] border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-4">
            <Cpu className="text-primary w-5 h-5" />
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">System Load</h3>
          </div>
          <div className="flex items-end gap-2">
            <span className="font-headline font-bold text-3xl text-on-surface">{automationStatus.systemLoad}%</span>
            <div className="flex-1 h-2 bg-surface-highest rounded-full mb-2 overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${automationStatus.systemLoad}%` }}></div>
            </div>
          </div>
        </div>
        <div className="bg-surface-low p-6 rounded-[2rem] border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="text-tertiary w-5 h-5" />
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Active Agents</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {automationStatus.activeAgents.map(agent => (
              <span key={agent} className="px-2 py-1 bg-tertiary/10 text-tertiary text-[9px] font-bold rounded uppercase tracking-tighter border border-tertiary/20">
                {agent}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-surface-low p-6 rounded-[2rem] border border-outline-variant/10">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="text-secondary w-5 h-5" />
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Routine Status</h3>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-on-surface">DND Mode</span>
            <button 
              onClick={() => onToggleDND(!routineSettings.dndActive)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${routineSettings.dndActive ? 'bg-red-500 text-white' : 'bg-surface-highest text-on-surface-variant hover:bg-primary hover:text-on-primary'}`}
            >
              {routineSettings.dndActive ? 'Active' : 'Disabled'}
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Routine & Tasks */}
        <div className="lg:col-span-5 space-y-8">
          {/* Routine Management */}
          <section className="bg-surface-low p-6 rounded-[2rem] border border-outline-variant/10 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline font-bold text-on-surface tracking-tight text-lg uppercase">Routine Sync</h2>
              <Sparkles className="text-primary w-5 h-5" />
            </div>
            
            <div className="p-4 bg-surface-highest/50 rounded-2xl border border-outline-variant/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-on-surface">Timetable Data</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${routineSettings.timetableUploaded ? 'bg-primary/20 text-primary' : 'bg-on-surface-variant/10 text-on-surface-variant'}`}>
                  {routineSettings.timetableUploaded ? 'SYNCED' : 'MISSING'}
                </span>
              </div>
              <button 
                onClick={onUploadTimetable}
                className="w-full py-3 bg-primary text-on-primary rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Upload className="w-4 h-4" /> Upload Timetable
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-surface-highest rounded-lg">
                  <Clock className="w-4 h-4 text-on-surface-variant" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Last Automation Action</span>
                  <p className="text-xs text-on-surface italic">"{routineSettings.lastAutomationAction}"</p>
                </div>
              </div>
              {routineSettings.nextDndSchedule && (
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-red-500 uppercase mb-1">Next Scheduled DND</span>
                    <p className="text-xs text-on-surface font-medium">{routineSettings.nextDndSchedule}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Tasks */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="font-headline font-bold text-on-surface tracking-tight text-lg uppercase">Active Tasks</h2>
                {tasks.length > 0 && (
                  <button 
                    onClick={handleSelectAll}
                    className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
                  >
                    {selectedTaskIds.length === tasks.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleSort}
                  className={`p-2 rounded-xl transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${
                    sortOrder !== 'none' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-surface-highest/40 text-on-surface-variant hover:text-primary'
                  }`}
                  title="Sort by Priority"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  {sortOrder !== 'none' && <span>{sortOrder === 'high-to-low' ? 'High → Low' : 'Low → High'}</span>}
                </button>
                <button 
                  onClick={() => setIsAddingTask(!isAddingTask)}
                  className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-all"
                >
                  {isAddingTask ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isAddingTask && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-surface-high p-5 rounded-2xl border border-primary/20 space-y-4"
                onSubmit={handleAddTask}
              >
                <input 
                  type="text"
                  placeholder="What needs to be done?"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-surface-lowest border border-outline-variant/20 rounded-xl py-3 px-4 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Priority</label>
                    <div className="flex items-center gap-2">
                      {(['low', 'medium', 'high'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setNewTaskPriority(p)}
                          className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${
                            newTaskPriority === p 
                              ? p === 'high' ? 'bg-red-500 text-white border-red-500' :
                                p === 'medium' ? 'bg-amber-500 text-white border-amber-500' :
                                'bg-primary text-on-primary border-primary'
                              : 'bg-surface-lowest text-on-surface-variant border-outline-variant/20 hover:border-primary/50'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Due Date (Optional)</label>
                    <input 
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="w-full bg-surface-lowest border border-outline-variant/20 rounded-lg py-2 px-3 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                {tasks.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Depends On</label>
                    <div className="flex flex-wrap gap-2">
                      {tasks.map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setNewTaskDependencies(prev => 
                            prev.includes(t.id) ? prev.filter(id => id !== t.id) : [...prev, t.id]
                          )}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all border ${
                            newTaskDependencies.includes(t.id)
                              ? 'bg-primary/20 border-primary text-primary'
                              : 'bg-surface-lowest border-outline-variant/20 text-on-surface-variant hover:border-primary/30'
                          }`}
                        >
                          {t.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <button 
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="w-full py-3 bg-primary text-on-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  Create Task
                </button>
              </motion.form>
            )}

            <AnimatePresence>
              {selectedTaskIds.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-primary/10 border border-primary/30 p-3 rounded-2xl flex items-center justify-between gap-4"
                >
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest pl-2">
                    {selectedTaskIds.length} Selected
                  </span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleBulkStatusUpdate('done')}
                      className="px-3 py-1.5 bg-primary text-on-primary rounded-lg text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all"
                    >
                      Mark Done
                    </button>
                    <button 
                      onClick={handleBulkDelete}
                      className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all"
                    >
                      Delete
                    </button>
                    <button 
                      onClick={() => setSelectedTaskIds([])}
                      className="p-1.5 text-on-surface-variant hover:text-primary"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="space-y-3">
              {sortedTasks.map((task) => {
                const priorityConfig = {
                  high: {
                    color: 'text-red-500',
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/20',
                    icon: AlertCircle,
                    label: 'High Priority'
                  },
                  medium: {
                    color: 'text-amber-500',
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/20',
                    icon: AlertTriangle,
                    label: 'Medium Priority'
                  },
                  low: {
                    color: 'text-primary',
                    bg: 'bg-primary/10',
                    border: 'border-primary/20',
                    icon: Info,
                    label: 'Low Priority'
                  }
                }[task.priority];

                const PriorityIcon = priorityConfig.icon;
                const unmetDependencies = task.dependencies?.filter(depId => {
                  const depTask = tasks.find(t => t.id === depId);
                  return depTask && depTask.status !== 'done';
                }) || [];

                if (editingTaskId === task.id) {
                  return (
                    <motion.form 
                      key={task.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-surface-high p-5 rounded-2xl border border-primary/40 space-y-4"
                      onSubmit={handleUpdateTask}
                    >
                      <input 
                        type="text"
                        value={editTaskTitle}
                        onChange={(e) => setEditTaskTitle(e.target.value)}
                        className="w-full bg-surface-lowest border border-outline-variant/20 rounded-xl py-3 px-4 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Priority</label>
                          <div className="flex items-center gap-2">
                            {(['low', 'medium', 'high'] as const).map((p) => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setEditTaskPriority(p)}
                                className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${
                                  editTaskPriority === p 
                                    ? p === 'high' ? 'bg-red-500 text-white border-red-500' :
                                      p === 'medium' ? 'bg-amber-500 text-white border-amber-500' :
                                      'bg-primary text-on-primary border-primary'
                                    : 'bg-surface-lowest text-on-surface-variant border-outline-variant/20 hover:border-primary/50'
                                }`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Due Date</label>
                          <input 
                            type="date"
                            value={editTaskDueDate}
                            onChange={(e) => setEditTaskDueDate(e.target.value)}
                            className="w-full bg-surface-lowest border border-outline-variant/20 rounded-lg py-2 px-3 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      </div>
                      {tasks.filter(t => t.id !== task.id).length > 0 && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Depends On</label>
                          <div className="flex flex-wrap gap-2">
                            {tasks.filter(t => t.id !== task.id).map(t => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setEditTaskDependencies(prev => 
                                  prev.includes(t.id) ? prev.filter(id => id !== t.id) : [...prev, t.id]
                                )}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all border ${
                                  editTaskDependencies.includes(t.id)
                                    ? 'bg-primary/20 border-primary text-primary'
                                    : 'bg-surface-lowest border-outline-variant/20 text-on-surface-variant hover:border-primary/30'
                                }`}
                              >
                                {t.title}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => setEditingTaskId(null)}
                          className="flex-1 py-3 bg-surface-highest text-on-surface-variant rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-surface-high transition-all"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          disabled={!editTaskTitle.trim()}
                          className="flex-1 py-3 bg-primary text-on-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                          Save Changes
                        </button>
                      </div>
                    </motion.form>
                  );
                }

                return (
                  <div key={task.id} className={`bg-surface-low p-4 rounded-2xl border ${priorityConfig.border} hover:border-primary/30 transition-all group relative overflow-hidden flex items-start gap-4`}>
                    {/* Priority Indicator Bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${priorityConfig.bg.replace('/10', '')}`} />
                    
                    <div className="flex items-center h-5 mt-1">
                      <input 
                        type="checkbox"
                        checked={selectedTaskIds.includes(task.id)}
                        onChange={() => toggleTaskSelection(task.id)}
                        className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary bg-surface-lowest"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (unmetDependencies.length > 0 && task.status !== 'done') {
                              alert(`Cannot complete task. Unmet dependencies: ${unmetDependencies.map(id => tasks.find(t => t.id === id)?.title).join(', ')}`);
                              return;
                            }
                            onUpdateTaskStatus(task.id, task.status === 'done' ? 'todo' : 'done');
                          }}
                          className={unmetDependencies.length > 0 && task.status !== 'done' ? 'opacity-50 cursor-not-allowed' : ''}
                        >
                          {task.status === 'done' ? (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          ) : (
                            <Circle className={`w-5 h-5 ${unmetDependencies.length > 0 ? 'text-on-surface-variant/30' : 'text-on-surface-variant group-hover:text-primary'} transition-colors`} />
                          )}
                        </button>
                      </div>
                      <div className="flex-1" onClick={() => startEditing(task)}>
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`font-medium text-sm ${task.status === 'done' ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>
                            {task.title}
                          </h3>
                          <PriorityIcon className={`w-4 h-4 ${priorityConfig.color} opacity-70`} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${priorityConfig.bg} ${priorityConfig.color}`}>
                              {task.priority}
                            </span>
                            <div className="flex items-center gap-1 text-on-surface-variant">
                              <Clock className="w-3 h-3" />
                              <span className="text-[10px] font-mono">
                                {task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : `Created: ${new Date(task.createdAt).toLocaleDateString()}`}
                              </span>
                            </div>
                          </div>
                          {task.dependencies && task.dependencies.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {task.dependencies.map(depId => {
                                const depTask = tasks.find(t => t.id === depId);
                                if (!depTask) return null;
                                return (
                                  <span key={depId} className={`text-[8px] px-1.5 py-0.5 rounded border ${depTask.status === 'done' ? 'bg-primary/5 border-primary/20 text-primary/60' : 'bg-surface-highest border-outline-variant/30 text-on-surface-variant'}`}>
                                    {depTask.title}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column: Knowledge Entries */}
        <section className="lg:col-span-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-headline font-bold text-on-surface tracking-tight text-lg uppercase">Knowledge Entries</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
                <input 
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-surface-low border border-outline-variant/20 rounded-xl py-2 pl-10 pr-4 text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-48 transition-all"
                />
              </div>
              <div className="hidden sm:flex gap-4">
                {['ALL', 'NOTES', 'DOCS'].map(filter => (
                  <button key={filter} className="text-on-surface-variant text-xs font-bold hover:text-primary transition-colors tracking-widest">
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filteredNotes.map((note) => (
              <div key={note.id} className="group bg-surface-low p-5 rounded-[2rem] hover:bg-surface-high transition-all border border-transparent hover:border-outline-variant/20 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="mt-1 w-10 h-10 rounded-2xl bg-surface-lowest flex items-center justify-center">
                      <FileText className="text-primary w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors">{note.title}</h3>
                      <p className="text-sm text-on-surface-variant line-clamp-2 mb-3 leading-relaxed">{note.content}</p>
                      <div className="flex gap-2">
                        {note.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-surface-highest text-on-surface-variant text-[10px] font-bold rounded uppercase tracking-tighter">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-on-surface-variant whitespace-nowrap">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {filteredNotes.length === 0 && (
              <div className="text-center py-12 bg-surface-low rounded-[2rem] border border-dotted border-outline-variant/30">
                <Search className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-4" />
                <p className="text-on-surface-variant font-medium">No matching notes found</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-primary text-xs font-bold uppercase tracking-widest hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
