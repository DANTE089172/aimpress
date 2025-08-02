import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';

export default function AICategorizeButton({ notes, onUpdateNotes, audienceMode }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState([]);

  const simulateAICategorization = async () => {
    setIsProcessing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const categorizedNotes = notes.map(note => {
      // Simulate AI analysis based on title and content
      const text = (note.title + ' ' + (note.content || '')).toLowerCase();
      
      let category, priority, tags;
      
      if (audienceMode === 'student') {
        // Student-friendly categories
        if (text.includes('homework') || text.includes('assignment') || text.includes('study')) {
          category = 'homework';
          tags = ['📚 Study'];
        } else if (text.includes('fun') || text.includes('play') || text.includes('game')) {
          category = 'fun';
          tags = ['🎨 Creative'];
        } else if (text.includes('parent') || text.includes('ask') || text.includes('help')) {
          category = 'parent';
          tags = ['👨‍👩‍👧 Family'];
        } else if (text.includes('remind') || text.includes('remember') || text.includes('don\'t forget')) {
          category = 'reminder';
          tags = ['⏰ Important'];
        } else {
          category = 'school';
          tags = ['🏫 School'];
        }

        // Student priorities
        if (text.includes('urgent') || text.includes('due tomorrow') || text.includes('test')) {
          priority = 'urgent';
        } else if (text.includes('important') || text.includes('exam') || text.includes('project')) {
          priority = 'high';
        } else if (text.includes('soon') || text.includes('this week')) {
          priority = 'medium';
        } else {
          priority = 'low';
        }
      } else {
        // Professional categories
        if (text.includes('meeting') || text.includes('call') || text.includes('discuss')) {
          category = 'meetings';
          tags = ['Meeting', 'Discussion'];
        } else if (text.includes('project') || text.includes('development') || text.includes('build')) {
          category = 'projects';
          tags = ['Project', 'Development'];
        } else if (text.includes('idea') || text.includes('brainstorm') || text.includes('concept')) {
          category = 'ideas';
          tags = ['Idea', 'Innovation'];
        } else if (text.includes('task') || text.includes('todo') || text.includes('action')) {
          category = 'todo';
          tags = ['Task', 'Action Item'];
        } else {
          category = 'work';
          tags = ['Work', 'Business'];
        }

        // Professional priorities
        if (text.includes('urgent') || text.includes('asap') || text.includes('critical')) {
          priority = 'urgent';
        } else if (text.includes('important') || text.includes('priority') || text.includes('deadline')) {
          priority = 'high';
        } else if (text.includes('moderate') || text.includes('normal')) {
          priority = 'medium';
        } else {
          priority = 'low';
        }
      }

      return {
        id: note.id,
        originalCategory: note.category,
        originalPriority: note.priority,
        suggestedCategory: category,
        suggestedPriority: priority,
        suggestedTags: tags,
        title: note.title
      };
    });

    setResults(categorizedNotes);
    setShowResults(true);
    setIsProcessing(false);
  };

  const applyAllSuggestions = async () => {
    for (const result of results) {
      await onUpdateNotes(result.id, {
        category: result.suggestedCategory,
        priority: result.suggestedPriority,
        tags: result.suggestedTags
      });
    }
    setShowResults(false);
    setResults([]);
  };

  const applySingleSuggestion = async (result) => {
    await onUpdateNotes(result.id, {
      category: result.suggestedCategory,
      priority: result.suggestedPriority,
      tags: result.suggestedTags
    });
    setResults(prev => prev.filter(r => r.id !== result.id));
  };

  return (
    <>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={simulateAICategorization}
          disabled={isProcessing || notes.length === 0}
          variant="outline"
          size="sm"
          className="h-9 hover:bg-slate-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              AI Categorize
            </>
          )}
        </Button>
      </motion.div>

      {/* Results Modal */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowResults(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[80vh] overflow-auto"
          >
            <Card className={`${
              audienceMode === 'student' 
                ? 'bg-gradient-to-br from-yellow-50 to-orange-50' 
                : 'bg-white'
            } shadow-2xl`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Wand2 className="w-8 h-8 text-purple-600" />
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800">
                        {audienceMode === 'student' ? '🤖 AI Smart Sort Results!' : 'AI Categorization Results'}
                      </h3>
                      <p className="text-slate-600">
                        {audienceMode === 'student' 
                          ? 'Look what AI found! Click to apply the smart suggestions 🎯'
                          : 'Review the AI suggestions and apply them to your notes'
                        }
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={applyAllSuggestions}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {audienceMode === 'student' ? '🌟 Apply All!' : 'Apply All Suggestions'}
                  </Button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {results.map((result, index) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-white/70 border">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-800 mb-2">
                                {result.title}
                              </h4>
                              <div className="flex flex-wrap gap-2 mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-slate-600">Category:</span>
                                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                    {result.suggestedCategory}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-slate-600">Priority:</span>
                                  <Badge variant="outline" className="bg-orange-100 text-orange-800">
                                    {result.suggestedPriority}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {result.suggestedTags.map((tag, tagIndex) => (
                                  <Badge key={tagIndex} variant="outline" className="bg-purple-100 text-purple-800 text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <Button
                              onClick={() => applySingleSuggestion(result)}
                              size="sm"
                              className="ml-4 bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              {audienceMode === 'student' ? '✅ Apply' : 'Apply'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}