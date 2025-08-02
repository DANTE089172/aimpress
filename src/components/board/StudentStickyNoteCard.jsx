
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
  Book, 
  Tag, 
  Flag, 
  CheckSquare, 
  Clock, 
  Users 
} from 'lucide-react';
import 'react-quill/dist/quill.snow.css'; // Keep Quill CSS for ql-editor styles

// Define color classes for the card backgrounds
const colorClasses = {
  yellow: 'from-amber-400/20 to-yellow-500/20',
  blue: 'from-teal-400/20 to-cyan-500/20',
  green: 'from-lime-400/20 to-green-500/20',
  pink: 'from-fuchsia-400/20 to-pink-500/20',
  purple: 'from-violet-400/20 to-purple-500/20',
  orange: 'from-orange-400/20 to-amber-500/20'
};

// Define badge colors for priority
const badgeColors = {
  low: 'bg-green-500/10 text-green-700 border-green-400/30',
  medium: 'bg-yellow-500/10 text-yellow-700 border-yellow-400/30',
  high: 'bg-red-500/10 text-red-700 border-red-400/30',
};

export default function StudentStickyNoteCard({ note, onUpdate, onDelete, onArchive, onMouseDown, isDragging, style, onFocusNote }) {
  const theme = colorClasses[note.color] || colorClasses.yellow;
  const badgeTheme = badgeColors[note.priority] || badgeColors.low;

  // Clean content: remove empty paragraph tags often left by rich text editors
  const content = note.content ? note.content.replace(/<p><br><\/p>/g, '').trim() : '';

  return (
    <motion.div
      style={{
        ...style,
        position: 'absolute',
        left: note.position_x, // Swapped position_x and position_y as per outline
        top: note.position_y,
        width: note.width,
        height: note.height,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      className="group" // Added group class for hover effects
      layoutId={note.id} // Used for Framer Motion layout animations
    >
      <Card
        onMouseDown={onMouseDown} // Prop to handle drag start
        style={{
          width: '100%',
          height: '100%',
        }}
        className={`relative flex flex-col bg-gradient-to-br ${theme} border border-white/30 rounded-2xl shadow-lg backdrop-blur-xl text-slate-800 overflow-hidden`}
      >
        <CardHeader className="relative p-4">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-base font-bold pr-16">{note.title}</CardTitle>
            {/* Action buttons appear on hover */}
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
            // Render content using dangerouslySetInnerHTML, applying Quill's default styles
            <div className="text-sm mb-3 space-y-1 ql-snow">
              <div className="ql-editor p-0" dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {note.priority && <Badge variant="outline" className={`text-xs ${badgeTheme}`}><Flag className="w-3 h-3 mr-1" /> {note.priority}</Badge>}
            {note.status && <Badge variant="outline" className="text-xs bg-gray-500/10 text-slate-700 border-gray-400/30"><CheckSquare className="w-3 h-3 mr-1" /> {note.status}</Badge>}
            {note.category && <Badge variant="outline" className="text-xs bg-gray-500/10 text-slate-700 border-gray-400/30"><Book className="w-3 h-3 mr-1" /> {note.category}</Badge>}
            {note.tags?.map(tag => <Badge key={tag} variant="outline" className="text-xs bg-gray-500/10 text-slate-700 border-gray-400/30"><Tag className="w-3 h-3 mr-1" /> {tag}</Badge>)}
          </div>
          
          <div className="flex justify-between items-center mt-3 text-xs text-slate-500">
            {note.due_date ? (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Due {format(parseISO(note.due_date), 'MMM d, yyyy')}</span>
              </div>
            ) : <div />} {/* Empty div to maintain spacing if no due date */}
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
