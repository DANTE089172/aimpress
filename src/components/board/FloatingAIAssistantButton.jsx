import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function FloatingAIAssistantButton({ onClick, audienceMode }) {
  const buttonColors = audienceMode === 'student'
    ? 'from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
    : 'from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700';

  return (
    <motion.div
      initial={{ scale: 0, y: 100 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 150, damping: 20, delay: 0.5 }}
      whileHover={{ scale: 1.1 }}
      className="fixed bottom-8 right-8 z-50"
    >
      <Button
        onClick={onClick}
        className={`rounded-full h-16 w-16 shadow-2xl bg-gradient-to-r ${buttonColors} text-white border-2 border-white/20`}
        aria-label="Open AI Assistant"
      >
        <Sparkles className="w-8 h-8" />
      </Button>
    </motion.div>
  );
}