import React from 'react';
import { motion } from 'framer-motion';
import StickyNoteCard from './StickyNoteCard';
import { format, isPast, isToday } from 'date-fns';
import { Clock, CheckCircle, Flag, Info } from 'lucide-react';

const TimelineItem = ({ note, onUpdate, onDelete, onArchive, isLeft, index, onFocusNote }) => {
    
    const getStatusInfo = () => {
        if (note.status === 'completed') {
            return { color: 'bg-green-500', icon: <CheckCircle className="w-5 h-5 text-white" /> };
        }
        if (!note.due_date) {
            return { color: 'bg-slate-400', icon: <Info className="w-5 h-5 text-white" /> };
        }
        if (isPast(new Date(note.due_date)) && !isToday(new Date(note.due_date))) {
            return { color: 'bg-red-500', icon: <Clock className="w-5 h-5 text-white" /> };
        }
        if (isToday(new Date(note.due_date))) {
            return { color: 'bg-orange-500', icon: <Flag className="w-5 h-5 text-white" /> };
        }
        return { color: 'bg-blue-500', icon: <Clock className="w-5 h-5 text-white" /> };
    };

    const { color, icon } = getStatusInfo();
    
    const itemVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { delay: index * 0.1, duration: 0.5 } }
    };
    
    const cardContent = (
        <div className="w-full">
            <p className="text-sm font-semibold text-slate-500 mb-2">
                {note.due_date ? format(new Date(note.due_date), 'MMMM d, yyyy') : 'No Due Date'}
            </p>
            <StickyNoteCard
                note={{ ...note, width: '100%', height: 'auto' }}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onArchive={onArchive}
                style={{ position: 'relative', width: '100%', minHeight: 180 }}
                onFocusNote={onFocusNote}
            />
        </div>
    );
    
    return (
        <motion.div variants={itemVariants} className="relative flex justify-center md:justify-start items-center md:even:justify-end">
            <div className="w-full md:w-1/2 md:pr-8 md:even:order-2 md:even:pr-0 md:even:pl-8">
              {cardContent}
            </div>
            
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center ${color} shadow-lg`}>
                {icon}
            </div>
        </motion.div>
    );
};

export default function TimelineView({ notes, onUpdate, onDelete, onArchive, onFocusNote }) {
    const sortedNotes = [...notes].sort((a, b) => {
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
    });

    return (
        <div className="relative container mx-auto px-4 py-8">
            <div className="absolute top-0 left-1/2 w-0.5 h-full bg-slate-200 -translate-x-1/2 hidden md:block"></div>
            <motion.div 
                initial="hidden"
                animate="visible"
                className="space-y-12"
            >
                {sortedNotes.map((note, index) => (
                    <TimelineItem
                        key={note.id}
                        note={note}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        onArchive={onArchive}
                        isLeft={index % 2 === 0}
                        index={index}
                        onFocusNote={onFocusNote}
                    />
                ))}
            </motion.div>
        </div>
    );
}