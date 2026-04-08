import { GoogleGenAI, Type } from "@google/genai";
import { tools } from "./tools";
import { WorkflowStep, AgentRole, Task, ScheduleItem } from "../types";
import { generateId } from "../lib/id";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AgentActions {
  addTask: (title: string, priority: 'low' | 'medium' | 'high', dueDate?: string, dependencies?: string[]) => Task;
  addEvent: (item: ScheduleItem) => void;
  updateDND: (active: boolean) => void;
  addNote: (title: string, content: string) => void;
}

export class AgentSystem {
  private onStepUpdate: (step: WorkflowStep) => void;
  private actions: AgentActions;

  constructor(onStepUpdate: (step: WorkflowStep) => void, actions: AgentActions) {
    this.onStepUpdate = onStepUpdate;
    this.actions = actions;
  }

  private createStep(agent: string, name: string, desc: string, status: 'executing' | 'success' | 'error' = 'executing'): WorkflowStep {
    const step: WorkflowStep = {
      id: generateId(),
      agentName: agent,
      stepName: name,
      description: desc,
      timestamp: new Date().toLocaleTimeString(),
      status
    };
    this.onStepUpdate(step);
    return step;
  }

  async processRequest(userInput: string) {
    // 1. Controller Agent analyzes the request
    const controllerStep = this.createStep('Controller Agent', 'Intent Analysis', `Analyzing: "${userInput}"`);
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are the Controller Agent of a multi-agent AI system. 
      Your goal is to decompose a user request into a sequence of agent actions.
      
      Sub-agents:
      - Task Agent: Handles creating to-do items (tasks). Use this for things that need to be DONE but don't have a specific fixed time slot.
      - Scheduler Agent: Handles calendar events, meetings, and time-specific reminders. Use this for things that happen at a SPECIFIC TIME.
      - Data Agent: Fetches external info (weather, news).
      - Voice Agent: Processes audio/voice input.
      - Screen Agent: Scans the screen for context.
      - Routine Agent: Manages system settings like DND and timetable sync.

      Decision Logic for Task vs Schedule:
      - If the user mentions a specific time (e.g., "at 2 PM", "tomorrow morning"), use Scheduler Agent.
      - If it's a general to-do (e.g., "remind me to buy milk", "I need to finish the report"), use Task Agent.

      User request: "${userInput}"

      Return a JSON array of steps. Each step should have "agent" (task|scheduler|data|voice|screen|routine) and "action" (detailed instruction for the sub-agent).
      Example: [{"agent": "scheduler", "action": "Schedule a team sync for tomorrow at 10 AM"}]`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              agent: { type: Type.STRING, enum: ['task', 'scheduler', 'data', 'voice', 'screen', 'routine'] },
              action: { type: Type.STRING }
            },
            required: ['agent', 'action']
          }
        }
      }
    });

    const plan = JSON.parse(response.text);
    controllerStep.status = 'success';
    controllerStep.description = `Plan generated: ${plan.length} steps identified.`;
    this.onStepUpdate(controllerStep);

    // 2. Execute the plan
    for (const step of plan) {
      await this.executeAgentStep(step.agent, step.action);
    }
  }

  private async executeAgentStep(agentRole: AgentRole, action: string) {
    const agentName = agentRole.charAt(0).toUpperCase() + agentRole.slice(1) + ' Agent';
    const step = this.createStep(agentName, 'Executing Action', action);
    step.toolInput = action;

    try {
      if (agentRole === 'data') {
        if (action.toLowerCase().includes('weather')) {
          const result = await tools.getWeather('Local City', 'Tomorrow');
          step.toolUsed = 'getWeather';
          step.resultData = result;
          step.toolResult = JSON.stringify(result);
          step.description = `Weather check complete: ${result.condition}, ${result.temperature}°C`;
        }
      } else if (agentRole === 'task') {
        // Use Gemini to extract task details
        const taskDetails = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Extract task details from: "${action}". Return JSON with "title", "priority" (low|medium|high), "dueDate" (YYYY-MM-DD format, or null if not mentioned), and "dependencies" (array of task titles this task depends on, or empty array).`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                dueDate: { type: Type.STRING, nullable: true },
                dependencies: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['title', 'priority']
            }
          }
        });
        const { title, priority, dueDate, dependencies } = JSON.parse(taskDetails.text);
        
        // Map dependency titles to IDs if possible (simplified for now as we don't have a full task list here)
        // In a real app, we'd search existing tasks by title.
        
        const result = this.actions.addTask(title, priority, dueDate || undefined);
        step.toolUsed = 'addTask';
        step.resultData = result;
        step.toolResult = `Task created: ${title} (${priority})${dueDate ? ` due ${dueDate}` : ''}`;
        step.description = `Task "${title}" added to your to-do list${dueDate ? ` (Due: ${dueDate})` : ''}.`;
      } else if (agentRole === 'scheduler') {
        // Use Gemini to extract event details
        const eventDetails = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `Extract event details from: "${action}". Return JSON with "title", "time" (HH:mm), and "description".`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                time: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ['title', 'time', 'description']
            }
          }
        });
        const details = JSON.parse(eventDetails.text);
        const newItem: ScheduleItem = {
          id: generateId(),
          title: details.title,
          time: details.time,
          type: 'AI Generated',
          description: details.description,
          status: 'pending'
        };
        this.actions.addEvent(newItem);
        step.toolUsed = 'addEvent';
        step.resultData = newItem;
        step.toolResult = `Event scheduled: ${details.title} at ${details.time}`;
        step.description = `"${details.title}" has been added to your schedule at ${details.time}.`;
      } else if (agentRole === 'voice') {
        const result = await tools.processVoice();
        step.toolUsed = 'processVoice';
        step.resultData = result;
        step.toolResult = JSON.stringify(result);
        step.description = `Voice intent recognized: "${result.transcript}"`;
        
        // Recursively process the recognized transcript
        await this.processRequest(result.transcript);
      } else if (agentRole === 'screen') {
        const result = await tools.scanScreen();
        step.toolUsed = 'scanScreen';
        step.resultData = result;
        step.toolResult = JSON.stringify(result);
        step.description = `Screen analyzed. Found: "${result.text}" from ${result.source}`;
        
        // If intent is schedule_update, trigger scheduler
        if (result.detectedIntent === 'schedule_update') {
          await this.executeAgentStep('scheduler', `Update schedule based on: ${result.text}`);
        }
      } else if (agentRole === 'routine') {
        if (action.toLowerCase().includes('dnd')) {
          const result = await tools.setDND(true, '12:00');
          this.actions.updateDND(true);
          step.toolUsed = 'setDND';
          step.resultData = result;
          step.toolResult = JSON.stringify(result);
          step.description = `DND routine activated until 12:00.`;
        } else if (action.toLowerCase().includes('timetable')) {
          const result = await tools.processTimetable('raw_data');
          step.toolUsed = 'processTimetable';
          step.resultData = result;
          step.toolResult = JSON.stringify(result);
          step.description = `Timetable synced. Recommended DND: ${result.recommendedDND}`;
        }
      }

      step.status = 'success';
    } catch (error) {
      step.status = 'error';
      step.description = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    this.onStepUpdate(step);
  }
}
