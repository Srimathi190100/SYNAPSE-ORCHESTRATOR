/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Screen } from './types';
import { TopBar, BottomBar } from './components/Navigation';
import Orchestrate from './screens/Orchestrate';
import Schedule from './screens/Schedule';
import Knowledge from './screens/Knowledge';
import Logs from './screens/Logs';
import EventDetails from './screens/EventDetails';
import { useSchedule } from './hooks/useSchedule';
import { useTasks } from './hooks/useTasks';
import { useNotes } from './hooks/useNotes';
import { useOrchestrator } from './hooks/useOrchestrator';
import { useRoutine } from './hooks/useRoutine';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('orchestrate');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const { items, addItem, updateItem } = useSchedule();
  const { tasks, addTask, updateTaskStatus, updateTask, deleteTasks, bulkUpdateStatus } = useTasks();
  const { notes, addNote } = useNotes();
  const { settings, status, toggleDND, uploadTimetable } = useRoutine();
  
  const { activeWorkflow, history, runWorkflow } = useOrchestrator({
    addTask,
    addEvent: addItem,
    updateDND: toggleDND,
    addNote
  });

  // Automation features are now user-triggered to ensure system follows explicit commands.
  useEffect(() => {
    // Placeholder for future user-configurable automation
  }, []);

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser.');
      const fallback = prompt("Voice recognition not supported in this environment. Please type your command:");
      if (fallback) {
        runWorkflow(fallback);
      }
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log('Voice recognized:', transcript);
      runWorkflow(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      
      // Fallback on error (e.g. permission denied or no mic)
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        const fallback = prompt("Voice access denied. Please type your command:");
        if (fallback) runWorkflow(fallback);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setIsListening(false);
    }
  };

  const handleEventSelect = (id: string) => {
    setSelectedEventId(id);
    setCurrentScreen('event-details');
  };

  const renderScreen = () => {
    if (currentScreen === 'event-details' && selectedEventId) {
      const event = items.find(i => i.id === selectedEventId);
      if (event) {
        return (
          <EventDetails 
            event={event} 
            onBack={() => setCurrentScreen('schedule')} 
            onUpdateEvent={updateItem}
          />
        );
      }
    }

    switch (currentScreen) {
      case 'orchestrate': 
        return (
          <Orchestrate 
            onNavigateToSchedule={() => setCurrentScreen('schedule')} 
            runWorkflow={runWorkflow}
            activeWorkflow={activeWorkflow}
            routineSettings={settings}
            onVoiceInput={handleVoiceInput}
            isListening={isListening}
          />
        );
      case 'schedule': 
        return <Schedule items={items} onEventSelect={handleEventSelect} />;
      case 'knowledge': 
        return (
          <Knowledge 
            tasks={tasks} 
            notes={notes} 
            routineSettings={settings}
            automationStatus={status}
            onUploadTimetable={uploadTimetable}
            onToggleDND={toggleDND}
            onAddTask={addTask}
            onUpdateTask={updateTask}
            onUpdateTaskStatus={updateTaskStatus}
            onDeleteTasks={deleteTasks}
            onBulkUpdateStatus={bulkUpdateStatus}
          />
        );
      case 'logs': 
        return <Logs activeWorkflow={activeWorkflow} history={history} />;
      default: 
        return (
          <Orchestrate 
            onNavigateToSchedule={() => setCurrentScreen('schedule')} 
            runWorkflow={runWorkflow} 
            activeWorkflow={activeWorkflow} 
            routineSettings={settings}
            onVoiceInput={handleVoiceInput}
            isListening={isListening}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary/30">
      <TopBar onVoiceInput={handleVoiceInput} isListening={isListening} />
      
      <main className="pt-20 px-6 max-w-7xl mx-auto min-h-[calc(100vh-5rem)]">
        <AnimatePresence mode="wait">
          <div key={currentScreen + (selectedEventId || '')}>
            {renderScreen()}
          </div>
        </AnimatePresence>
      </main>

      <BottomBar 
        currentScreen={currentScreen === 'event-details' ? 'schedule' : currentScreen} 
        onScreenChange={(screen) => {
          setCurrentScreen(screen);
          setSelectedEventId(null);
        }} 
      />
    </div>
  );
}
