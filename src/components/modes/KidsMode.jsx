import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Trophy, Sparkles, Heart } from 'lucide-react';

export default function KidsMode({ children, notesCount, completedCount }) {
  const progress = Math.min(Math.floor((completedCount / 5) * 100), 100);
  const stars = Math.floor(completedCount / 5);
  
  const encouragingMessages = [
    "Great job organizing! 🌟",
    "You're doing amazing! 🎉",
    "Keep up the awesome work! 🚀",
    "You're a super organizer! ⭐",
    "Fantastic progress! 🎊"
  ];
  
  const currentMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];

  return (
    <div className="kids-mode-wrapper">
      <style>{`
        .kids-mode-wrapper {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }
        
        .kids-mode-wrapper .sticky-note-card {
          transform: scale(1.1);
          border-radius: 20px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1) !important;
          border: 3px solid rgba(255,255,255,0.5) !important;
        }
        
        .kids-mode-wrapper button {
          border-radius: 15px !important;
          font-weight: 600 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
        }
        
        .kids-bounce {
          animation: kidsBounce 2s infinite;
        }
        
        @keyframes kidsBounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        .kids-sparkle {
          animation: kidsSparkle 1.5s infinite;
        }
        
        @keyframes kidsSparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
      `}</style>
      
      {/* Progress Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6"
      >
        <Card className="bg-white/90 backdrop-blur-md border-0 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div 
                  className="kids-bounce"
                  whileHover={{ scale: 1.1 }}
                >
                  <Trophy className="w-12 h-12 text-yellow-500" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-purple-800">
                    Hey there, Super Organizer! 🎯
                  </h2>
                  <p className="text-purple-600 text-lg">{currentMessage}</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex space-x-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className={`kids-sparkle ${i < stars ? 'text-yellow-400' : 'text-gray-300'}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Star className="w-8 h-8 fill-current" />
                    </motion.div>
                  ))}
                </div>
                <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-lg px-4 py-2">
                  {stars} ⭐ Stars Earned!
                </Badge>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm font-semibold text-purple-700 mb-2">
                <span>Progress to next star</span>
                <span>{completedCount % 5}/5 notes</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-4 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedCount % 5) * 20}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Achievement Notifications */}
      {completedCount > 0 && completedCount % 5 === 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
        >
          <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-2xl">
            <CardContent className="p-8 text-center">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.6, repeat: 2 }}
              >
                <Trophy className="w-16 h-16 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">🎉 AWESOME! 🎉</h3>
              <p className="text-lg">You earned a new star!</p>
              <Badge className="mt-3 bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                ⭐ Star #{stars}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      {/* Fun Floating Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute kids-sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            <Sparkles className="w-6 h-6 text-yellow-300" />
          </motion.div>
        ))}
      </div>
      
      {/* Main Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}