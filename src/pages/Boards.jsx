
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Board as BoardModel } from '@/api/entities';
import { StickyNote } from '@/api/entities';
import { User as UserModel } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  StickyNote as StickyNoteIcon, 
  Calendar,
  Trash2,
  Edit3,
  ArrowRight,
  BookOpen // Added for student mode
} from 'lucide-react';
import { format } from 'date-fns';
import GlobalAIAssistant from '../components/board/GlobalAIAssistant';
import FloatingAIAssistantButton from '../components/board/FloatingAIAssistantButton';

export default function Boards() {
  const [boards, setBoards] = useState([]);
  const [boardStats, setBoardStats] = useState({});
  const [allNotes, setAllNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [newBoardName, setNewBoardName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [audienceMode, setAudienceMode] = useState('professional');
  const navigate = useNavigate();

  useEffect(() => {
    loadBoardsAndStats();
    
    // Check for payment success
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('payment') === 'success') {
      // Show a success message or animation
      console.log('Payment successful! Welcome to AImpress Pro!');
      // Clean up URL
      urlParams.delete('payment');
      const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  const loadBoardsAndStats = async () => {
    try {
      const user = await UserModel.me();
      setCurrentUser(user);

      const savedUserType = localStorage.getItem(`stickyboard-user-type-${user.email}`);
      setAudienceMode(savedUserType || 'professional');

      const fetchedBoards = await BoardModel.filter({ owner_email: user.email }, '-updated_date');
      setBoards(fetchedBoards);

      const allUserNotes = await StickyNote.filter({ created_by: user.email, is_archived: false }, '-updated_date');
      setAllNotes(allUserNotes);

      const stats = {};
      for (const board of fetchedBoards) {
        const notes = await StickyNote.filter({ board_id: board.id, is_archived: false });
        stats[board.id] = {
          totalNotes: notes.length,
          completedNotes: notes.filter(n => n.status === 'completed').length,
          urgentNotes: notes.filter(n => n.priority === 'urgent').length
        };
      }
      setBoardStats(stats);
    } catch (error) {
      console.error('Error loading boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async () => {
    if (!newBoardName.trim() || !currentUser) return;
    
    setIsCreating(true);
    try {
      const newBoard = await BoardModel.create({
        name: newBoardName.trim(),
        owner_email: currentUser.email
      });
      
      setBoards(prev => [newBoard, ...prev]);
      setBoardStats(prev => ({ ...prev, [newBoard.id]: { totalNotes: 0, completedNotes: 0, urgentNotes: 0 } }));
      setNewBoardName('');
      navigate(createPageUrl(`Board?board_id=${newBoard.id}`));
    } catch (error) {
      console.error('Error creating board:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const deleteBoard = async (boardId) => {
    if (!confirm('Are you sure you want to delete this board and all its notes? This action is permanent.')) return;

    try {
      const notes = await StickyNote.filter({ board_id: boardId });
      await Promise.all(notes.map(note => StickyNote.delete(note.id)));
      await BoardModel.delete(boardId);
      
      setBoards(prev => prev.filter(b => b.id !== boardId));
      setBoardStats(prev => { const newStats = { ...prev }; delete newStats[boardId]; return newStats; });
      setAllNotes(prev => prev.filter(n => n.board_id !== boardId));
    } catch (error) {
      console.error('Error deleting board:', error);
      alert('Failed to delete board. Please try again.');
    }
  };

  const handleAIActions = async (action, noteId, updates) => {
    try {
      if (action === 'update') await StickyNote.update(noteId, updates);
      else if (action === 'archive') await StickyNote.update(noteId, { is_archived: true });
      else if (action === 'delete') await StickyNote.delete(noteId);
      await loadBoardsAndStats();
    } catch (error) {
      console.error(`Error performing AI action '${action}':`, error);
    }
  };

  const openBoard = (boardId) => {
    localStorage.setItem('last_board_id', boardId);
    navigate(createPageUrl(`Board?board_id=${boardId}`));
  };

  const getUIContent = () => {
    if (audienceMode === 'student') {
      return {
        pageTitle: 'My Study Subjects',
        pageDescription: `Organize your notes across different subjects • ${allNotes.length} total notes`,
        createPlaceholder: 'Enter new subject name...',
        createButtonText: 'Create Subject',
        createCardClass: 'from-amber-500/10 to-orange-500/10 border-amber-300/30',
        createIconBg: 'from-amber-500 to-orange-500',
        createButtonClass: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
        noItemsTitle: 'No Subjects Yet',
        noItemsDescription: 'Create your first subject to organize your class notes and assignments.',
        noItemsIcon: <BookOpen className="w-12 h-12 text-amber-300" />,
        openButtonText: 'Open Subject',
        stats: { notes: 'Study Notes', done: 'Reviewed', urgent: 'Urgent' },
        statsColors: { notes: 'text-amber-300', done: 'text-green-300', urgent: 'text-red-400' }
      };
    }
    return {
      pageTitle: 'My Boards',
      pageDescription: `Organize your work across multiple boards • ${allNotes.length} total notes`,
      createPlaceholder: 'Enter board name...',
      createButtonText: 'Create Board',
      createCardClass: 'from-blue-500/10 to-indigo-500/10 border-blue-300/30',
      createIconBg: 'from-blue-500 to-indigo-600',
      createButtonClass: 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
      noItemsTitle: 'No Boards Yet',
      noItemsDescription: 'Create your first board to get started with organizing your notes.',
      noItemsIcon: <StickyNoteIcon className="w-12 h-12 text-blue-300" />,
      openButtonText: 'Open Board',
      stats: { notes: 'Notes', done: 'Done', urgent: 'Urgent' },
      statsColors: { notes: 'text-blue-300', done: 'text-green-300', urgent: 'text-red-400' }
    };
  };

  const uiContent = getUIContent();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading your boards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6 relative text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{uiContent.pageTitle}</h1>
          <p className="text-white/70">{uiContent.pageDescription}</p>
        </div>

        {/* Create New Board/Subject */}
        <Card className={`mb-8 bg-gradient-to-r ${uiContent.createCardClass} border border-white/20 backdrop-blur-md`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-gradient-to-r ${uiContent.createIconBg} rounded-xl flex items-center justify-center shadow-lg`}>
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <Input
                  placeholder={uiContent.createPlaceholder}
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createBoard()}
                  className="text-lg bg-white/50 border-white/30 placeholder:text-slate-500 focus:bg-white/70 focus:border-white/40 text-slate-900 font-medium"
                />
              </div>
              <Button 
                onClick={createBoard}
                disabled={!newBoardName.trim() || isCreating}
                className={`${uiContent.createButtonClass} text-white shadow-lg`}
              >
                {isCreating ? 'Creating...' : uiContent.createButtonText}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Boards Grid */}
        {boards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center bg-white/10`}>
              {uiContent.noItemsIcon}
            </div>
            <h2 className="text-2xl font-semibold mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{uiContent.noItemsTitle}</h2>
            <p className="text-white/80" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{uiContent.noItemsDescription}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board, index) => {
              const stats = boardStats[board.id] || { totalNotes: 0, completedNotes: 0, urgentNotes: 0 };
              
              return (
                <motion.div
                  key={board.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-300 cursor-pointer group shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className={`text-lg font-semibold transition-colors text-white`}>
                          {board.name}
                        </CardTitle>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newName = prompt('Enter new name:', board.name);
                              if (newName && newName.trim()) {
                                BoardModel.update(board.id, { name: newName.trim() });
                                setBoards(prev => prev.map(b => 
                                  b.id === board.id ? { ...b, name: newName.trim() } : b
                                ));
                              }
                            }}
                            className="h-8 w-8 p-0 text-white/80 hover:bg-white/20 hover:text-white"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteBoard(board.id);
                            }}
                            className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/30 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent 
                      className="pt-0 cursor-pointer"
                      onClick={() => openBoard(board.id)}
                    >
                      {/* Stats */}
                      <div className="flex gap-4 mb-4">
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${uiContent.statsColors.notes}`}>{stats.totalNotes}</div>
                          <div className="text-xs text-white/70">{uiContent.stats.notes}</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${uiContent.statsColors.done}`}>{stats.completedNotes}</div>
                          <div className="text-xs text-white/70">{uiContent.stats.done}</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${uiContent.statsColors.urgent}`}>{stats.urgentNotes}</div>
                          <div className="text-xs text-white/70">{uiContent.stats.urgent}</div>
                        </div>
                      </div>

                      {/* Last Updated */}
                      <div className="flex items-center justify-between text-xs text-white/60 mb-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Updated {format(new Date(board.updated_date), 'MMM d, yyyy')}</span>
                        </div>
                      </div>

                      {/* Open Button */}
                      <Button 
                        className={`w-full bg-white/20 hover:bg-white/30 text-white shadow-md`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openBoard(board.id);
                        }}
                      >
                        <span>{uiContent.openButtonText}</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Assistant Button - Only show if there are notes */}
      {allNotes.length > 0 && (
        <FloatingAIAssistantButton
          onClick={() => setShowAIAssistant(true)}
          audienceMode={audienceMode}
        />
      )}

      {/* AI Assistant Modal */}
      <GlobalAIAssistant
        notes={allNotes}
        boards={boards}
        onExecuteAction={handleAIActions}
        isVisible={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        audienceMode={audienceMode}
      />
    </div>
  );
}
