
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StickyNoteCard from './StickyNoteCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Flag, 
  CheckSquare, 
  FolderOpen, 
  Calendar, 
  Briefcase, 
  Users, 
  Tag,
  Clock
} from 'lucide-react';
import { format, isToday, isPast, isFuture } from 'date-fns';
import TimelineView from './TimelineView';
import EisenhowerMatrix from '../cognitive/EisenhowerMatrix';
import DecisionMatrix from '../cognitive/DecisionMatrix';
import ConnectionCircles from '../cognitive/ConnectionCircles';

export default function ViewRenderer({ 
  viewMode, 
  notes, 
  onUpdate, 
  onDelete, 
  onArchive,
  onMouseDown,
  draggedNote,
  onFocusNote,
  audienceMode, // Add audienceMode prop
  isThinkingMode
}) {
  if (viewMode === 'freeform') {
    return (
      <FreeFormView
        notes={notes}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onArchive={onArchive}
        onMouseDown={onMouseDown}
        draggedNote={draggedNote}
        onFocusNote={onFocusNote}
      />
    );
  }

  // Handle cognitive framework views
  if (viewMode === 'eisenhower') {
    return (
      <EisenhowerMatrix
        notes={notes}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onArchive={onArchive}
        onFocusNote={onFocusNote}
        audienceMode={audienceMode}
      />
    );
  }

  if (viewMode === 'decision') {
    return (
      <DecisionMatrix
        notes={notes}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onArchive={onArchive}
        onFocusNote={onFocusNote}
        audienceMode={audienceMode}
      />
    );
  }

  if (viewMode === 'connections') {
    return (
      <ConnectionCircles
        notes={notes}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onArchive={onArchive}
        onFocusNote={onFocusNote}
        audienceMode={audienceMode}
      />
    );
  }

  // Handle timeline view directly at the ViewRenderer level
  if (viewMode === 'timeline') {
    return (
      <TimelineView
        notes={notes}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onArchive={onArchive}
        onFocusNote={onFocusNote}
      />
    );
  }

  // Handle regular grouped views
  const groupedNotes = groupNotesByView(notes, viewMode);

  return (
    <div className="p-6 space-y-6">
      {Object.entries(groupedNotes).map(([groupKey, groupNotes]) => (
        <GroupSection
          key={groupKey}
          title={formatGroupTitle(groupKey, viewMode)}
          icon={getGroupIcon(groupKey, viewMode)}
          notes={groupNotes}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onArchive={onArchive}
          viewMode={viewMode}
          color={getGroupColor(groupKey, viewMode)}
          onFocusNote={onFocusNote}
        />
      ))}
    </div>
  );
}

function FreeFormView({ notes, onUpdate, onDelete, onArchive, onMouseDown, draggedNote, onFocusNote }) {
  return (
    <div className="relative w-full h-full">
      <AnimatePresence>
        {notes.map((note) => (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', duration: 0.4 }}
            onMouseDown={(e) => onMouseDown(e, note)}
          >
            <StickyNoteCard
              note={note}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onArchive={onArchive}
              isDragging={draggedNote === note.id}
              onFocusNote={onFocusNote}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function GroupSection({ title, icon: Icon, notes, onUpdate, onDelete, onArchive, viewMode, color, onFocusNote }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
          <p className="text-sm text-slate-500">{notes.length} notes</p>
        </div>
        <Badge variant="outline" className="ml-auto">
          {notes.length}
        </Badge>
      </div>

      {/* GroupSection no longer renders TimelineView; it's handled by ViewRenderer */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {notes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.05 }}
              className="relative"
            >
              <StickyNoteCard
                note={{
                  ...note,
                  position_x: 0,
                  position_y: 0,
                  width: '100%',
                  height: 200
                }}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onArchive={onArchive}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '200px'
                }}
                onFocusNote={onFocusNote}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// The TimelineView component has been moved to its own file (`./TimelineView.jsx`)
// and is imported directly by ViewRenderer. Therefore, it's removed from this file.

function groupNotesByView(notes, viewMode) {
  switch (viewMode) {
    case 'priority':
      return {
        urgent: notes.filter(n => n.priority === 'urgent'),
        high: notes.filter(n => n.priority === 'high'),
        medium: notes.filter(n => n.priority === 'medium'),
        low: notes.filter(n => n.priority === 'low')
      };
    
    case 'status':
      return {
        active: notes.filter(n => n.status === 'active'),
        in_progress: notes.filter(n => n.status === 'in_progress'),
        waiting: notes.filter(n => n.status === 'waiting'),
        completed: notes.filter(n => n.status === 'completed'),
        on_hold: notes.filter(n => n.status === 'on_hold')
      };
    
    case 'category':
      return {
        work: notes.filter(n => n.category === 'work'),
        personal: notes.filter(n => n.category === 'personal'),
        ideas: notes.filter(n => n.category === 'ideas'),
        todo: notes.filter(n => n.category === 'todo'),
        meetings: notes.filter(n => n.category === 'meetings'),
        projects: notes.filter(n => n.category === 'projects'),
        references: notes.filter(n => n.category === 'references')
      };
    
    case 'timeline': // This case will only be hit if GroupSection is rendered with 'timeline' view, which it now won't be
      const today = new Date();
      return {
        overdue: notes.filter(n => n.due_date && isPast(new Date(n.due_date)) && !isToday(new Date(n.due_date))),
        today: notes.filter(n => n.due_date && isToday(new Date(n.due_date))),
        upcoming: notes.filter(n => n.due_date && isFuture(new Date(n.due_date))),
        no_date: notes.filter(n => !n.due_date)
      };
    
    case 'project':
      const projectGroups = {};
      notes.forEach(note => {
        const project = note.project || 'Unassigned';
        if (!projectGroups[project]) {
          projectGroups[project] = [];
        }
        projectGroups[project].push(note);
      });
      return projectGroups;
    
    case 'owner':
      const ownerGroups = {};
      notes.forEach(note => {
        const owner = note.assigned_to || 'Unassigned';
        if (!ownerGroups[owner]) {
          ownerGroups[owner] = [];
        }
        ownerGroups[owner].push(note);
      });
      return ownerGroups;
    
    case 'type':
      return {
        task: notes.filter(n => n.note_type === 'task'),
        idea: notes.filter(n => n.note_type === 'idea'),
        reminder: notes.filter(n => n.note_type === 'reminder'),
        reference: notes.filter(n => n.note_type === 'reference'),
        meeting_note: notes.filter(n => n.note_type === 'meeting_note')
      };
    
    default:
      return { all: notes };
  }
}

function formatGroupTitle(groupKey, viewMode) {
  const titleMap = {
    priority: {
      urgent: '🔴 Urgent Priority',
      high: '🟠 High Priority',
      medium: '🟡 Medium Priority',
      low: '🟢 Low Priority'
    },
    status: {
      active: '✅ Active',
      in_progress: '⏳ In Progress',
      waiting: '⏸️ Waiting',
      completed: '✅ Completed',
      on_hold: '⏸️ On Hold'
    },
    timeline: {
      overdue: '🚨 Overdue',
      today: '📅 Due Today',
      upcoming: '⏰ Upcoming',
      no_date: '📝 No Due Date'
    }
  };

  if (titleMap[viewMode] && titleMap[viewMode][groupKey]) {
    return titleMap[viewMode][groupKey];
  }

  return groupKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getGroupIcon(groupKey, viewMode) {
  const iconMap = {
    priority: Flag,
    status: CheckSquare,
    category: FolderOpen,
    timeline: Calendar,
    project: Briefcase,
    owner: Users,
    type: Tag
  };
  return iconMap[viewMode] || FolderOpen;
}

function getGroupColor(groupKey, viewMode) {
  const colorMap = {
    urgent: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-blue-500',
    low: 'bg-green-500',
    active: 'bg-green-500',
    in_progress: 'bg-yellow-500',
    waiting: 'bg-purple-500',
    completed: 'bg-emerald-500',
    on_hold: 'bg-gray-500',
    overdue: 'bg-red-500',
    today: 'bg-orange-500',
    upcoming: 'bg-blue-500',
    no_date: 'bg-slate-500',
    work: 'bg-blue-500',
    personal: 'bg-pink-500',
    ideas: 'bg-purple-500',
    todo: 'bg-green-500'
  };
  return colorMap[groupKey] || 'bg-slate-500';
}
