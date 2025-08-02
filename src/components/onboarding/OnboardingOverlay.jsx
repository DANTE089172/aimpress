import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, MousePointer, Palette, Archive } from 'lucide-react';

export default function OnboardingOverlay({ isVisible, onComplete }) {
  const [currentStep, setCurrentStep] = React.useState(0);

  const steps = [
    {
      icon: Sparkles,
      title: "Welcome to AImpress Notes",
      description: "Create impressive, AI-powered sticky notes that intelligently organize your thoughts and boost your productivity beyond expectations.",
      color: "from-purple-500 to-indigo-600"
    },
    {
      icon: MousePointer,
      title: "Intelligent Drag & Drop",
      description: "Drag notes anywhere with AI learning your patterns. Watch as the system suggests optimal layouts and organization strategies.",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: Palette,
      title: "Smart Categorization",
      description: "Set colors, priorities, and content while AI automatically categorizes and suggests improvements to impress with your organization.",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: Archive,
      title: "Impress with Intelligence",
      description: "Archive notes and let AI analyze patterns, track progress, and maintain a workspace that truly impresses colleagues and collaborators.",
      color: "from-orange-500 to-red-600"
    }
  ];

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <Card className="w-full max-w-lg bg-white/95 backdrop-blur-md shadow-2xl border-0">
              <CardContent className="p-8 text-center">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-r ${currentStepData.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-slate-800 mb-4">
                    {currentStepData.title}
                  </h2>
                  
                  <p className="text-slate-600 text-lg leading-relaxed mb-8">
                    {currentStepData.description}
                  </p>
                </motion.div>

                {/* Progress Indicators */}
                <div className="flex justify-center space-x-2 mb-8">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index <= currentStep ? 'bg-purple-600' : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    Skip Tour
                  </Button>
                  
                  <Button
                    onClick={handleNext}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 shadow-lg"
                  >
                    {currentStep < steps.length - 1 ? 'Next' : 'Start Impressing'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}