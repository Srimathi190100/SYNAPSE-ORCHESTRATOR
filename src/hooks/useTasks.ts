import { useState, useEffect } from 'react';
import { Task } from '../types';
import { generateId } from '../lib/id';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('orchestrator_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 't1', title: 'Review system logs', priority: 'high', status: 'in-progress', createdAt: new Date().toISOString() },
      { id: 't2', title: 'Update agent protocols', priority: 'medium', status: 'todo', createdAt: new Date().toISOString() }
    ];
  });

  useEffect(() => {
    localStorage.setItem('orchestrator_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (title: string, priority: 'low' | 'medium' | 'high' = 'medium', dueDate?: string, dependencies?: string[]) => {
    const newTask: Task = {
      id: generateId(),
      title,
      priority,
      status: 'todo',
      createdAt: new Date().toISOString(),
      dueDate,
      dependencies
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  };

  const updateTaskStatus = (id: string, status: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const updateTask = (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTasks = (ids: string[]) => {
    setTasks(prev => prev.filter(t => !ids.includes(t.id)));
  };

  const bulkUpdateStatus = (ids: string[], status: Task['status']) => {
    setTasks(prev => prev.map(t => ids.includes(t.id) ? { ...t, status } : t));
  };

  return { tasks, addTask, updateTaskStatus, updateTask, deleteTasks, bulkUpdateStatus };
}
