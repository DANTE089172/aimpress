import React, { useState, useEffect } from 'react';
import { StickyNote } from '@/api/entities';
import { User as UserModel } from '@/api/entities';
import { Board as BoardModel } from '@/api/entities';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  RotateCcw, 
  Trash2, 
  Search, 
  Calendar,
  FolderOpen,
  Archive as ArchiveIcon,
  AlertTriangle
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function Archive() {
  const [archivedNotes, setArchivedNotes] = useState([]);
  const [boards, setBoards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadArchivedNotes();
  }, []);

  const loadArchivedNotes = async () => {
    try {
      const user = await UserModel.me();
      
      // Load user's boards
      const userBoards = await BoardModel.filter({ owner_email: user.email });
      setBoards(userBoards);
      
      // Load archived notes
      const notes = await StickyNote.filter({ is_archived: true }, '-updated_date');
      setArchivedNotes(notes);
    } catch (err) {
      console.error('Error loading archived notes:', err);
      setError('Failed to load archived notes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const restoreNote = async (noteId) => {
    try {
      await StickyNote.update(noteId, { is_archived: false });
      setArchivedNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error restoring note:', error);
      alert('Could not restore the note. Please try again.');
    }
  };

  const deleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to permanently delete this note?')) {
      return;
    }

    try {
      await StickyNote.delete(noteId);
      setArchivedNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Could not delete the note. Please try again.');
    }
  };

  const getBoardName = (boardId) => {
    const board = boards.find(b => b.id === boardId);
    return board ? board.name : 'Unknown Board';
  };

  const filteredNotes = archivedNotes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
    getBoardName(note.board_id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const colorThemes = {
    yellow: 'border-l-yellow-500 bg-yellow-50',
    blue: 'border-l-blue-500 bg-blue-50',
    green: 'border-l-green-500 bg-green-50',
    pink: 'border-l-pink-500 bg-pink-50',
    purple: 'border-l-purple-500 bg-purple-50',
    orange: 'border-l-orange-500 bg-orange-50'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading archived notes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-700 mb-2">Error Loading Archive</h2>
          <p className="text-slate-500 mb-4">{error}</p>
          <Button onClick={loadArchivedNotes}>Try Again</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-gray-700 rounded-xl flex items-center justify-center">
              <ArchiveIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Archive</h1>
              <p className="text-slate-600">
                {filteredNotes.length} archived notes
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search archived notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64 bg-white"
            />
          </div>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-slate-200 to-gray-300 rounded-full flex items-center justify-center">
              <ArchiveIcon className="w-12 h-12 text-slate-500" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-700 mb-2">
              {searchQuery ? 'No matching notes found' : 'No archived notes'}
            </h2>
            <p className="text-slate-500">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'Archived notes will appear here when you archive them from your boards'
              }
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredNotes.map((note, index) => {
                const theme = colorThemes[note.color] || colorThemes.yellow;
                const content = note.content ? note.content.replace(/<[^>]*>/g, ' ').trim() : '';
                const boardName = getBoardName(note.board_id);
                
                return (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.02 }}
                    layout
                  >
                    <Card className={`${theme} border-l-4 hover:shadow-lg transition-all duration-200 h-full`}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-lg font-semibold text-slate-800 line-clamp-2">
                            {note.title}
                          </CardTitle>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => restoreNote(note.id)}
                              className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-700"
                              title="Restore note"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteNote(note.id)}
                              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {/* Content Preview */}
                        {content && (
                          <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                            {content}
                          </p>
                        )}

                        {/* Metadata */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                              <FolderOpen className="w-3 h-3 mr-1" />
                              {boardName}
                            </Badge>
                            {note.category && (
                              <Badge variant="outline" className="text-xs">
                                {note.category}
                              </Badge>
                            )}
                            {note.priority && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  note.priority === 'urgent' ? 'border-red-300 text-red-700' :
                                  note.priority === 'high' ? 'border-orange-300 text-orange-700' :
                                  'border-slate-300 text-slate-700'
                                }`}
                              >
                                {note.priority}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-slate-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>
                              Archived {format(parseISO(note.updated_date), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}