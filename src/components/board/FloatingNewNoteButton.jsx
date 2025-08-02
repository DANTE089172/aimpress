import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

export default function FloatingNewNoteButton({ onCreateNote, onHide, dragConstraintsRef }) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      drag
      dragConstraints={dragConstraintsRef}
      dragMomentum={false}
      initial={{ y: window.innerHeight - 150, x: 50, scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="fixed z-50 cursor-grab"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
    >
      <div className="relative">
        <Button
          onClick={onCreateNote}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl rounded-full h-16 w-16 flex items-center justify-center transition-all duration-300 hover:scale-105"
          aria-label="Create New Note"
        >
          <Plus className="w-8 h-8" />
        </Button>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.5 }}
          className="absolute -top-2 -right-2"
        >
          <Button
            size="sm"
            variant="destructive"
            onClick={onHide}
            className="rounded-full h-6 w-6 p-0 bg-red-500 hover:bg-red-600"
            aria-label="Hide New Note button"
          >
            <X className="w-3 h-3" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}