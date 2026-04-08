import { useState, useEffect } from 'react';
import { ScheduleItem } from '../types';

const INITIAL_DATA: ScheduleItem[] = [
  {
    id: '1',
    title: 'Quarterly Roadmap Review',
    time: '09:00',
    type: 'Strategic Planning',
    description: 'Reviewing the product roadmap for the next two quarters with the leadership team.',
    location: 'Zoom / Conference Room A',
    lead: 'Sarah Miller',
    status: 'confirmed'
  },
  {
    id: '2',
    title: 'Deep Work: Architecture Design',
    time: '11:30',
    type: 'Task Integration',
    description: 'Focused time for designing the new micro-agent communication layer.',
    isAiShifted: true,
    originalTime: '10:00',
    status: 'pending'
  },
  {
    id: '3',
    title: 'Stakeholder Sync',
    time: '14:00',
    type: 'Current Session',
    description: 'Weekly sync with key stakeholders to discuss progress and blockers.',
    location: 'Google Meet',
    status: 'active'
  }
];

export function useSchedule() {
  const [items, setItems] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('orchestrator_schedule');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  useEffect(() => {
    localStorage.setItem('orchestrator_schedule', JSON.stringify(items));
  }, [items]);

  const updateItem = (updatedItem: ScheduleItem) => {
    setItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const addItem = (newItem: ScheduleItem) => {
    setItems(prev => [...prev, newItem]);
  };

  return { items, updateItem, addItem };
}
