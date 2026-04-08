import { LayoutDashboard, Calendar, BookOpen, Terminal, Radio, Mic } from 'lucide-react';
import { Screen } from '../types';
import { useState } from 'react';

interface NavigationProps {
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
}

interface TopBarProps {
  onVoiceInput: () => void;
  isListening?: boolean;
}

export function TopBar({ onVoiceInput, isListening }: TopBarProps) {
  return (
    <header className="fixed top-0 z-50 w-full bg-surface/80 backdrop-blur-xl flex justify-between items-center px-6 py-3 border-b border-outline-variant/10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-high border border-outline-variant/20 relative">
          <img 
            alt="AI Agent" 
            className="w-full h-full object-cover" 
            src="https://picsum.photos/seed/ai-agent/100/100" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
        </div>
        <span className="font-headline font-black text-primary tracking-tighter text-xl uppercase">ORCHESTRATOR</span>
        <div className="px-1.5 py-0.5 rounded border border-primary/30 bg-primary/5">
          <span className="text-[10px] font-mono font-bold text-primary/70 tracking-widest leading-none">PROTOTYPE</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={onVoiceInput}
          className={`p-2 rounded-lg transition-all active:scale-95 flex items-center gap-2 border ${
            isListening 
              ? 'bg-red-500 border-red-400 text-white animate-pulse' 
              : 'text-on-surface-variant hover:bg-surface-highest/40 border-transparent hover:text-primary'
          }`}
          title="Initiate Voice Command"
        >
          <Mic className="w-5 h-5" />
          {isListening && <span className="text-[10px] font-bold uppercase tracking-widest pr-1">Listening...</span>}
        </button>
        <button className="text-on-surface-variant hover:bg-surface-highest/40 p-2 rounded-lg transition-colors active:scale-95">
          <Radio className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

export function BottomBar({ currentScreen, onScreenChange }: NavigationProps) {
  const navItems = [
    { id: 'orchestrate' as Screen, icon: LayoutDashboard, label: 'Orchestrate' },
    { id: 'schedule' as Screen, icon: Calendar, label: 'Schedule' },
    { id: 'knowledge' as Screen, icon: BookOpen, label: 'Knowledge' },
    { id: 'logs' as Screen, icon: Terminal, label: 'Logs' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 bg-surface-low/95 backdrop-blur-xl flex justify-around items-center px-4 pb-8 pt-4 border-t border-outline-variant/10">
      {navItems.map((item) => {
        const isActive = currentScreen === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onScreenChange(item.id)}
            className={`flex flex-col items-center justify-center transition-all active:scale-90 relative ${
              isActive ? 'text-slate-950' : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            {isActive && (
              <div className="absolute inset-0 -m-2 bg-gradient-to-br from-primary to-[#009182] rounded-2xl shadow-[0_0_20px_rgba(79,219,200,0.3)] -z-10" />
            )}
            <item.icon className={`w-6 h-6 ${isActive ? 'mb-1' : 'mb-1'}`} />
            <span className="font-sans text-[10px] uppercase tracking-widest font-bold">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
