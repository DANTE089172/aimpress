import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Trophy, BookOpen, Target, Zap } from 'lucide-react';

export default function StudentMode({ children, notesCount, completedCount }) {
  const progress = Math.min(Math.floor((completedCount / 10) * 100), 100);
  const level = Math.floor(completedCount / 10) + 1;
  
  const motivationalMessages = [
    "Keep up the great work! 📚",
    "You're making excellent progress! 🌟",
    "Learning never stops! 🚀",
    "Knowledge is power! 💪",
    "Stay focused, stay motivated! ⭐"
  ];
  
  const currentMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  return (
    <div className="student-mode-wrapper">
      <style>{`
        .student-mode-wrapper {
          background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
          min-height: 100vh;
          padding: 20px;
        }
        
        .student-mode-wrapper .sticky-note-card {
          border-radius: 16px !important;
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
          border: 2px solid rgba(255,255,255,0.3) !important;
        }
        
        .student-mode-wrapper button {
          border-radius: 12px !important;
          font-weight: 600 !important;
        }
        
        .student-bounce {
          animation: studentBounce 2s infinite;
        }
        
        @keyframes studentBounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px); }
          60% { transform: translateY(-4px); }
        }
        
        .student-glow {
          animation: studentGlow 2s infinite alternate;
        }
        
        @keyframes studentGlow {
          0% { box-shadow: 0 0 10px rgba(34, 197, 94, 0.5); }
          100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.8); }
        }
      `}</style>
      
      {/* Study Progress Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6"
      >
        <Card className="bg-white/95 backdrop-blur-md border-0 shadow-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div 
                  className="student-bounce"
                  whileHover={{ scale: 1.1 }}
                >
                  <BookOpen className="w-12 h-12 text-green-600" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-green-900">
                    Study Dashboard 📖
                  </h2>
                  <p className="text-green-700 text-lg">{currentMessage}</p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <motion.div 
                      className="student-glow"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Trophy className="w-10 h-10 text-yellow-500 mx-auto mb-1" />
                    </motion.div>
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm px-3 py-1">
                      Level {level}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Target className="w-10 h-10 text-blue-500 mx-auto mb-1" />
                    </motion.div>
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm px-3 py-1">
                      {completedCount} Completed
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm font-semibold text-green-800 mb-2">
                <span>Progress to next level</span>
                <span>{completedCount % 10}/10 tasks</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedCount % 10) * 10}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Achievement Notification */}
      {completedCount > 0 && completedCount % 10 === 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
        >
          <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-2xl">
            <CardContent className="p-8 text-center">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.6, repeat: 3 }}
              >
                <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">🎉 Level Up! 🎉</h3>
              <p className="text-lg">You've reached Level {level}!</p>
              <Badge className="mt-3 bg-white/20 text-white border-white/30 text-lg px-4 py-2">
                <Star className="w-4 h-4 mr-1" />
                Academic Achiever
              </Badge>
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      {/* Floating Study Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -15, 0],
              x: [0, 8, 0],
              rotate: [0, 90, 180, 270, 360],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            <Zap className="w-5 h-5 text-green-300 opacity-60" />
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