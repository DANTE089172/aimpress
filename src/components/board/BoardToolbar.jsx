import React, { useEffect } from 'react';
import { motion, useDragControls, useMotionValue } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Plus, Grid, Archive, Search, ChevronUp, ChevronsUpDown, LayoutGrid, Award, Brain, User as UserIcon, PlusCircle, Minus, ChevronDown 
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AICategorizeButton from '../ai/AICategorizeButton';
import ThinkingToolsToggle from '../cognitive/ThinkingToolsToggle';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function BoardToolbar({ 
  boards,
  currentBoard,
  onCreateBoard,
  onCreateNote, 
  onToggleGrid, 
  showGrid = false,
  searchQuery,
  onSearchChange,
  viewMode,
  dragConstraintsRef,
  onRegroup,
  audienceMode = 'professional',
  notes,
  onUpdateNotes,
  isThinkingMode,
  onToggleThinkingMode,
  thinkingFramework,
  onFrameworkChange,
  onShowProgress,
  currentUser
}) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [isDragging, setIsDragging] = React.useState(false);
  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const navigate = useNavigate();

  const getToolbarKey = () => `toolbar-position-${currentUser?.email}`;
  const getExpandedKey = () => `toolbar-expanded-${currentUser?.email}`;

  useEffect(() => {
    if (currentUser) {
      const savedPosition = localStorage.getItem(getToolbarKey());
      if (savedPosition) {
        const { savedX, savedY } = JSON.parse(savedPosition);
        x.set(savedX);
        y.set(savedY);
      }
      
      // Load expanded state
      const savedExpanded = localStorage.getItem(getExpandedKey());
      if (savedExpanded !== null) {
        setIsExpanded(JSON.parse(savedExpanded));
      }
    }
  }, [currentUser]);

  const startDrag = (e) => {
    if (e.target.closest('button, input, select, [role="combobox"], [role="menuitem"]')) {
      return;
    }
    setIsDragging(false);
    dragControls.start(e);
  };
  
  const handleBoardSwitch = (boardId) => {
      navigate(createPageUrl(`Board?board_id=${boardId}`));
  };

  const toggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    if (currentUser) {
      localStorage.setItem(getExpandedKey(), JSON.stringify(newExpanded));
    }
  };

  const getToolbarContent = () => {
    if (audienceMode === 'student') {
      return {
        createButtonText: 'New Study Note',
        searchPlaceholder: 'Search study notes...',
        colors: {
          primary: 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700',
        }
      };
    }
    return {
      createButtonText: 'New Note',
      searchPlaceholder: 'Search notes...',
      colors: {
        primary: 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
      }
    };
  };

  const content = getToolbarContent();

  return (
    <motion.div
      drag
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={dragConstraintsRef}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => {
        setTimeout(() => setIsDragging(false), 50);
        if (currentUser) {
          localStorage.setItem(getToolbarKey(), JSON.stringify({ savedX: x.get(), savedY: y.get() }));
        }
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        height: isExpanded ? 'auto' : 'auto'
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ x, y }}
      className="pointer-events-auto"
    >
      <Card 
        className="bg-white/90 backdrop-blur-md shadow-xl border-0 p-4 relative"
        style={{ width: isExpanded ? '320px' : '200px' }}
        onPointerDown={startDrag}
      >
        <div className="space-y-4">
          {/* Header with Minimize Button */}
          <div className="flex items-center gap-2 mb-4 cursor-grab select-none">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-xl font-semibold text-slate-800 p-2 -ml-2 h-auto text-left flex-1 justify-start">
                  <span className={isExpanded ? '' : 'truncate max-w-[100px]'}>
                    {currentBoard?.name || 'Loading Board...'}
                  </span>
                  {isExpanded && <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 flex-shrink-0" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {boards.map(board => (
                  <DropdownMenuItem key={board.id} onClick={() => handleBoardSwitch(board.id)}>
                    {board.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onCreateBoard}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Board
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Minimize/Expand Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpanded}
              className="h-8 w-8 p-0 flex-shrink-0 hover:bg-slate-200"
              title={isExpanded ? "Minimize toolbar" : "Expand toolbar"}
            >
              {isExpanded ? (
                <Minus className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>

          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={onCreateNote}
                  className={`bg-gradient-to-r ${content.colors.primary} text-white shadow-lg h-10 w-full`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {content.createButtonText}
                </Button>
              </motion.div>
              
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder={content.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 w-full h-10 bg-white/50 border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-200/70">
                <Button
                  variant={showGrid ? "secondary" : "outline"}
                  size="sm"
                  onClick={onToggleGrid}
                  disabled={viewMode !== 'freeform'}
                  className={`h-9 hover:bg-slate-50 text-xs ${viewMode !== 'freeform' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Grid className="w-3 h-3 mr-1" />
                  Grid
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRegroup}
                  disabled={viewMode !== 'freeform'}
                  className={`h-9 hover:bg-slate-50 text-xs ${viewMode !== 'freeform' ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <LayoutGrid className="w-3 h-3 mr-1" />
                  Regroup
                </Button>
                
                <Link to={createPageUrl('Archive')} className="contents">
                  <Button variant="outline" size="sm" className="h-9 hover:bg-slate-50 text-xs">
                    <Archive className="w-3 h-3 mr-1" />
                    Archive
                  </Button>
                </Link>
                <AICategorizeButton
                  notes={notes}
                  onUpdateNotes={onUpdateNotes}
                  audienceMode={audienceMode}
                />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <ThinkingToolsToggle
                  isActive={isThinkingMode}
                  onToggle={onToggleThinkingMode}
                  framework={thinkingFramework}
                  onFrameworkChange={onFrameworkChange}
                  audienceMode={audienceMode}
                />

                <div className="grid grid-cols-1 gap-2">
                  <Button variant="outline" size="sm" onClick={onShowProgress} className="h-9 hover:bg-slate-50 text-xs">
                    <Award className="w-3 h-3 mr-1" /> Progress
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
          
          {!isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center"
            >
              <Button
                onClick={onCreateNote}
                size="sm"
                className={`bg-gradient-to-r ${content.colors.primary} text-white shadow-lg w-full`}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}