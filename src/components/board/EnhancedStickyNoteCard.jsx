import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, MoreVertical, Archive, Flag } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

// Enhanced color themes with depth
const colorThemes = {
  yellow: { 
    border: 'border-yellow-400', 
    bg: 'bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200', 
    header: 'text-yellow-900',
    shadow: 'shadow-yellow-200/50'
  },
  blue: { 
    border: 'border-blue-400', 
    bg: 'bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200', 
    header: 'text-blue-900',
    shadow: 'shadow-blue-200/50'
  },
  green: { 
    border: 'border-green-400', 
    bg: 'bg-gradient-to-br from-green-50 via-green-100 to-green-200', 
    header: 'text-green-900',
    shadow: 'shadow-green-200/50'
  },
  pink: { 
    border: 'border-pink-400', 
    bg: 'bg-gradient-to-br from-pink-50 via-pink-100 to-pink-200', 
    header: 'text-pink-900',
    shadow: 'shadow-pink-200/50'
  },
  purple: { 
    border: 'border-purple-400', 
    bg: 'bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200', 
    header: 'text-purple-900',
    shadow: 'shadow-purple-200/50'
  },
  orange: { 
    border: 'border-orange-400', 
    bg: 'bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200', 
    header: 'text-orange-900',
    shadow: 'shadow-orange-200/50'
  },
};

const getPriorityInfo = (priority) => {
  const priorityMap = {
    urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800 border-red-300', depth: 'shadow-lg' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-300', depth: 'shadow-md' },
    medium: { label: 'Medium', color: 'bg-blue-100 text-blue-800 border-blue-300', depth: 'shadow-sm' },
    low: { label: 'Low', color: 'bg-slate-100 text-slate-800 border-slate-300', depth: 'shadow-sm' },
  };
  return priorityMap[priority] || priorityMap.medium;
};

export default function EnhancedStickyNoteCard({
  note,
  onUpdate,
  onDelete,
  onArchive,
  onFocusNote,
  isDragging = false,
  style = {},
  audienceMode = 'professional'
}) {
  const [isHovered, setIsHovered] = useState(false);
  const theme = colorThemes[note.color] || colorThemes.yellow;
  const priorityInfo = getPriorityInfo(note.priority);

  // Clean the content for preview
  const previewContent = note.content ? note.content.replace(/<[^>]*>/g, ' ').trim() : '';
  
  // Enhanced motion variants
  const cardVariants = {
    rest: { 
      scale: 1, 
      rotateX: 0, 
      rotateY: 0,
      z: 0,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    },
    hover: { 
      scale: 1.03, 
      rotateX: 5,
      rotateY: 5,
      z: 20,
      boxShadow: '0 12px 30px rgba(0,0,0,0.25)'
    },
    drag: { 
      scale: 1.08, 
      rotateX: 10,
      rotateY: 10,
      z: 50,
      cursor: 'grabbing',
      boxShadow: '0 20px 40px rgba(0,0,0,0.35)'
    }
  };

  return (
    <motion.div
      style={{
        position: style.position || 'absolute',
        left: note.position_x,
        top: note.position_y,
        width: style.width || 280,
        height: style.height || 'auto',
        minHeight: 200,
        perspective: '1000px',
        ...style,
      }}
      variants={cardVariants}
      initial="rest"
      animate={isDragging ? "drag" : isHovered ? "hover" : "rest"}
      whileDrag="drag"
      dragMomentum={false}
      className="cursor-grab transform-gpu"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onDoubleClick={() => onFocusNote(note)}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card
        className={`
          h-full w-full flex flex-col transition-all duration-300
          ${theme.bg} border-t-4 ${theme.border} ${priorityInfo.depth}
          transform-gpu will-change-transform
        `}
      >
        {/* Header with enhanced depth */}
        <motion.div 
          className="p-3 flex items-start justify-between gap-2 border-b border-black/10 backdrop-blur-sm"
          animate={{ 
            backgroundColor: isHovered ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.6)' 
          }}
        >
          <div className="flex-1">
            <motion.h3 
              className={`font-semibold ${theme.header} text-base line-clamp-2`}
              animate={{ scale: isHovered ? 1.02 : 1 }}
            >
              {note.title}
            </motion.h3>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Badge className={`mt-2 ${priorityInfo.color} font-medium border-2 ${priorityInfo.depth}`}>
                <motion.div
                  animate={{ rotate: isHovered ? 10 : 0 }}
                  className="flex items-center"
                >
                  <Flag className="w-3 h-3 mr-1.5" />
                  {priorityInfo.label} Priority
                </motion.div>
              </Badge>
            </motion.div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-slate-500 no-drag hover:bg-white/50">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="backdrop-blur-md bg-white/90">
              <DropdownMenuItem onClick={() => onFocusNote(note)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit / View Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onArchive(note.id)}>
                <Archive className="w-4 h-4 mr-2" />
                Archive Note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(note.id)} className="text-red-600 focus:text-white focus:bg-red-500">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Permanently
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>

        {/* Content with smooth reveal */}
        <CardContent className="p-3 flex-1 overflow-hidden no-drag">
          <motion.div
            animate={{ opacity: isHovered ? 1 : 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {previewContent ? (
              <p className="text-sm text-slate-700 line-clamp-4 leading-relaxed">
                {previewContent}
              </p>
            ) : (
              <p className="text-sm text-slate-400 italic">No content. Double-click to edit.</p>
            )}
          </motion.div>
        </CardContent>

        {/* Enhanced footer with reflection data */}
        {(note.category || note.purpose || note.action_required) && (
          <motion.div 
            className="p-3 border-t border-black/10 bg-white/30 backdrop-blur-sm"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-wrap gap-1.5">
              {note.category && (
                <Badge variant="outline" className="text-xs bg-white/50 border-slate-300">
                  {note.category}
                </Badge>
              )}
              {note.purpose && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  Purpose
                </Badge>
              )}
              {note.action_required && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  Action Required
                </Badge>
              )}
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}