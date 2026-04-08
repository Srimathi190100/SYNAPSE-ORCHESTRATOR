import { useState, useCallback } from 'react';
import { Workflow, WorkflowStep } from '../types';
import { AgentSystem, AgentActions } from '../services/agentSystem';
import { generateId } from '../lib/id';

export function useOrchestrator(actions: AgentActions) {
  const [activeWorkflow, setActiveWorkflow] = useState<Workflow | null>(null);
  const [history, setHistory] = useState<Workflow[]>(() => {
    const saved = localStorage.getItem('orchestrator_history');
    return saved ? JSON.parse(saved) : [];
  });

  const handleStepUpdate = useCallback((step: WorkflowStep) => {
    setActiveWorkflow(prev => {
      if (!prev) return null;
      const existingStepIndex = prev.steps.findIndex(s => s.id === step.id);
      let newSteps;
      if (existingStepIndex >= 0) {
        newSteps = [...prev.steps];
        newSteps[existingStepIndex] = step;
      } else {
        newSteps = [...prev.steps, step];
      }
      return { ...prev, steps: newSteps };
    });
  }, []);

  const runWorkflow = async (userInput: string) => {
    const newWorkflow: Workflow = {
      id: generateId(),
      title: userInput,
      status: 'running',
      startTime: new Date().toISOString(),
      steps: []
    };
    setActiveWorkflow(newWorkflow);

    const system = new AgentSystem(handleStepUpdate, actions);
    
    try {
      await system.processRequest(userInput);
      setActiveWorkflow(prev => {
        if (!prev) return null;
        const completed = { ...prev, status: 'completed' as const };
        setHistory(h => {
          const newHistory = [completed, ...h].slice(0, 10);
          localStorage.setItem('orchestrator_history', JSON.stringify(newHistory));
          return newHistory;
        });
        return completed;
      });
    } catch (error) {
      console.error("Workflow Error:", error);
      setActiveWorkflow(prev => {
        if (!prev) return null;
        return { ...prev, status: 'error' as const };
      });
    }
  };

  return { activeWorkflow, history, runWorkflow };
}
