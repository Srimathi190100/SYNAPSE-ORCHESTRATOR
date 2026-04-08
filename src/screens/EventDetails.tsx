import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Clock, User, FileText, Calendar, Bell, BellRing } from 'lucide-react';
import { ScheduleItem } from '../types';
import { useState } from 'react';

interface EventDetailsProps {
  event: ScheduleItem;
  onBack: () => void;
  onUpdateEvent: (item: ScheduleItem) => void;
}

export default function EventDetails({ event, onBack, onUpdateEvent }: EventDetailsProps) {
  const [isEditingReminder, setIsEditingReminder] = useState(false);
  const [reminderValue, setReminderValue] = useState(event.reminderMinutes || 0);

  const handleSaveReminder = () => {
    onUpdateEvent({ ...event, reminderMinutes: reminderValue > 0 ? reminderValue : undefined });
    setIsEditingReminder(false);
  };

  const reminderOptions = [
    { label: 'None', value: 0 },
    { label: '5m before', value: 5 },
    { label: '15m before', value: 15 },
    { label: '30m before', value: 30 },
    { label: '1h before', value: 60 },
  ];
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 pb-12"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-bold uppercase tracking-widest text-[10px]">Back to Schedule</span>
      </button>

      <div className="bg-surface-low rounded-[2rem] p-8 border border-outline-variant/10 relative overflow-hidden">
        {event.isAiShifted && (
          <div className="absolute top-0 right-0 bg-secondary text-on-primary px-6 py-2 rounded-bl-2xl font-bold text-[10px] uppercase tracking-widest">
            AI Optimized
          </div>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-primary font-mono text-[10px] uppercase tracking-[0.2em] font-bold">
              {event.type}
            </span>
            <h1 className="font-headline font-extrabold text-4xl text-on-surface tracking-tight">
              {event.title}
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 bg-surface-high p-4 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-on-surface-variant uppercase">Time</div>
                <div className="text-on-surface font-mono">{event.time}</div>
                {event.originalTime && (
                  <div className="text-[10px] text-secondary line-through">Was {event.originalTime}</div>
                )}
              </div>
            </div>

            {event.location && (
              <div className="flex items-center gap-4 bg-surface-high p-4 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-on-surface-variant uppercase">Location</div>
                  <div className="text-on-surface">{event.location}</div>
                </div>
              </div>
            )}

            {event.lead && (
              <div className="flex items-center gap-4 bg-surface-high p-4 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-on-surface-variant uppercase">Lead</div>
                  <div className="text-on-surface">{event.lead}</div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 bg-surface-high p-4 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-on-surface-variant/10 flex items-center justify-center text-on-surface-variant">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-on-surface-variant uppercase">Status</div>
                <div className="text-on-surface capitalize">{event.status || 'Scheduled'}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-surface-high p-4 rounded-2xl col-span-1 md:col-span-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${event.reminderMinutes ? 'bg-primary/20 text-primary' : 'bg-on-surface-variant/10 text-on-surface-variant'}`}>
                {event.reminderMinutes ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-on-surface-variant uppercase">Reminder</div>
                  <div className="text-on-surface">
                    {event.reminderMinutes ? `${event.reminderMinutes} minutes before` : 'No reminder set'}
                  </div>
                </div>
                
                {isEditingReminder ? (
                  <div className="flex items-center gap-2">
                    <select 
                      value={reminderValue}
                      onChange={(e) => setReminderValue(Number(e.target.value))}
                      className="bg-surface-lowest border border-outline-variant/20 rounded-lg px-2 py-1 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {reminderOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <button 
                      onClick={handleSaveReminder}
                      className="px-3 py-1 bg-primary text-on-primary rounded-lg text-[10px] font-bold uppercase tracking-widest"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsEditingReminder(true)}
                    className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
                  >
                    {event.reminderMinutes ? 'Change' : 'Set Reminder'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <FileText className="w-4 h-4" />
              <h3 className="font-bold text-[10px] uppercase tracking-widest">Description</h3>
            </div>
            <p className="text-on-surface-variant leading-relaxed bg-surface-lowest p-6 rounded-2xl border border-outline-variant/10">
              {event.description}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
