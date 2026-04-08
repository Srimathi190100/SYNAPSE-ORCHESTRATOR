import { motion } from 'motion/react';
import { RefreshCw, Brain, Calendar, Terminal, Code2, Link as LinkIcon, Database, CheckCircle2, AlertCircle, Clock, Loader2, Mic, Monitor, ShieldCheck, Download } from 'lucide-react';
import { Workflow, WorkflowStep } from '../types';

interface LogsProps {
  activeWorkflow: Workflow | null;
  history: Workflow[];
}

export default function Logs({ activeWorkflow, history }: LogsProps) {
  const displayWorkflow = activeWorkflow || history[0];

  if (!displayWorkflow) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-on-surface-variant space-y-4">
        <Terminal className="w-16 h-16 opacity-20" />
        <p className="font-headline font-bold text-xl">No execution logs found</p>
        <p className="text-sm">Run a workflow from the Orchestrate screen to see logs here.</p>
      </div>
    );
  }

  const getAgentIcon = (agentName: string) => {
    if (agentName.includes('Controller')) return <Brain className="w-5 h-5" />;
    if (agentName.includes('Task')) return <CheckCircle2 className="w-5 h-5" />;
    if (agentName.includes('Scheduler')) return <Calendar className="w-5 h-5" />;
    if (agentName.includes('Voice')) return <Mic className="w-5 h-5" />;
    if (agentName.includes('Screen')) return <Monitor className="w-5 h-5" />;
    if (agentName.includes('Routine')) return <ShieldCheck className="w-5 h-5" />;
    return <Database className="w-5 h-5" />;
  };

  const getAgentColor = (agentName: string) => {
    if (agentName.includes('Controller')) return 'border-tertiary';
    if (agentName.includes('Task')) return 'border-secondary';
    if (agentName.includes('Scheduler')) return 'border-primary';
    if (agentName.includes('Voice')) return 'border-red-500';
    if (agentName.includes('Screen')) return 'border-tertiary';
    if (agentName.includes('Routine')) return 'border-primary';
    return 'border-on-surface-variant';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 pb-12"
    >
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-tertiary font-mono text-[10px] uppercase tracking-[0.2em] font-bold">
            <span className={`flex h-2 w-2 rounded-full ${displayWorkflow.status === 'running' ? 'bg-tertiary animate-pulse' : 'bg-primary'}`}></span>
            Execution ID: {displayWorkflow.id.toUpperCase()}
          </div>
          <h1 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight truncate max-w-2xl">
            {displayWorkflow.title}
          </h1>
          <p className="text-on-surface-variant max-w-2xl text-lg">
            {displayWorkflow.status === 'running' ? 'Active multi-agent coordination in progress.' : 'Workflow execution completed.'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={() => {
              const data = JSON.stringify({ activeWorkflow, history }, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `orchestrator-prototype-logs-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
            }}
            className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors border border-primary/20"
          >
            <Download className="w-3.5 h-3.5" />
            Export Logs
          </button>
          <div className="bg-surface-low p-4 rounded-2xl flex items-center gap-6 border border-outline-variant/10">
          <div>
            <div className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-1">Status</div>
            <div className={`flex items-center gap-2 ${displayWorkflow.status === 'running' ? 'text-tertiary' : 'text-primary'}`}>
              {displayWorkflow.status === 'running' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span className="font-bold text-sm uppercase">{displayWorkflow.status}</span>
            </div>
          </div>
          <div className="w-px h-8 bg-outline-variant/30"></div>
          <div>
            <div className="text-on-surface-variant text-[10px] uppercase font-bold tracking-widest mb-1">Start Time</div>
            <div className="text-on-surface font-mono font-bold tracking-tighter">
              {displayWorkflow.startTime ? new Date(displayWorkflow.startTime).toLocaleTimeString() : '--:--:--'}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Timeline Column */}
        <div className="lg:col-span-8 space-y-0 relative">
          <div className="absolute left-6 top-8 bottom-0 w-0.5 border-l-2 border-dotted border-outline-variant/30"></div>
          
          {displayWorkflow.steps.map((step, index) => (
            <div key={step.id} className="relative pl-16 pb-12">
              <div className={`absolute left-4 top-2 w-4 h-4 rounded-full z-10 ${
                step.status === 'executing' ? 'bg-tertiary animate-pulse ring-4 ring-tertiary/20' : 
                step.status === 'success' ? 'bg-primary ring-4 ring-primary/10' : 'bg-red-500'
              }`}></div>
              
              <div className={`bg-surface-low rounded-[2rem] p-6 border-l-4 ${getAgentColor(step.agentName)}`}>
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-surface-highest text-on-surface p-2 rounded-xl">
                      {getAgentIcon(step.agentName)}
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-on-surface">{step.agentName}</h3>
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold">{step.stepName}</p>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono bg-surface-highest px-2 py-1 rounded text-on-surface-variant">{step.timestamp}</div>
                </div>
                <p className="text-sm text-on-surface-variant mb-4 leading-relaxed">
                  {step.description}
                </p>
                
                {step.toolInput && (
                  <div className="mb-3 p-3 bg-surface-lowest rounded-xl border border-outline-variant/5">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Input</span>
                    <p className="text-xs font-mono text-on-surface/70 truncate">{step.toolInput}</p>
                  </div>
                )}

                {step.toolUsed && (
                  <div className="bg-surface-lowest rounded-xl p-3 border border-outline-variant/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Code2 className="text-tertiary w-3.5 h-3.5" />
                        <span className="text-[10px] font-mono text-tertiary">{step.toolUsed}</span>
                      </div>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {step.status === 'success' ? 'SUCCESS' : 'ERROR'}
                      </span>
                    </div>
                    {step.toolResult && (
                      <div className="mt-2 text-[10px] font-mono text-on-surface-variant/60 bg-black/20 p-2 rounded overflow-x-auto">
                        {step.toolResult}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {displayWorkflow.status === 'running' && (
            <div className="relative pl-16">
              <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-surface-highest z-10 animate-pulse"></div>
              <div className="bg-surface-low/50 rounded-[2rem] p-6 border border-dotted border-outline-variant/30">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-on-surface-variant animate-spin" />
                  <p className="text-sm text-on-surface-variant font-medium italic">Waiting for next agent response...</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* History Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-low rounded-[2rem] p-6 border border-outline-variant/10">
            <h4 className="font-mono text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-6">Workflow History</h4>
            <div className="space-y-4">
              {history.map((wf) => (
                <div key={wf.id} className="p-3 rounded-xl bg-surface-high border border-outline-variant/10 hover:border-primary/30 transition-colors cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-mono text-on-surface-variant">{new Date(wf.startTime!).toLocaleDateString()}</span>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${wf.status === 'completed' ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'}`}>
                      {wf.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-on-surface truncate">{wf.title}</p>
                </div>
              ))}
              {history.length === 0 && <p className="text-xs text-on-surface-variant italic">No previous runs</p>}
            </div>
          </div>

          <div className="bg-surface-lowest rounded-[2rem] p-5 font-mono text-[10px] border border-outline-variant/10">
            <div className="flex items-center justify-between mb-4 border-b border-outline-variant/20 pb-2">
              <span className="text-on-surface-variant font-bold">SYSTEM_LOGS</span>
              <Terminal className="w-3.5 h-3.5 text-on-surface-variant" />
            </div>
            <div className="space-y-2 opacity-80 max-h-64 overflow-y-auto custom-scrollbar">
              {displayWorkflow.steps.map(step => (
                <div key={step.id + '_log'} className="text-on-surface">
                  <span className="text-primary">[{step.timestamp}]</span> [{step.status.toUpperCase()}] {step.agentName}: {step.stepName}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
