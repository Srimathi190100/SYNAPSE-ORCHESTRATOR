export type Screen = 'orchestrate' | 'schedule' | 'knowledge' | 'logs' | 'event-details';

export interface ScheduleItem {
  id: string;
  title: string;
  time: string;
  type: string;
  description: string;
  location?: string;
  lead?: string;
  isAiShifted?: boolean;
  originalTime?: string;
  status?: 'confirmed' | 'active' | 'pending';
  reminderMinutes?: number;
}

export interface Task {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'done';
  createdAt: string;
  dueDate?: string;
  dependencies?: string[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  agentName: string;
  stepName: string;
  description: string;
  timestamp: string;
  status: 'executing' | 'success' | 'error';
  toolUsed?: string;
  toolInput?: string;
  toolResult?: string;
  resultData?: any;
}

export interface Workflow {
  id: string;
  title: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  startTime?: string;
  steps: WorkflowStep[];
}

export type AgentRole = 'controller' | 'task' | 'scheduler' | 'data' | 'voice' | 'screen' | 'routine';

export interface RoutineSettings {
  dndActive: boolean;
  timetableUploaded: boolean;
  lastAutomationAction: string;
  nextDndSchedule?: string;
}

export interface AutomationStatus {
  activeAgents: AgentRole[];
  systemLoad: number;
  lastSync: string;
}
