
import React from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  LayoutGrid,
  List,
  Calendar,
  Users,
  FolderOpen,
  Flag,
  Clock,
  Tag,
  Briefcase,
  User,
  CheckSquare,
  ChevronDown,
  ChevronLeft, // Changed from ChevronRight
  Settings,
  Target, // New icon
  GitBranch, // New icon
  Layers // New icon
} from 'lucide-react';

const viewModes = [
{ id: 'freeform', name: 'Free Form', icon: LayoutGrid, description: 'Drag notes anywhere' },
{ id: 'category', name: 'Categories', icon: FolderOpen, description: 'Group by category' },
{ id: 'priority', name: 'Priority', icon: Flag, description: 'Group by priority' },
{ id: 'status', name: 'Status', icon: CheckSquare, description: 'Group by status' },
{ id: 'timeline', name: 'Timeline', icon: Calendar, description: 'Sort by due dates' },
{ id: 'project', name: 'Projects', icon: Briefcase, description: 'Group by project' },
{ id: 'owner', name: 'By Owner', icon: Users, description: 'Group by assigned person' },
{ id: 'type', name: 'Note Type', icon: Tag, description: 'Group by note type' },
// New cognitive framework views
{ id: 'eisenhower', name: 'Eisenhower Matrix', icon: Target, description: 'Urgent vs Important' },
{ id: 'decision', name: 'Decision Matrix', icon: Layers, description: 'Effort vs Impact' },
{ id: 'connections', name: 'Connection Circles', icon: GitBranch, description: 'Clustered groupings' }];


export default function ViewControls({
  currentView,
  onViewChange,
  filteredNotes = [],
  onFilterChange,
  dragConstraintsRef
}) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isCardVisible, setIsCardVisible] = React.useState(false); // Changed from true to false
  const [isDragging, setIsDragging] = React.useState(false);
  const dragControls = useDragControls();

  const currentViewData = viewModes.find((mode) => mode.id === currentView) || viewModes[0];
  const Icon = currentViewData.icon;

  const getViewStats = () => {
    switch (currentView) {
      case 'priority':
        return {
          urgent: filteredNotes.filter((n) => n.priority === 'urgent').length,
          high: filteredNotes.filter((n) => n.priority === 'high').length,
          medium: filteredNotes.filter((n) => n.priority === 'medium').length,
          low: filteredNotes.filter((n) => n.priority === 'low').length
        };
      case 'status':
        return {
          active: filteredNotes.filter((n) => n.status === 'active').length,
          in_progress: filteredNotes.filter((n) => n.status === 'in_progress').length,
          completed: filteredNotes.filter((n) => n.status === 'completed').length,
          waiting: filteredNotes.filter((n) => n.status === 'waiting').length
        };
      case 'category':
        return {
          work: filteredNotes.filter((n) => n.category === 'work').length,
          personal: filteredNotes.filter((n) => n.category === 'personal').length,
          ideas: filteredNotes.filter((n) => n.category === 'ideas').length,
          todo: filteredNotes.filter((n) => n.category === 'todo').length
        };
      default:
        return { total: filteredNotes.length };
    }
  };

  const stats = getViewStats();

  const handleViewSelect = (viewId) => {
    onViewChange(viewId);
    setIsExpanded(false);
  };

  const handleShowClick = (e) => {
    // Only show card if it wasn't a drag event
    if (!isDragging) {
      setIsCardVisible(true);
    }
  };

  return (
    <motion.div
      drag
      dragListener={false}
      dragControls={dragControls}
      dragConstraints={dragConstraintsRef}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setTimeout(() => setIsDragging(false), 100)} // Small delay to allow click event to register before clearing drag state
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed top-1/2 left-6 -translate-y-1/2 z-40">

      <AnimatePresence mode="wait">
        {isCardVisible ?
        <motion.div
          key="card-visible"
          initial={{ opacity: 0, x: -20, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.9 }}
          transition={{ type: "spring", duration: 0.3 }}>

            <Card className="bg-white/90 backdrop-blur-md shadow-xl border-0 p-4 w-80 relative">
              {/* Hide/Show Toggle Button */}
              <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCardVisible(false)}
              className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-slate-100"
              aria-label="Hide View Controls">

                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </Button>

              <div className="space-y-4">
                {/* Header - Drag Handle */}
                <div
                onPointerDown={(e) => {
                  e.preventDefault();
                  setIsDragging(false); // Reset dragging state on pointer down for potential new drag
                  dragControls.start(e);
                }}
                className="flex items-center gap-2 mb-4 cursor-grab select-none">

                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">View Controls</h3>
                    <p className="text-xs text-slate-500">Organize your notes</p>
                  </div>
                </div>

                {/* View Mode Expander */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    View Mode
                  </label>
                  <Button
                  variant="outline"
                  className="w-full justify-between hover:bg-slate-50"
                  onClick={() => setIsExpanded(!isExpanded)}>

                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{currentViewData.name}</span>
                    </div>
                    <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}>

                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </Button>
                  
                  <AnimatePresence>
                    {isExpanded &&
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 overflow-hidden">

                        <div className="space-y-1 p-2 bg-slate-50 rounded-lg border max-h-80 overflow-y-auto">
                          {viewModes.map((mode) => {
                        const ModeIcon = mode.icon;
                        const isCognitive = ['eisenhower', 'decision', 'connections'].includes(mode.id);

                        return (
                          <motion.div
                            key={mode.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}>

                                <Button
                              variant={currentView === mode.id ? 'secondary' : 'ghost'}
                              className={`w-full justify-start h-auto py-3 hover:bg-white hover:shadow-sm transition-all duration-200 ${
                              isCognitive ? 'border-l-4 border-purple-500' : ''}`
                              }
                              onClick={() => handleViewSelect(mode.id)}>

                                  <div className="flex items-center gap-3 text-left">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                currentView === mode.id ?
                                'bg-blue-100 text-blue-600' :
                                isCognitive ?
                                'bg-purple-100 text-purple-600' :
                                'bg-slate-100 text-slate-600'}`
                                }>
                                      <ModeIcon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium text-sm">{mode.name}</div>
                                      <div className="text-xs font-normal text-slate-500 line-clamp-1">
                                        {mode.description}
                                      </div>
                                    </div>
                                  </div>
                                </Button>
                              </motion.div>);

                      })}
                        </div>
                      </motion.div>
                  }
                  </AnimatePresence>
                </div>

                {/* View Statistics */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Distribution
                  </label>
                  <div className="space-y-2">
                    {Object.entries(stats).map(([key, count]) =>
                  <motion.div
                    key={key}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}>

                        <Badge
                      variant="outline"
                      className={`text-xs ${getStatColor(key, currentView)}`}>

                          {formatStatLabel(key)}
                        </Badge>
                        <motion.span
                      className="text-sm font-bold text-slate-700 bg-white px-2 py-1 rounded-md shadow-sm"
                      initial={{ scale: 1 }}
                      animate={{ scale: count > 0 ? [1, 1.1, 1] : 1 }}
                      transition={{ duration: 0.3 }}>

                          {count}
                        </motion.span>
                      </motion.div>
                  )}
                  </div>
                </div>

                {/* Quick Filters */}
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Quick Filters
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onFilterChange('overdue')}
                      className="text-xs w-full justify-start hover:bg-red-50 hover:text-red-700 hover:border-red-200">

                        <Clock className="w-3 h-3 mr-1" />
                        Overdue
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onFilterChange('today')}
                      className="text-xs w-full justify-start hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200">

                        <Calendar className="w-3 h-3 mr-1" />
                        Today
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onFilterChange('unassigned')}
                      className="text-xs w-full justify-start col-span-2 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200">

                        <User className="w-3 h-3 mr-1" />
                        Unassigned
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div> :

        <motion.div
          key="card-hidden"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", duration: 0.4 }}>

            <motion.div
            onPointerDown={(e) => {
              e.preventDefault();
              setIsDragging(false); // Reset dragging state on pointer down for potential new drag
              dragControls.start(e);
            }}
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-grab select-none">

              <Button
              onClick={handleShowClick} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground bg-white/90 backdrop-blur-md shadow-xl hover:bg-white hover:bg-white/90 hover:shadow-2xl border-0 h-12 w-12 p-0 rounded-full transition-all duration-300"

              aria-label="Show View Controls">

                <Settings className="w-5 h-5 text-blue-600" />
              </Button>
            </motion.div>
          </motion.div>
        }
      </AnimatePresence>
    </motion.div>);

}

function getStatColor(key, viewMode) {
  const colorMap = {
    urgent: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-blue-100 text-blue-800 border-blue-200',
    low: 'bg-gray-100 text-gray-800 border-gray-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    waiting: 'bg-purple-100 text-purple-800 border-purple-200',
    work: 'bg-blue-100 text-blue-800 border-blue-200',
    personal: 'bg-pink-100 text-pink-800 border-pink-200',
    ideas: 'bg-purple-100 text-purple-800 border-purple-200',
    todo: 'bg-green-100 text-green-800 border-green-200'
  };
  return colorMap[key] || 'bg-slate-100 text-slate-800 border-slate-200';
}

function formatStatLabel(key) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}
