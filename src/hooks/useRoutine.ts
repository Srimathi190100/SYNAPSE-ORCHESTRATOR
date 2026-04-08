import { useState, useEffect } from 'react';
import { RoutineSettings, AutomationStatus } from '../types';

export function useRoutine() {
  const [settings, setSettings] = useState<RoutineSettings>(() => {
    const saved = localStorage.getItem('routine_settings');
    return saved ? JSON.parse(saved) : {
      dndActive: false,
      timetableUploaded: false,
      lastAutomationAction: 'System initialized'
    };
  });

  const [status, setStatus] = useState<AutomationStatus>({
    activeAgents: ['controller', 'routine'],
    systemLoad: 12,
    lastSync: new Date().toLocaleTimeString()
  });

  useEffect(() => {
    localStorage.setItem('routine_settings', JSON.stringify(settings));
  }, [settings]);

  const toggleDND = (active: boolean) => {
    setSettings(prev => ({
      ...prev,
      dndActive: active,
      lastAutomationAction: `DND turned ${active ? 'ON' : 'OFF'}`
    }));
  };

  const uploadTimetable = () => {
    setSettings(prev => ({
      ...prev,
      timetableUploaded: true,
      lastAutomationAction: 'Timetable uploaded and synced',
      nextDndSchedule: '10:00 - 12:00 (AI Systems Class)'
    }));
  };

  return { settings, status, toggleDND, uploadTimetable };
}
