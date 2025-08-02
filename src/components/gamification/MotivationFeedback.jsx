import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Award, 
  TrendingUp,
  Calendar,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

// Achievement system
const achievements = {
  student: [
    { id: 'first_note', title: '🎉 First Note!', description: 'Created your very first note!', points: 10 },
    { id: 'note_master', title: '📝 Note Master', description: 'Created 10 notes!', points: 50 },
    { id: 'organized', title: '🗂️ Super Organized', description: 'Used 5 different categories!', points: 30 },
    { id: 'priority_pro', title: '⭐ Priority Pro', description: 'Set priority on 10 notes!', points: 25 },
    { id: 'week_warrior', title: '🔥 Week Warrior', description: 'Active for 7 days straight!', points: 100 },
  ],
  professional: [
    { id: 'first_note', title: 'Getting Started', description: 'Created your first note', points: 10 },
    { id: 'productivity_boost', title: 'Productivity Boost', description: 'Completed 25 tasks this month', points: 100 },
    { id: 'organization_expert', title: 'Organization Expert', description: 'Used all category types', points: 75 },
    { id: 'priority_master', title: 'Priority Master', description: 'Maintained priority system for 30 days', points: 150 },
    { id: 'collaboration_champion', title: 'Collaboration Champion', description: 'Assigned notes to 10+ team members', points: 200 },
  ]
};

export default function MotivationFeedback({ 
  audienceMode, 
  userStats, 
  onClose, 
  isVisible = false 
}) {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    // Calculate level and points based on user stats
    const points = calculateTotalPoints(userStats);
    setTotalPoints(points);
    setCurrentLevel(Math.floor(points / 100) + 1);
    
    // Check for new achievements
    const newAchievements = checkAchievements(userStats, audienceMode);
    setUnlockedAchievements(newAchievements);
  }, [userStats, audienceMode]);

  const calculateTotalPoints = (stats) => {
    if (!stats) return 0;
    return (stats.notesCreated * 5) + 
           (stats.notesCompleted * 10) + 
           (stats.categoriesUsed * 15) + 
           (stats.daysActive * 20);
  };

  const checkAchievements = (stats, mode) => {
    const relevantAchievements = achievements[mode] || achievements.professional;
    const unlocked = [];

    relevantAchievements.forEach(achievement => {
      let isUnlocked = false;
      
      switch(achievement.id) {
        case 'first_note':
          isUnlocked = stats?.notesCreated >= 1;
          break;
        case 'note_master':
          isUnlocked = stats?.notesCreated >= 10;
          break;
        case 'organized':
          isUnlocked = stats?.categoriesUsed >= 5;
          break;
        case 'priority_pro':
          isUnlocked = stats?.prioritizedNotes >= 10;
          break;
        case 'productivity_boost':
          isUnlocked = stats?.notesCompleted >= 25;
          break;
      }
      
      if (isUnlocked) {
        unlocked.push(achievement);
      }
    });

    return unlocked;
  };

  const getProgressToNext = () => {
    const currentLevelPoints = (currentLevel - 1) * 100;
    const nextLevelPoints = currentLevel * 100;
    const progress = ((totalPoints - currentLevelPoints) / (nextLevelPoints - currentLevelPoints)) * 100;
    return Math.min(progress, 100);
  };

  const CelebrationParticle = ({ delay = 0 }) => (
    <motion.div
      className="absolute pointer-events-none"
      initial={{ 
        scale: 0,
        opacity: 1,
        x: Math.random() * 300 - 150,
        y: Math.random() * 200 - 100,
      }}
      animate={{ 
        scale: [0, 1.5, 0],
        opacity: [1, 1, 0],
        y: -100,
      }}
      transition={{ 
        duration: 2,
        delay,
        ease: "easeOut"
      }}
    >
      <Sparkles className="w-6 h-6 text-yellow-500" />
    </motion.div>
  );

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl max-h-[90vh] overflow-auto"
        >
          <Card className={`${
            audienceMode === 'student' 
              ? 'bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50' 
              : 'bg-gradient-to-br from-slate-50 to-blue-50'
          } shadow-2xl border-2`}>
            <CardHeader className="border-b">
              <CardTitle className={`text-2xl font-bold ${
                audienceMode === 'student' ? 'text-orange-900' : 'text-slate-800'
              }`}>
                {audienceMode === 'student' ? '🎮 Your Progress!' : 'Progress Dashboard'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Level and Points */}
                <div className="space-y-6">
                  <Card className={`${
                    audienceMode === 'student' ? 'bg-gradient-to-r from-green-400 to-blue-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                  } text-white`}>
                    <CardContent className="p-6 text-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Trophy className="w-16 h-16 mx-auto mb-4" />
                      </motion.div>
                      <h3 className="text-3xl font-bold">Level {currentLevel}</h3>
                      <p className="text-lg opacity-90">{totalPoints} points</p>
                      <div className="mt-4">
                        <Progress value={getProgressToNext()} className="h-3" />
                        <p className="text-sm mt-2 opacity-75">
                          {Math.ceil((currentLevel * 100) - totalPoints)} points to next level
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stats */}
                  {audienceMode === 'professional' && (
                    <Card>
                      <CardContent className="p-6">
                        <h4 className="font-semibold text-lg mb-4">Statistics</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{userStats?.notesCreated || 0}</div>
                            <div className="text-sm text-slate-600">Notes Created</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{userStats?.notesCompleted || 0}</div>
                            <div className="text-sm text-slate-600">Tasks Completed</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{userStats?.categoriesUsed || 0}</div>
                            <div className="text-sm text-slate-600">Categories Used</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{userStats?.daysActive || 0}</div>
                            <div className="text-sm text-slate-600">Active Days</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Achievements */}
                <div className="space-y-4">
                  <h4 className={`font-semibold text-lg ${
                    audienceMode === 'student' ? 'text-orange-900' : 'text-slate-800'
                  }`}>
                    {audienceMode === 'student' ? '🏆 Your Achievements!' : 'Achievements'}
                  </h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {unlockedAchievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className={`${
                          audienceMode === 'student' 
                            ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-orange-200' 
                            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <Award className={`w-8 h-8 ${
                                  audienceMode === 'student' ? 'text-orange-600' : 'text-blue-600'
                                }`} />
                              </motion.div>
                              <div className="flex-1">
                                <h5 className="font-semibold">{achievement.title}</h5>
                                <p className="text-sm opacity-75">{achievement.description}</p>
                              </div>
                              <Badge className={`${
                                audienceMode === 'student' 
                                  ? 'bg-orange-200 text-orange-800' 
                                  : 'bg-blue-200 text-blue-800'
                              }`}>
                                +{achievement.points} pts
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-center mt-8">
                <Button
                  onClick={onClose}
                  className={`${
                    audienceMode === 'student'
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
                      : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800'
                  } text-white px-8 py-3 text-lg`}
                >
                  {audienceMode === 'student' ? '🚀 Keep Going!' : 'Continue'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Celebration Effects */}
          {showCelebration && (
            <div className="fixed inset-0 pointer-events-none">
              {[...Array(10)].map((_, i) => (
                <CelebrationParticle key={i} delay={i * 0.2} />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}