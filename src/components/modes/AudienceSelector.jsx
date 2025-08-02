import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Briefcase, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AudienceSelector({ currentMode, onModeChange, simplified = false }) {
  const modes = [
    {
      id: 'professional',
      name: 'Professional',
      icon: Briefcase,
      description: 'AI-powered workspace for business productivity',
      colors: 'from-purple-600 to-indigo-700',
      features: ['AI Analytics', 'Smart Organization', 'Workflow Optimization'],
      tone: 'Streamlined productivity with intelligent insights'
    },
    {
      id: 'student',
      name: 'Student',
      icon: GraduationCap,
      description: 'AI study companion for academic excellence',
      colors: 'from-emerald-500 to-teal-600',
      features: ['Study Optimization', 'AI Learning Coach', 'Smart Reviews'],
      tone: 'Learn smarter with AI-powered study tools'
    }
  ];

  if (simplified) {
    return (
      <div className="flex flex-col space-y-4">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = currentMode === mode.id;
          return (
            <Button
              key={mode.id}
              variant={isActive ? 'default' : 'outline'}
              className={`h-auto p-4 justify-start ${isActive ? `bg-gradient-to-r ${mode.colors} text-white` : ''}`}
              onClick={() => onModeChange(mode.id)}
            >
              <Icon className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-semibold">{mode.name}</div>
                <div className="font-normal text-xs opacity-80">{mode.description}</div>
              </div>
            </Button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Welcome to <span className="text-purple-600">AI</span>mpress Notes
          </h1>
          <h2 className="text-2xl font-semibold text-slate-600 mb-6">
            Who's using this app?
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Choose your profile to get a personalized AI-powered experience designed to impress with intelligent organization and insights.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {modes.map((mode, index) => {
            const Icon = mode.icon;
            const isActive = currentMode === mode.id;
            
            return (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-300 h-full ${
                    isActive 
                      ? 'ring-4 ring-purple-400 shadow-2xl bg-white' 
                      : 'hover:shadow-xl bg-white/80 hover:bg-white'
                  }`}
                  onClick={() => onModeChange(mode.id)}
                >
                  <CardContent className="p-8">
                    <div className="flex flex-col items-center text-center space-y-6">
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${mode.colors} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">
                          I'm a {mode.name}
                        </h3>
                        <p className="text-slate-600 mb-4">{mode.description}</p>
                        <p className="text-sm italic text-slate-500">{mode.tone}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 justify-center">
                        {mode.features.map((feature, featureIndex) => (
                          <Badge 
                            key={featureIndex} 
                            variant="outline" 
                            className="text-xs bg-slate-50 border-slate-200"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button
                        className={`w-full py-3 text-lg font-semibold transition-all duration-300 ${
                          isActive
                            ? `bg-gradient-to-r ${mode.colors} text-white shadow-lg`
                            : `bg-gradient-to-r ${mode.colors} hover:shadow-lg text-white`
                        }`}
                      >
                        {isActive ? '✓ Selected' : 'Choose This'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}