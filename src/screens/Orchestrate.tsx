import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Brain, Sparkles, FileText, RefreshCw, ChevronRight, Calendar, CheckCircle2, BookOpen, ArrowUpRight, Send, Loader2, Mic, Monitor, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Workflow, RoutineSettings } from '../types';

interface OrchestrateProps {
  onNavigateToSchedule: () => void;
  runWorkflow: (input: string) => Promise<void>;
  activeWorkflow: Workflow | null;
  routineSettings: RoutineSettings;
  onVoiceInput: () => void;
  isListening: boolean;
}

export default function Orchestrate({ onNavigateToSchedule, runWorkflow, activeWorkflow, routineSettings, onVoiceInput, isListening }: OrchestrateProps) {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    await runWorkflow(input);
    setInput('');
    setIsSubmitting(false);
  };

  const triggerScreenScan = async () => {
    await runWorkflow("Perform a screen scan and analyze context for potential schedule updates.");
  };

  const lastStep = activeWorkflow?.steps[activeWorkflow.steps.length - 1];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 pb-12"
    >
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden rounded-[2rem] bg-surface-low p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <div className="absolute inset-0 brain-glow animate-pulse"></div>
          <div className="relative z-10 w-48 h-48 rounded-full bg-gradient-to-br from-primary to-on-primary flex items-center justify-center shadow-[0_0_40px_rgba(79,219,200,0.3)]">
            <Brain className="text-surface w-16 h-16" />
          </div>
          {/* Orbiting Nodes */}
          <div className="absolute w-full h-full animate-[spin_20s_linear_infinite]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-tertiary shadow-[0_0_10px_#7bd0ff]"></div>
          </div>
        </div>
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="space-y-1">
              <span className="text-on-surface-variant font-mono text-[10px] uppercase tracking-[0.2em] font-bold">System Operational</span>
              <h1 className="font-headline font-extrabold text-4xl md:text-5xl text-on-surface tracking-tight">Main Orchestrator Active</h1>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${routineSettings.dndActive ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-primary/10 border-primary/20 text-primary'}`}>
              {routineSettings.dndActive ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              <span className="text-[10px] font-bold uppercase tracking-widest">{routineSettings.dndActive ? 'DND Active' : 'System Open'}</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="relative max-w-xl">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Command the agents... (e.g. 'If it rains tomorrow, remind me to study')"
              className="w-full bg-surface-highest/50 border border-outline-variant/20 rounded-2xl py-4 pl-6 pr-24 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            <div className="absolute right-2 top-2 bottom-2 flex gap-1">
              <button 
                type="button"
                onClick={onVoiceInput}
                className={`aspect-square rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-surface-high text-on-surface hover:bg-surface-highest'}`}
              >
                <Mic className="w-5 h-5" />
              </button>
              <button 
                type="submit"
                disabled={isSubmitting || !input.trim()}
                className="aspect-square bg-primary text-on-primary rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </form>

          {/* Visible Agent Output */}
          {activeWorkflow && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-surface-highest/40 border border-primary/20 p-4 rounded-2xl max-w-xl"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Agent Output</span>
              </div>
              <p className="text-sm text-on-surface font-medium">
                {lastStep?.description || "Initializing workflow..."}
              </p>
              {lastStep?.status === 'executing' && (
                <div className="mt-2 h-1 w-full bg-surface-low rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary"
                    animate={{ x: [-100, 100] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  />
                </div>
              )}
            </motion.div>
          )}

          <div className="flex gap-4 justify-center md:justify-start flex-wrap">
            <button 
              onClick={onNavigateToSchedule}
              className="bg-surface-highest/60 text-on-surface px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 border border-outline-variant/10"
            >
              View Schedule <ArrowUpRight className="w-4 h-4" />
            </button>
            <button 
              onClick={triggerScreenScan}
              className="bg-tertiary/10 text-tertiary px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform active:scale-95 border border-tertiary/20"
            >
              <Monitor className="w-4 h-4" /> Scan Screen
            </button>
            {activeWorkflow && activeWorkflow.status === 'running' && (
              <div className="bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                <span className="text-xs font-bold text-primary uppercase tracking-widest">Agent Workflow Active</span>
              </div>
            )}
          </div>

          {/* Prototype Status Footer */}
          <div className="pt-4 border-t border-outline-variant/10 flex items-center gap-6 opacity-60">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
              <span className="text-[10px] font-mono uppercase tracking-widest">Core Engine: Gemini 3 Flash</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-tertiary"></div>
              <span className="text-[10px] font-mono uppercase tracking-widest">Agents: 6 Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary"></div>
              <span className="text-[10px] font-mono uppercase tracking-widest">Build: v0.4.2-proto</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-surface-low rounded-[2rem] p-6 space-y-4">
            <h2 className="font-headline font-bold text-lg text-on-surface">Quick Workflows</h2>
            <div className="space-y-3">
              {[
                { icon: Sparkles, label: 'Plan my day', prompt: 'Analyze my schedule and suggest an optimized plan for today.' },
                { icon: Monitor, label: 'Analyze screen context', prompt: 'Perform a screen scan and analyze context for potential schedule updates.' },
                { icon: ShieldCheck, label: 'Sync Routine & DND', prompt: 'Review my timetable and set the appropriate DND schedule for today.' },
                { icon: RefreshCw, label: 'Sync all tools', prompt: 'Sync all tasks and calendar events across my connected tools.' }
              ].map((item, i) => (
                <button 
                  key={i}
                  onClick={() => runWorkflow(item.prompt)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-surface-high hover:bg-surface-highest transition-all group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="text-primary w-5 h-5" />
                    <span className="font-medium text-on-surface">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          {/* Logs Preview */}
          <div className="bg-surface-lowest p-6 rounded-[2rem] border border-outline-variant/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Active Workflow Logs</h3>
              {activeWorkflow?.status === 'running' && <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>}
            </div>
            <div className="space-y-3 font-mono text-[11px] text-on-surface-variant/80 max-h-48 overflow-y-auto custom-scrollbar">
              {activeWorkflow?.steps.length ? (
                activeWorkflow.steps.map((step) => (
                  <div key={step.id} className="flex gap-2">
                    <span className="text-primary">[{step.timestamp.split(' ')[0]}]</span>
                    <span className={step.status === 'executing' ? 'animate-pulse' : ''}>
                      {step.agentName}: {step.description}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 opacity-30 italic">No active workflow</div>
              )}
            </div>
          </div>
        </aside>

        {/* Sub-Agents Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Voice Intent Agent */}
          <div className="bg-surface-high rounded-[2rem] p-6 relative overflow-hidden flex flex-col group hover:shadow-[0_8px_32px_rgba(6,14,32,0.2)] transition-all">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 rounded-xl bg-surface-highest text-red-500">
                <Mic className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant bg-surface-low px-2 py-1 rounded">LISTENING</span>
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-1">Voice Intent Agent</h3>
            <p className="text-sm text-on-surface-variant mb-6">Classifying voice input into actionable tasks or events.</p>
            <div className="mt-auto space-y-4">
              <div className="p-3 bg-surface-lowest rounded-xl">
                <span className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Last Recognition</span>
                <span className="text-xs text-on-surface">"Schedule meeting..." → Intent: Event</span>
              </div>
            </div>
          </div>

          {/* Screen Analysis Agent */}
          <div className="bg-surface-high rounded-[2rem] p-6 relative overflow-hidden flex flex-col group hover:shadow-[0_8px_32px_rgba(6,14,32,0.2)] transition-all">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary"></div>
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 rounded-xl bg-surface-highest text-tertiary">
                <Monitor className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant bg-surface-low px-2 py-1 rounded">SCANNING</span>
            </div>
            <h3 className="font-headline font-bold text-xl text-on-surface mb-1">Screen Analysis Agent</h3>
            <p className="text-sm text-on-surface-variant mb-6">Extracting context from active screen content.</p>
            <div className="mt-auto space-y-4">
              <div className="p-3 bg-surface-lowest rounded-xl">
                <span className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Context Found</span>
                <span className="text-xs text-on-surface">WhatsApp: "Meeting postponed to 2 PM"</span>
              </div>
            </div>
          </div>

          {/* Routine Agent */}
          <div className="md:col-span-2 bg-surface-high rounded-[2rem] p-6 relative overflow-hidden flex flex-col md:flex-row gap-6 group hover:shadow-[0_8px_32px_rgba(6,14,32,0.2)] transition-all">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
            <div className="flex-shrink-0">
              <div className="p-4 rounded-2xl bg-surface-highest text-primary inline-block">
                <ShieldCheck className="w-10 h-10" />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <h3 className="font-headline font-bold text-xl text-on-surface">Routine Agent</h3>
                <span className="text-[10px] font-bold text-on-surface-variant bg-surface-low px-2 py-1 rounded">OPTIMIZING</span>
              </div>
              <p className="text-sm text-on-surface-variant">Managing DND schedules and automation based on your timetable.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-surface-lowest rounded-xl">
                  <span className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">DND Status</span>
                  <div className="flex items-end gap-2">
                    <span className={`font-headline font-bold text-2xl ${routineSettings.dndActive ? 'text-red-500' : 'text-primary'}`}>
                      {routineSettings.dndActive ? 'ON' : 'OFF'}
                    </span>
                    <span className="text-[10px] text-on-surface-variant mb-1">Auto-managed</span>
                  </div>
                </div>
                <div className="p-3 bg-surface-lowest rounded-xl">
                  <span className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Next Automation</span>
                  <span className="text-xs text-on-surface">{routineSettings.nextDndSchedule || 'No schedule set'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
