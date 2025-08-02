
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StickyNote } from '@/api/entities';
import { User as UserModel } from '@/api/entities';
import { Board as BoardModel } from '@/api/entities';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';

import BoardToolbar from '../components/board/BoardToolbar';
import ViewControls from '../components/board/ViewControls';
import ViewRenderer from '../components/board/ViewRenderer';
import FocusEditOverlay from '../components/board/FocusEditOverlay';
import GlobalAIAssistant from '../components/board/GlobalAIAssistant';
import FloatingAIAssistantButton from '../components/board/FloatingAIAssistantButton';

export default function Board() {
  const [notes, setNotes] = useState([]);
  const [allNotesForAI, setAllNotesForAI] = useState([]);
  const [currentBoard, setCurrentBoard] = useState(null);
  const [showGrid, setShowGrid] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedNote, setDraggedNote] = useState(null);
  const [viewMode, setViewMode] = useState('freeform');
  const [quickFilter, setQuickFilter] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const boardRef = useRef(null);
  const dragAreaRef = useRef(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [audienceMode, setAudienceMode] = useState('professional');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const boardId = new URLSearchParams(location.search).get('board_id');
    if (!boardId) {
      navigate(createPageUrl('Boards'));
      return;
    }
    
    initializeBoard(boardId);
  }, [location.search, navigate]);

  const initializeBoard = async (boardId) => {
    try {
      const user = await UserModel.me();
      setCurrentUser(user);

      // Load the specific board
      const boards = await BoardModel.filter({ owner_email: user.email });
      const board = boards.find(b => b.id === boardId);
      
      if (!board) {
        navigate(createPageUrl('Boards'));
        return;
      }
      
      setCurrentBoard(board);
      localStorage.setItem('last_board_id', boardId);

      // Load notes for this board
      const fetchedNotes = await StickyNote.filter({ 
        board_id: boardId, 
        is_archived: false 
      }, '-updated_date');
      setNotes(fetchedNotes);

      // Load all notes for AI (across all boards)
      const allNotes = await StickyNote.filter({ 
        created_by: user.email,
        is_archived: false 
      }, '-updated_date');
      setAllNotesForAI(allNotes);

      // Load user preferences
      const savedUserType = localStorage.getItem(`stickyboard-user-type-${user.email}`);
      if (savedUserType) {
        setAudienceMode(savedUserType);
      }
    } catch (error) {
      console.error('Error initializing board:', error);
      navigate(createPageUrl('Boards'));
    } finally {
      setIsLoading(false);
    }
  };

  const createNewNote = async () => {
    setEditingNote({}); // Open focus edit overlay for a new note
  };

  const handleSaveNote = async (noteData) => {
    if (!currentUser || !currentBoard) return;

    if (editingNote && editingNote.id) {
      await updateNote(editingNote.id, noteData);
    } else {
      const colors = ['yellow', 'blue', 'green', 'pink', 'purple', 'orange'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      const position_x = 50 + (notes.length % 5) * 300;
      const position_y = 120 + Math.floor(notes.length / 5) * 240;

      const newNote = await StickyNote.create({
        ...noteData,
        board_id: currentBoard.id,
        color: randomColor,
        position_x,
        position_y,
        width: 280,
        height: 200,
        created_by: currentUser.email
      });
      
      setNotes(prev => [newNote, ...prev]);
      setAllNotesForAI(prev => [newNote, ...prev]);
    }
    setEditingNote(null);
  };

  const updateNote = async (noteId, updates) => {
    await StickyNote.update(noteId, updates);
    const updateLocalNotes = (prevNotes) => prevNotes.map(n => 
      n.id === noteId ? { ...n, ...updates } : n
    );
    setNotes(updateLocalNotes);
    setAllNotesForAI(updateLocalNotes);
  };

  const deleteNote = async (noteId) => {
    await StickyNote.delete(noteId);
    const filterOutNote = (prev) => prev.filter(note => note.id !== noteId);
    setNotes(filterOutNote);
    setAllNotesForAI(filterOutNote);
    if (editingNote && editingNote.id === noteId) setEditingNote(null);
  };

  const archiveNote = async (noteId) => {
    await StickyNote.update(noteId, { is_archived: true });
    const filterOutNote = (prev) => prev.filter(note => note.id !== noteId);
    setNotes(filterOutNote);
    setAllNotesForAI(filterOutNote);
    if (editingNote && editingNote.id === noteId) setEditingNote(null);
  };

  const handleAIActions = async (action, noteId, updates) => {
    try {
      if (action === 'update') {
        await StickyNote.update(noteId, updates);
      } else if (action === 'archive') {
        await StickyNote.update(noteId, { is_archived: true });
      } else if (action === 'delete') {
        await StickyNote.delete(noteId);
      }
      
      // Reload notes
      const fetchedNotes = await StickyNote.filter({ 
        board_id: currentBoard.id, 
        is_archived: false 
      }, '-updated_date');
      setNotes(fetchedNotes);
      
      const allNotes = await StickyNote.filter({ 
        created_by: currentUser.email,
        is_archived: false 
      }, '-updated_date');
      setAllNotesForAI(allNotes);
    } catch (error) {
      console.error(`Error performing AI action '${action}':`, error);
    }
  };

  const handleMouseDown = (e, note) => {
    if (e.target.closest('.no-drag')) return;
    const startX = e.clientX - note.position_x;
    const startY = e.clientY - note.position_y;
    setDraggedNote(note.id);

    const handleMouseMove = (e) => {
      setNotes(prev => prev.map(n =>
        n.id === note.id ? { 
          ...n, 
          position_x: Math.max(0, e.clientX - startX), 
          position_y: Math.max(80, e.clientY - startY) 
        } : n
      ));
    };

    const handleMouseUp = () => {
      const draggedNoteData = notes.find(n => n.id === note.id);
      if (draggedNoteData) {
        StickyNote.update(note.id, { 
          position_x: draggedNoteData.position_x, 
          position_y: draggedNoteData.position_y 
        });
      }
      setDraggedNote(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const applyFilters = (notesToFilter) => {
    let filtered = notesToFilter;
    if (searchQuery) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (quickFilter) {
      if (quickFilter === 'overdue') filtered = filtered.filter(n => n.due_date && new Date(n.due_date) < new Date());
      else if (quickFilter === 'today') filtered = filtered.filter(n => n.due_date === new Date().toISOString().split('T')[0]);
      else if (quickFilter === 'unassigned') filtered = filtered.filter(n => !n.assigned_to);
    }
    return filtered;
  };

  const filteredNotes = applyFilters(notes);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p className="font-semibold">Loading board...</p>
        </div>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="flex items-center justify-center h-full text-white">
        <div className="text-center">
          <p className="mb-4">Board not found</p>
          <Button onClick={() => navigate(createPageUrl('Boards'))} variant="outline" className="bg-white/20 border-white/30 hover:bg-white/30">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Boards
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col relative text-white">
      {/* Header */}
      <div className="bg-black/10 backdrop-blur-lg border-b border-white/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate(createPageUrl('Boards'))} className="bg-white/10 border-white/20 hover:bg-white/20">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Boards
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{currentBoard.name}</h1>
            <p className="text-white/70">{filteredNotes.length} notes</p>
          </div>
        </div>
        <Button onClick={createNewNote} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg">
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      {/* Board Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <div ref={dragAreaRef} className="w-full h-full">
          {showGrid && viewMode === 'freeform' && (
            <div 
              className="absolute inset-0 opacity-10" 
              style={{ 
                backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`, 
                backgroundSize: '40px 40px' 
              }} 
            />
          )}

          <div ref={boardRef} className="w-full h-full" style={{ cursor: draggedNote ? 'grabbing' : 'default' }}>
            <ViewRenderer
              viewMode={viewMode}
              notes={filteredNotes}
              onUpdate={updateNote}
              onDelete={deleteNote}
              onArchive={archiveNote}
              onMouseDown={handleMouseDown}
              draggedNote={draggedNote}
              onFocusNote={(note) => setEditingNote(note)}
              audienceMode={audienceMode}
            />

            {filteredNotes.length === 0 && !searchQuery && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex flex-col items-center justify-center h-full text-center px-4"
              >
                <div className="w-32 h-32 rounded-full flex items-center justify-center mb-8 bg-white/10">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600">
                    <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                      <span role="img" aria-label="notes emoji" className="text-2xl">📄</span>
                    </motion.div>
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-4" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Your board is ready</h2>
                <p className="text-white/80 text-lg mb-8 max-w-md" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Create your first note to start organizing your ideas and tasks.</p>
                <Button onClick={createNewNote} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Note
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* View Controls */}
        <div className="absolute top-4 right-6">
          <ViewControls
            currentView={viewMode}
            onViewChange={setViewMode}
            filteredNotes={filteredNotes}
            onFilterChange={setQuickFilter}
            dragConstraintsRef={dragAreaRef}
          />
        </div>

        {/* AI Assistant Button */}
        <FloatingAIAssistantButton
          onClick={() => setShowAIAssistant(true)}
          audienceMode={audienceMode}
        />

        {/* AI Assistant Modal */}
        <GlobalAIAssistant
          notes={allNotesForAI}
          boards={[currentBoard]}
          onExecuteAction={handleAIActions}
          isVisible={showAIAssistant}
          onClose={() => setShowAIAssistant(false)}
          audienceMode={audienceMode}
        />

        {/* Focus Edit Overlay */}
        <AnimatePresence>
          {editingNote && (
            <FocusEditOverlay
              note={editingNote}
              onSave={handleSaveNote}
              onClose={() => setEditingNote(null)}
              audienceMode={audienceMode}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
