
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StickyNoteCard from '../board/StickyNoteCard';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function EisenhowerMatrix({ notes, onUpdate, onDelete, onArchive, onFocusNote, audienceMode }) {
  const categorizeNote = (note) => {
    const isUrgent = note.priority === 'urgent' || note.priority === 'high';
    const isImportant = note.category === 'work' || note.category === 'projects' || note.status === 'in_progress';
    
    if (isUrgent && isImportant) return 'do';
    if (!isUrgent && isImportant) return 'decide';
    if (isUrgent && !isImportant) return 'delegate';
    return 'delete';
  };

  const handleDrop = (event, quadrant) => {
    event.preventDefault();
    const noteId = event.dataTransfer.getData('text/plain');
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    // Update note based on quadrant
    const updates = getQuadrantUpdates(quadrant);
    onUpdate(noteId, updates);
  };

  const getQuadrantUpdates = (quadrant) => {
    switch (quadrant) {
      case 'do':
        return { priority: 'urgent', status: 'in_progress' };
      case 'decide':
        return { priority: 'high', status: 'active' };
      case 'delegate':
        return { priority: 'medium', assigned_to: 'Team Member' };
      case 'delete':
        return { priority: 'low', status: 'on_hold' };
      default:
        return {};
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDragStart = (event, noteId) => {
    event.dataTransfer.setData('text/plain', noteId);
  };

  const quadrants = {
    do: {
      title: audienceMode === 'student' ? '🔥 Do Now!' : 'DO (Urgent + Important)',
      description: audienceMode === 'student' ? 'Super important stuff to do right now!' : 'Crisis, emergencies, deadline-driven projects',
      color: 'bg-red-50 border-red-200',
      headerColor: 'bg-red-500',
      notes: notes.filter(note => categorizeNote(note) === 'do')
    },
    decide: {
      title: audienceMode === 'student' ? '📅 Plan It!' : 'DECIDE (Not Urgent + Important)',
      description: audienceMode === 'student' ? 'Important stuff to plan and work on later' : 'Prevention, planning, development, recreation',
      color: 'bg-blue-50 border-blue-200',
      headerColor: 'bg-blue-500',
      notes: notes.filter(note => categorizeNote(note) === 'decide')
    },
    delegate: {
      title: audienceMode === 'student' ? '👥 Ask for Help!' : 'DELEGATE (Urgent + Not Important)',
      description: audienceMode === 'student' ? 'Things to ask others to help with' : 'Interruptions, some calls, some emails',
      color: 'bg-yellow-50 border-yellow-200',
      headerColor: 'bg-yellow-500',
      notes: notes.filter(note => categorizeNote(note) === 'delegate')
    },
    delete: {
      title: audienceMode === 'student' ? '😴 Maybe Later' : 'DELETE (Not Urgent + Not Important)',
      description: audienceMode === 'student' ? 'Fun stuff for when you have free time' : 'Time wasters, pleasant activities, trivia',
      color: 'bg-gray-50/50 border-gray-200',
      headerColor: 'bg-gray-500',
      notes: notes.filter(note => categorizeNote(note) === 'delete')
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6 text-center flex-shrink-0">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {audienceMode === 'student' ? '🧠 Smart Priority Helper' : 'Eisenhower Decision Matrix'}
        </h2>
        <p className="text-slate-600">
          {audienceMode === 'student' 
            ? 'Drag your notes to the right box to organize them!'
            : 'Organize tasks by urgency and importance'
          }
        </p>
      </div>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(quadrants).map(([key, quadrant]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Object.keys(quadrants).indexOf(key) * 0.1 }}
            className="flex flex-col"
          >
            <Card 
              className={`h-full flex flex-col ${quadrant.color} border-2 transition-all duration-200`}
              onDrop={(e) => handleDrop(e, key)}
              onDragOver={handleDragOver}
            >
              <CardHeader className={`${quadrant.headerColor} text-white p-3 flex-shrink-0`}>
                <CardTitle className="text-sm font-semibold">{quadrant.title}</CardTitle>
                <p className="text-xs opacity-90">{quadrant.description}</p>
              </CardHeader>
              <CardContent className="p-2 flex-1 relative">
                <ScrollArea className="absolute inset-0">
                  <div className="p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {quadrant.notes.map(note => (
                      <div key={note.id} draggable onDragStart={(e) => handleDragStart(e, note.id)}>
                        <StickyNoteCard
                          note={{...note, position_x: 0, position_y: 0, width: '100%', height: 'auto'}}
                          onUpdate={onUpdate}
                          onDelete={onDelete}
                          onArchive={onArchive}
                          onFocusNote={onFocusNote}
                          audienceMode={audienceMode}
                          style={{ position: 'relative', width: '100%', height: 'auto', minHeight: '150px' }}
                        />
                      </div>
                    ))}
                    {quadrant.notes.length === 0 && (
                      <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-300 rounded-lg col-span-full">
                        <p className="text-sm">
                          {audienceMode === 'student' 
                            ? 'Drag notes here!' 
                            : 'Drag notes to this quadrant'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
