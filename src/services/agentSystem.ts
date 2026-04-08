import { tools } from "./tools";
import { WorkflowStep, AgentRole, Task, ScheduleItem } from "../types";
import { generateId } from "../lib/id";

export interface AgentActions {
  addTask: (title: string, priority: 'low' | 'medium' | 'high', dueDate?: string) => Task;
  addEvent: (item: ScheduleItem) => void;
  updateDND: (active: boolean) => void;
  addNote: (title: string, content: string) => void;
}

function safeParse(text: string) {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parse Failed:", text);
    throw e;
  }
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

  private async callAI(prompt: string) {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    return data.result;
  }

  async processRequest(userInput: string) {
    const controllerStep = this.createStep('Controller Agent', 'Intent Analysis', `Analyzing: "${userInput}"`);

    const responseText = await this.callAI(`
      You are a controller agent. Break user request into steps.
      Return JSON array with {agent, action}.

      User request: "${userInput}"
    `);

    const plan = safeParse(responseText);

    controllerStep.status = 'success';
    controllerStep.description = `Plan generated: ${plan.length} steps`;
    this.onStepUpdate(controllerStep);

    for (const step of plan) {
      await this.executeAgentStep(step.agent, step.action);
    }
  }

  private async executeAgentStep(agentRole: AgentRole, action: string) {
    const agentName = agentRole.charAt(0).toUpperCase() + agentRole.slice(1) + ' Agent';
    const step = this.createStep(agentName, 'Executing Action', action);

    try {
      if (agentRole === 'task') {
        const responseText = await this.callAI(`
          Extract task details from: "${action}"
          Return JSON: {title, priority, dueDate}
        `);

        const { title, priority, dueDate } = safeParse(responseText);

        const result = this.actions.addTask(title, priority, dueDate || undefined);

        step.toolUsed = 'addTask';
        step.resultData = result;
        step.description = `Task "${title}" added`;
      }

      else if (agentRole === 'scheduler') {
        const responseText = await this.callAI(`
          Extract event details from: "${action}"
          Return JSON: {title, time, description}
        `);

        const details = safeParse(responseText);

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
        step.description = `Event "${details.title}" scheduled`;
      }

      else if (agentRole === 'data') {
        const result = await tools.getWeather('Local City', 'Tomorrow');

        step.toolUsed = 'getWeather';
        step.resultData = result;
        step.description = `Weather: ${result.condition}`;
      }

      else if (agentRole === 'routine') {
        if (action.toLowerCase().includes('dnd')) {
          this.actions.updateDND(true);
          step.description = `DND activated`;
        }
      }

      step.status = 'success';
    } catch (error) {
      step.status = 'error';
      step.description = `Error: ${error}`;
    }

    this.onStepUpdate(step);
  }
}
