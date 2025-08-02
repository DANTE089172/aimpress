
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, X, Loader2, Brain, SendHorizontal, Archive, Trash2, GraduationCap } from 'lucide-react';
import { InvokeLLM } from '@/api/integrations';

const AIMessage = ({ content, onExecuteSuggestion, onApplyAll, notes, boards, audienceMode }) => {
  const { responseText, suggestions } = content;

  const getActionProps = (action) => {
    const baseActions = {
      archive: { text: 'Archive Note', icon: <Archive className="w-3 h-3 mr-1" />, className: 'bg-yellow-600 hover:bg-yellow-700 text-white' },
      delete: { text: 'Delete Note', icon: <Trash2 className="w-3 h-3 mr-1" />, className: 'bg-red-600 hover:bg-red-700 text-white' },
      update: { text: 'Apply Change', icon: <Sparkles className="w-3 h-3 mr-1" />, className: 'bg-blue-600 hover:bg-blue-700 text-white' }
    };

    if (audienceMode === 'student') {
      return {
        archive: { text: '📚 Archive Study Note', icon: <Archive className="w-3 h-3 mr-1" />, className: 'bg-amber-600 hover:bg-amber-700 text-white' },
        delete: { text: '🗑️ Remove Note', icon: <Trash2 className="w-3 h-3 mr-1" />, className: 'bg-red-600 hover:bg-red-700 text-white' },
        update: { text: '✏️ Update Study Note', icon: <Sparkles className="w-3 h-3 mr-1" />, className: 'bg-green-600 hover:bg-green-700 text-white' }
      }[action] || baseActions.update;
    }

    return baseActions[action] || baseActions.update;
  };

  return (
    <div className="flex items-start gap-3">
      <div className={`
        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg
        ${audienceMode === 'student' ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-purple-500 to-pink-500'}
      `}>
        {audienceMode === 'student' ? <GraduationCap className="w-5 h-5 text-white" /> : <Brain className="w-5 h-5 text-white" />}
      </div>
      <div className="flex-1 space-y-3">
        {responseText && (
          <div className={`rounded-xl p-3 text-white text-sm bg-white/10 backdrop-blur-sm border border-white/10`} 
               dangerouslySetInnerHTML={{ __html: responseText.replace(/\n/g, '<br />') }}>
          </div>
        )}
        
        {suggestions && suggestions.length > 0 && (
          <Card className={`border-white/20 bg-black/20 backdrop-blur-md`}>
            <CardHeader className="p-3 border-b border-white/20">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-semibold text-white">
                  {audienceMode === 'student' ? '🎯 Study Suggestions' : 'AI Suggestions'}
                </CardTitle>
                {onApplyAll && (
                  <Button size="xs" onClick={onApplyAll} className={
                    audienceMode === 'student' 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }>
                    {audienceMode === 'student' ? '✅ Apply All' : 'Apply All'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-3 space-y-2 max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => {
                const note = notes.find(n => n.id === suggestion.noteId);
                const board = boards.find(b => b.id === note?.board_id);
                const actionProps = getActionProps(suggestion.action);
                return (
                  <div key={index} className={`p-2 rounded-lg text-xs bg-white/5 border border-white/10`}>
                    <p className="font-bold text-white/90">{note?.title || 'Note'}</p>
                    <p className="text-white/60 text-xs">
                      {audienceMode === 'student' ? '📖 Study board: ' : 'On board: '}
                      <span className="font-semibold">{board?.name || 'Unknown'}</span>
                    </p>
                    <p className="text-white/80 my-1">{suggestion.reason}</p>
                    {suggestion.action === 'update' && suggestion.changes && (
                      <div className="flex flex-wrap gap-1 my-1">
                        {Object.entries(suggestion.changes).map(([key, value]) => (
                          <Badge key={key} variant="outline" className={
                            audienceMode === 'student' 
                              ? 'bg-green-500/20 text-green-300 text-xs border-green-400/30' 
                              : 'bg-purple-500/20 text-purple-300 text-xs border-purple-400/30'
                          }>
                            {key}: {String(value)}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <Button size="xs" onClick={() => onExecuteSuggestion(suggestion)} className={`mt-1 ${actionProps.className} shadow-lg`}>
                      {actionProps.icon} {actionProps.text}
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default function GlobalAIAssistant({ notes, boards, onExecuteAction, isVisible, onClose, audienceMode }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (isVisible) {
      const welcomeMessage = audienceMode === 'student' 
        ? `Hello! I'm your AI Study Assistant! 🎓 I can help you organize your study notes, identify key concepts, and keep your learning on track. What can I help you study today?`
        : `Hello! I'm your AI Board Assistant. I can see all your boards and help you organize your work. How can I help?`;
        
      setMessages([
        {
          role: 'assistant',
          content: { responseText: welcomeMessage }
        }
      ]);
    }
  }, [isVisible, audienceMode]);
  
  useEffect(() => {
    if (scrollContainerRef.current) {
      setTimeout(() => {
        scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = { role: 'user', content: { responseText: input } };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    
    try {
      const notesContext = notes.map(note => ({
        id: note.id,
        boardName: boards.find(b => b.id === note.board_id)?.name || 'Unknown',
        title: note.title,
        content: note.content?.replace(/<[^>]*>?/gm, ' ').substring(0, 100) || '',
        category: note.category,
        priority: note.priority,
        status: note.status,
      }));

      const systemPrompt = audienceMode === 'student' 
        ? `You are a helpful AI study assistant for a student using a digital notebook app. You should:
        - Use encouraging, supportive language
        - Focus on learning and academic success
        - Suggest study-focused organization (by subject, deadline, difficulty)
        - Use student-friendly terminology and emojis
        - Help identify key concepts, review materials, and study priorities
        - When suggesting actions, explain how they help with studying
        
        Available actions: 'update' (to modify notes), 'archive' (to move completed study materials), 'delete' (to remove irrelevant notes)
        
        Current study notes:
        ${JSON.stringify(notesContext, null, 2)}
        
        Student request: "${input}"`
        : `You are a helpful AI assistant for a sticky note app.
        Here are the current notes across all boards:
        ${JSON.stringify(notesContext, null, 2)}

        User request: "${input}"`;

      const response = await InvokeLLM({
        prompt: systemPrompt + `
        
        Provide a conversational response. If applicable, provide actionable suggestions. 
        Possible actions are 'update', 'archive', or 'delete'.
        For duplicates, suggest archiving or deleting one of the notes. 
        For updates, provide the 'changes' object. For archive or delete, 'changes' can be null.
        Always mention which board a note is on if you refer to it.`,
        response_json_schema: {
          type: "object",
          properties: {
            responseText: { type: "string", description: "A friendly, conversational response to the user's prompt." },
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string", enum: ["update", "archive", "delete"], description: "The action to perform." },
                  noteId: { type: "string" },
                  changes: { type: "object", description: "Key-value pairs of properties to update. Null for non-update actions." },
                  reason: { type: "string", description: "Why you are suggesting this change." }
                },
                required: ["action", "noteId", "reason"]
              }
            }
          },
          required: ["responseText"]
        }
      });

      if (response) {
        const assistantMessage = { role: 'assistant', content: response };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('AI request failed:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: { 
          responseText: audienceMode === 'student' 
            ? "Sorry, I had trouble connecting! Let me try again - I'm here to help with your studies! 📚" 
            : "Sorry, I had trouble connecting. Please try again." 
        } 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeSuggestion = (suggestion) => {
    onExecuteAction(suggestion.action, suggestion.noteId, suggestion.changes);
  };
  
  const executeAllSuggestions = (suggestions) => {
    suggestions.forEach(s => executeSuggestion(s));
  };

  const quickPrompts = audienceMode === 'student' 
    ? [
        "📚 Organize my study notes by subject",
        "⏰ What should I review today?",
        "🔍 Find duplicate study materials",
        "📈 Show my study progress"
      ]
    : [
        "Summarize all my boards",
        "What are my top 3 urgent tasks?",
        "Find duplicate notes",
        "Suggest categories for uncategorized notes"
      ];

  const getUIContent = () => {
    if (audienceMode === 'student') {
      return {
        title: 'AI Study Assistant',
        subtitle: 'Your personal learning companion',
        placeholder: 'Ask me about your study notes, subjects, or learning goals...',
        headerColor: 'from-amber-600 to-orange-600',
        processingText: 'Analyzing your study materials...'
      };
    }
    return {
      title: 'AI Board Assistant',
      subtitle: 'Your cross-board productivity partner',
      placeholder: 'Ask the AI about anything on your boards...',
      headerColor: 'from-blue-600 to-indigo-600',
      processingText: 'Thinking across all boards...'
    };
  };

  const uiContent = getUIContent();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl h-[80vh] bg-slate-900/50 backdrop-blur-2xl border border-white/20 rounded-xl shadow-2xl flex flex-col overflow-hidden text-white"
          >
            {/* Header - Fixed */}
            <div className={`flex-shrink-0 p-4 border-b border-white/20 bg-black/20`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${uiContent.headerColor} rounded-xl flex items-center justify-center shadow-lg`}>
                    {audienceMode === 'student' ? <GraduationCap className="w-5 h-5 text-white" /> : <Sparkles className="w-5 h-5 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{uiContent.title}</h3>
                    <p className="text-sm text-white/70">{uiContent.subtitle}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} className="text-white/70 hover:bg-white/10 hover:text-white">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages - Scrollable */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-4"
              style={{ maxHeight: 'calc(80vh - 180px)' }}
              ref={scrollContainerRef}
            >
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'user' ? (
                    <div className={`text-white rounded-xl p-3 max-w-md text-sm shadow-md ${
                      audienceMode === 'student' ? 'bg-gradient-to-r from-green-500 to-teal-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                    }`}>
                      {msg.content.responseText}
                    </div>
                  ) : (
                    <AIMessage 
                      content={msg.content} 
                      notes={notes}
                      boards={boards}
                      onExecuteSuggestion={executeSuggestion}
                      onApplyAll={msg.content.suggestions ? () => executeAllSuggestions(msg.content.suggestions) : null}
                      audienceMode={audienceMode}
                    />
                  )}
                </div>
              ))}
              {isProcessing && (
                 <div className="flex justify-start">
                   <div className="flex items-start gap-3">
                     <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                       audienceMode === 'student' 
                         ? 'bg-gradient-to-br from-amber-400 to-orange-500' 
                         : 'bg-gradient-to-br from-purple-500 to-pink-500'
                     }`}>
                        {audienceMode === 'student' ? <GraduationCap className="w-5 h-5 text-white" /> : <Brain className="w-5 h-5 text-white" />}
                     </div>
                     <div className={`rounded-xl p-3 text-white text-sm flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10`}>
                       <Loader2 className="w-4 h-4 animate-spin" />
                       <span>{uiContent.processingText}</span>
                     </div>
                   </div>
                 </div>
              )}
            </div>
            
            {/* Input Area - Fixed */}
            <div className={`flex-shrink-0 p-4 border-t border-white/20 bg-black/20`}>
               <div className="flex flex-wrap gap-2 mb-3">
                {quickPrompts.map((p, i) => (
                  <Button key={i} size="xs" variant="outline" onClick={() => setInput(p)} className="text-xs bg-white/5 border-white/20 hover:bg-white/10 text-white/80 hover:text-white">
                    {p}
                  </Button>
                ))}
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={uiContent.placeholder}
                  className="flex-1 bg-white/10 border-white/20 placeholder:text-white/50"
                  disabled={isProcessing}
                />
                <Button type="submit" disabled={isProcessing || !input.trim()} className={`flex-shrink-0 shadow-lg ${
                  audienceMode === 'student' 
                    ? 'bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
                }`}>
                  <SendHorizontal className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
