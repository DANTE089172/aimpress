import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import { 
  Pencil, 
  Trash2, 
  Archive, 
  FolderOpen, 
  Tag, 
  Flag, 
  CheckSquare, 
  Clock, 
  Briefcase, 
  Users 
} from 'lucide-react';

const colorClasses = {
  yellow: 'from-yellow-400/80 to-amber-500/80',
  blue: 'from-blue-400/80 to-sky-500/80',
  green: 'from-green-400/80 to-emerald-500/80',
  pink: 'from-pink-400/80 to-rose-500/80',
  purple: 'from-purple-400/80 to-violet-500/80',
  orange: 'from-orange-400/80 to-red-500/80'
};

const badgeColors = {
  urgent: 'bg-red-500/20 text-red-800 border-red-400/30',
  high: 'bg-orange-500/20 text-orange-800 border-orange-400/30',
  medium: 'bg-blue-500/20 text-blue-800 border-blue-400/30',
  low: 'bg-gray-500/20 text-gray-800 border-gray-400/30'
};

export default function ProfessionalStickyNoteCard({ note, onUpdate, onDelete, onArchive, onMouseDown, isDragging, style, onFocusNote }) {
  const theme = colorClasses[note.color] || colorClasses.yellow;
  const badgeTheme = badgeColors[note.priority] || badgeColors.low;
  
  const content = note.content ? note.content.replace(/<p><br><\/p>/g, '').trim() : '';

  return (
    <motion.div
      style={{
        ...style,
        position: 'absolute',
        left: note.position_x,
        top: note.position_y,
        width: note.width,
        height: note.height,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      className="group"
      layoutId={note.id}
    >
      <Card
        onMouseDown={onMouseDown}
        style={{
          width: '100%',
          height: '100%',
        }}
        className={`relative flex flex-col bg-gradient-to-br ${theme} border border-white/30 rounded-2xl shadow-lg backdrop-blur-xl text-slate-800 overflow-hidden`}
      >
        <CardHeader className="relative p-4">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-base font-bold pr-16">{note.title}</CardTitle>
            <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onFocusNote(note)}
                className="h-7 w-7 rounded-full text-slate-600 hover:text-slate-900 hover:bg-white/30"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(note.id)}
                className="h-7 w-7 rounded-full text-slate-600 hover:text-red-500 hover:bg-white/30"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 flex-1 overflow-y-auto">
          {content && (
            <div className="text-sm mb-3 space-y-1 ql-snow">
              <div className="ql-editor p-0" style={{'--ql-font-size': '14px', '--ql-line-height': '1.4'}} dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {note.priority && <Badge variant="outline" className={`text-xs ${badgeTheme}`}><Flag className="w-3 h-3 mr-1" /> {note.priority}</Badge>}
            {note.status && <Badge variant="outline" className="text-xs bg-gray-500/10 text-slate-700 border-gray-400/30"><CheckSquare className="w-3 h-3 mr-1" /> {note.status}</Badge>}
            {note.category && <Badge variant="outline" className="text-xs bg-gray-500/10 text-slate-700 border-gray-400/30"><FolderOpen className="w-3 h-3 mr-1" /> {note.category}</Badge>}
            {note.project && <Badge variant="outline" className="text-xs bg-gray-500/10 text-slate-700 border-gray-400/30"><Briefcase className="w-3 h-3 mr-1" /> {note.project}</Badge>}
            {note.assigned_to && <Badge variant="outline" className="text-xs bg-gray-500/10 text-slate-700 border-gray-400/30"><Users className="w-3 h-3 mr-1" /> {note.assigned_to}</Badge>}
          </div>
          
          <div className="flex justify-between items-center mt-3 text-xs text-slate-500">
            {note.due_date ? (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Due {format(parseISO(note.due_date), 'MMM d, yyyy')}</span>
              </div>
            ) : <div />}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onArchive(note.id)}
              className="p-1 h-auto text-slate-500 hover:text-slate-700 hover:bg-white/20"
            >
              <Archive className="w-3.5 h-3.5 mr-1" />
              Archive
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}