import { useState, useEffect } from 'react';
import { Note } from '../types';
import { generateId } from '../lib/id';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('orchestrator_notes');
    return saved ? JSON.parse(saved) : [
      { id: 'n1', title: 'MCP Protocol Notes', content: 'Model Context Protocol is essential for cross-agent communication...', tags: ['mcp', 'architecture'], updatedAt: new Date().toISOString() },
      { id: 'n2', title: 'Future Agents', content: 'Consider adding a "Creative Agent" for image generation tasks.', tags: ['roadmap'], updatedAt: new Date().toISOString() }
    ];
  });

  useEffect(() => {
    localStorage.setItem('orchestrator_notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = (title: string, content: string, tags: string[] = []) => {
    const newNote: Note = {
      id: generateId(),
      title,
      content,
      tags,
      updatedAt: new Date().toISOString()
    };
    setNotes(prev => [newNote, ...prev]);
    return newNote;
  };

  return { notes, addNote };
}
