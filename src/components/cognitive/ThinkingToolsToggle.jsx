import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Grid3x3, Target, Layers } from 'lucide-react';

export default function ThinkingToolsToggle({ 
  isActive, 
  onToggle, 
  framework, 
  onFrameworkChange, 
  audienceMode 
}) {
  const frameworks = [
    {
      id: 'eisenhower',
      name: audienceMode === 'student' ? '📋 Important vs Urgent' : 'Eisenhower Matrix',
      icon: Target,
      description: audienceMode === 'student' ? 'Sort by how urgent and important things are!' : 'Urgent vs Important quadrants'
    },
    {
      id: 'decision',
      name: audienceMode === 'student' ? '🎯 Easy vs Hard' : 'Decision Matrix',
      icon: Layers,
      description: audienceMode === 'student' ? 'Find the easy wins and big projects!' : 'Effort vs Impact analysis'
    }
  ];

  const currentFramework = frameworks.find(f => f.id === framework) || frameworks[0];
  const Icon = currentFramework.icon;

  return (
    <div className="flex items-center gap-2">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => onToggle(!isActive)}
          variant="outline"
          size="sm"
          className={`h-9 hover:bg-slate-50 transition-all ${isActive ? 'bg-slate-100 ring-2 ring-blue-400' : ''}`}
        >
          <Brain className="w-4 h-4 mr-2" />
          {audienceMode === 'student' ? 'Thinking Tools' : 'Framework View'}
        </Button>
      </motion.div>

      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2"
        >
          <Select value={framework} onValueChange={onFrameworkChange}>
            <SelectTrigger className="w-48 bg-white shadow-sm border h-9">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {currentFramework.name}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {frameworks.map((f) => {
                const FIcon = f.icon;
                return (
                  <SelectItem key={f.id} value={f.id}>
                    <div className="flex items-center gap-3 py-1">
                      <FIcon className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{f.name}</div>
                        <div className="text-xs text-slate-500">{f.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </motion.div>
      )}
    </div>
  );
}