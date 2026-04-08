import { motion } from 'motion/react';
import { RefreshCw, Calendar, Hourglass, Clock, Tag, Link as LinkIcon, Sparkles, CheckCircle2, Bell } from 'lucide-react';
import { ScheduleItem } from '../types';

interface ScheduleProps {
  items: ScheduleItem[];
  onEventSelect: (id: string) => void;
}

export default function Schedule({ items, onEventSelect }: ScheduleProps) {

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 pb-12"
    >
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold text-primary mb-2 block">System Status: Active Optimization</span>
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-on-surface tracking-tight">Daily Command Hub</h2>
          </div>
          <div className="flex gap-2">
            <div className="bg-surface-low px-4 py-2 rounded-xl flex items-center gap-2 border border-outline-variant/10">
              <RefreshCw className="text-tertiary w-4 h-4" />
              <span className="font-mono text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Synced 2m ago</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-7 space-y-6">
          <section className="bg-surface-low rounded-[2rem] p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-headline font-bold text-lg text-on-surface">Integrated Timeline</h3>
              <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest bg-surface-highest px-3 py-1 rounded-full">October 24, 2023</div>
            </div>
            
            <div className="space-y-0 relative">
              <div className="absolute left-[23px] top-0 bottom-0 w-px border-l-2 border-dotted border-outline-variant/30"></div>
              
              {items.map((item, index) => {
                const isCurrent = item.status === 'active';
                const isShifted = item.isAiShifted;

                return (
                  <div key={item.id} className="relative pl-12 pb-10">
                    <div className={`absolute left-0 top-1 w-12 text-[11px] font-bold font-mono ${isCurrent ? 'text-primary' : 'text-on-surface-variant/60'}`}>
                      {item.time}
                    </div>
                    
                    {isCurrent ? (
                      <div className="absolute left-[15px] top-1 w-4 h-4 rounded-full bg-primary animate-pulse shadow-[0_0_12px_#4fdbc8] z-10"></div>
                    ) : isShifted ? (
                      <div className="absolute left-[15px] top-1.5 w-[10px] h-[10px] rotate-45 bg-secondary ring-4 ring-secondary/10 z-10"></div>
                    ) : (
                      <div className="absolute left-[19px] top-2 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/10 z-10"></div>
                    )}

                    <button 
                      onClick={() => onEventSelect(item.id)}
                      className={`w-full text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        isCurrent 
                          ? 'bg-gradient-to-br from-primary/10 to-transparent border-l-4 border-primary p-4 rounded-r-2xl' 
                          : isShifted 
                            ? 'bg-surface-highest/60 border border-secondary/20 p-4 rounded-2xl backdrop-blur-sm'
                            : 'bg-surface-high p-4 rounded-2xl'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {isShifted && <span className="text-[10px] font-bold bg-secondary text-on-primary px-2 py-0.5 rounded">AI AUTO-SHIFT</span>}
                          {item.reminderMinutes && (
                            <div className="flex items-center gap-1 bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold">
                              <Bell className="w-3 h-3" />
                              {item.reminderMinutes}m
                            </div>
                          )}
                          <span className={`text-xs font-bold uppercase tracking-tighter ${isCurrent ? 'text-primary' : isShifted ? 'text-secondary' : 'text-primary'}`}>
                            {item.type}
                          </span>
                        </div>
                        {isCurrent ? <Hourglass className="w-4 h-4 text-primary" /> : <Calendar className="w-4 h-4 text-on-surface-variant" />}
                      </div>
                      <h4 className="text-on-surface font-semibold text-sm">{item.title}</h4>
                      <p className="text-on-surface-variant text-xs mt-1 line-clamp-1">{item.description}</p>
                      
                      {isShifted && (
                        <div className="mt-3 pt-3 border-t border-outline-variant/20 flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-secondary/20 flex items-center justify-center">
                            <Sparkles className="w-2.5 h-2.5 text-secondary" />
                          </div>
                          <span className="text-[10px] italic text-secondary">Conflict resolved: 100% overlap mitigated</span>
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-surface-lowest p-5 rounded-[2rem] border border-outline-variant/10">
            <h3 className="font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-4">Integrated Sources</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-low p-3 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#4285F4]/10 flex items-center justify-center">
                  <Calendar className="text-[#4285F4] w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-on-surface">G-Suite</div>
                  <div className="text-[9px] text-on-surface-variant">Connected</div>
                </div>
              </div>
              <div className="bg-surface-low p-3 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#E44332]/10 flex items-center justify-center">
                  <CheckCircle2 className="text-[#E44332] w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-on-surface">Todoist</div>
                  <div className="text-[9px] text-on-surface-variant">6 pending</div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-surface-low rounded-[2rem] overflow-hidden">
            <div className="p-6 border-b border-outline-variant/10">
              <h3 className="font-headline font-bold text-lg text-on-surface">Action Backlog</h3>
            </div>
            <div className="divide-y divide-outline-variant/10">
              {[
                { title: 'Finalize API Documentation', priority: 'HIGH', time: '15m', tag: 'Engineering', pColor: 'text-tertiary' },
                { title: 'Approve Q4 Marketing Budget', priority: 'MEDIUM', time: '5m', tag: '', pColor: 'text-on-surface-variant' },
                { title: 'Feedback for Design Sprint', priority: 'LOW', time: '', tag: 'Figma', pColor: 'text-on-surface-variant', isLink: true }
              ].map((task, i) => (
                <div key={i} className="p-4 hover:bg-surface-high transition-colors group cursor-pointer">
                  <div className="flex gap-4">
                    <div className="mt-1">
                      <div className="w-5 h-5 rounded border-2 border-outline-variant group-hover:border-primary transition-colors flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium text-on-surface">{task.title}</h4>
                        <span className={`text-[10px] font-bold ${task.pColor}`}>{task.priority}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        {task.time && (
                          <span className="flex items-center gap-1 text-[10px] text-on-surface-variant">
                            <Clock className="w-3 h-3" /> {task.time}
                          </span>
                        )}
                        {task.tag && (
                          <span className="flex items-center gap-1 text-[10px] text-on-surface-variant">
                            {task.isLink ? <LinkIcon className="w-3 h-3" /> : <Tag className="w-3 h-3" />} {task.tag}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="bg-gradient-to-br from-tertiary/20 to-transparent p-6 rounded-[2rem] border-l-4 border-tertiary">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-tertiary w-5 h-5" />
              <h4 className="font-headline font-bold text-sm text-tertiary">Optimization Insight</h4>
            </div>
            <p className="text-xs text-on-surface leading-relaxed">
              I've identified a 2-hour "Flow State" window between 15:30 and 17:30. Suggesting you batch your technical tasks then to maximize cognitive load efficiency.
            </p>
            <button className="mt-4 w-full bg-tertiary/10 hover:bg-tertiary/20 text-tertiary text-[10px] font-bold uppercase tracking-widest py-2.5 rounded-xl transition-colors">
              Accept Schedule Batching
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
