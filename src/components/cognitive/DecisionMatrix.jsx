import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StickyNoteCard from '../board/StickyNoteCard';

export default function DecisionMatrix({ notes, onUpdate, onDelete, onArchive, onFocusNote, audienceMode }) {
  const categorizeNote = (note) => {
    const effort = note.priority === 'urgent' || note.priority === 'high' ? 'high' : 'low';
    const impact = note.category === 'work' || note.category === 'projects' ? 'high' : 'low';
    
    return `${effort}-${impact}`;
  };

  const handleDrop = (event, quadrant) => {
    event.preventDefault();
    const noteId = event.dataTransfer.getData('text/plain');
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    const updates = getQuadrantUpdates(quadrant);
    onUpdate(noteId, updates);
  };

  const getQuadrantUpdates = (quadrant) => {
    switch (quadrant) {
      case 'low-high': // Quick wins
        return { priority: 'medium', category: 'projects', status: 'in_progress' };
      case 'high-high': // Major projects
        return { priority: 'high', category: 'projects', status: 'active' };
      case 'low-low': // Fill-ins
        return { priority: 'low', category: 'personal', status: 'active' };
      case 'high-low': // Thankless tasks
        return { priority: 'high', category: 'todo', status: 'waiting' };
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
    'low-high': {
      title: audienceMode === 'student' ? '⚡ Easy Wins!' : 'QUICK WINS (Low Effort + High Impact)',
      description: audienceMode === 'student' ? 'Easy stuff that helps a lot!' : 'Easy wins that deliver value',
      color: 'bg-green-50 border-green-200',
      headerColor: 'bg-green-500',
      notes: notes.filter(note => categorizeNote(note) === 'low-high')
    },
    'high-high': {
      title: audienceMode === 'student' ? '🚀 Big Projects!' : 'MAJOR PROJECTS (High Effort + High Impact)',
      description: audienceMode === 'student' ? 'Hard work but totally worth it!' : 'Strategic initiatives worth the investment',
      color: 'bg-blue-50 border-blue-200',
      headerColor: 'bg-blue-500',
      notes: notes.filter(note => categorizeNote(note) === 'high-high')
    },
    'low-low': {
      title: audienceMode === 'student' ? '😊 Fun Stuff!' : 'FILL-INS (Low Effort + Low Impact)',
      description: audienceMode === 'student' ? 'Easy things to do when bored' : 'Nice to have when you have extra time',
      color: 'bg-yellow-50 border-yellow-200',
      headerColor: 'bg-yellow-500',
      notes: notes.filter(note => categorizeNote(note) === 'low-low')
    },
    'high-low': {
      title: audienceMode === 'student' ? '😤 Hard & Boring' : 'THANKLESS TASKS (High Effort + Low Impact)',
      description: audienceMode === 'student' ? 'Hard stuff that might not help much' : 'Avoid or delegate these',
      color: 'bg-red-50 border-red-200',
      headerColor: 'bg-red-500',
      notes: notes.filter(note => categorizeNote(note) === 'high-low')
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {audienceMode === 'student' ? '🎯 Effort vs Reward Helper' : 'Decision Matrix'}
        </h2>
        <p className="text-slate-600">
          {audienceMode === 'student' 
            ? 'How hard is it vs how much it helps?'
            : 'Prioritize tasks by effort vs impact'
          }
        </p>
      </div>
      
      {/* Axis Labels */}
      <div className="relative mb-4">
        <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 -rotate-90">
          <span className="text-sm font-semibold text-slate-600">
            {audienceMode === 'student' ? 'BIG HELP' : 'HIGH IMPACT'}
          </span>
        </div>
        <div className="absolute -left-12 bottom-0 transform -rotate-90">
          <span className="text-sm font-semibold text-slate-600">
            {audienceMode === 'student' ? 'SMALL HELP' : 'LOW IMPACT'}
          </span>
        </div>
        <div className="absolute -top-8 left-1/4 transform -translate-x-1/2">
          <span className="text-sm font-semibold text-slate-600">
            {audienceMode === 'student' ? 'EASY' : 'LOW EFFORT'}
          </span>
        </div>
        <div className="absolute -top-8 right-1/4 transform translate-x-1/2">
          <span className="text-sm font-semibold text-slate-600">
            {audienceMode === 'student' ? 'HARD' : 'HIGH EFFORT'}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 h-[600px] ml-16">
        {Object.entries(quadrants).map(([key, quadrant]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Object.keys(quadrants).indexOf(key) * 0.1 }}
          >
            <Card 
              className={`h-full ${quadrant.color} border-2 transition-all duration-200`}
              onDrop={(e) => handleDrop(e, key)}
              onDragOver={handleDragOver}
            >
              <CardHeader className={`${quadrant.headerColor} text-white p-3`}>
                <CardTitle className="text-sm font-semibold">{quadrant.title}</CardTitle>
                <p className="text-xs opacity-90">{quadrant.description}</p>
                <Badge variant="secondary" className="self-start bg-white/20 text-white border-white/30">
                  {quadrant.notes.length} notes
                </Badge>
              </CardHeader>
              <CardContent className="p-3 overflow-auto" style={{ height: 'calc(100% - 100px)' }}>
                <div className="space-y-2 min-h-full">
                  {quadrant.notes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, note.id)}
                      className="cursor-move"
                    >
                      <div className="transform scale-75 origin-top-left">
                        <StickyNoteCard
                          note={{
                            ...note,
                            position_x: 0,
                            position_y: 0,
                            width: '100%',
                            height: 150
                          }}
                          onUpdate={onUpdate}
                          onDelete={onDelete}
                          onArchive={onArchive}
                          style={{
                            position: 'relative',
                            width: '133%',
                            height: '150px'
                          }}
                          onFocusNote={onFocusNote}
                          audienceMode={audienceMode}
                        />
                      </div>
                    </motion.div>
                  ))}
                  {quadrant.notes.length === 0 && (
                    <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-300 rounded-lg">
                      <p className="text-sm">
                        {audienceMode === 'student' 
                          ? 'Drag notes here!' 
                          : 'Drag notes to this quadrant'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}