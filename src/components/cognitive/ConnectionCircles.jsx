import React, { useState, useRef, useEffect, createRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import StickyNoteCard from '../board/StickyNoteCard';
import { GitBranch, X, Zap } from 'lucide-react';

// Modal for setting connection properties
const ConnectionModal = ({ onSave, onCancel }) => {
  const [type, setType] = useState('reinforcing');
  const [delay, setDelay] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onCancel}
    >
      <Card className="w-96" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-4">Connection Properties</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reinforcing">Reinforcing (+)</SelectItem>
                  <SelectItem value="balancing">Balancing (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="delay" checked={delay} onCheckedChange={setDelay} />
              <label htmlFor="delay" className="text-sm font-medium">
                Add Delay (||)
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button onClick={() => onSave({ type, delay })}>Save</Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function ConnectionCircles({ notes, onUpdate, onDelete, onArchive, onFocusNote }) {
  const [noteRefs, setNoteRefs] = useState({});
  const [connecting, setConnecting] = useState(null); // { sourceId, x, y }
  const [newConnection, setNewConnection] = useState(null); // { sourceId, targetId }
  const containerRef = useRef(null);

  useEffect(() => {
    setNoteRefs(notes.reduce((acc, note) => {
      acc[note.id] = createRef();
      return acc;
    }, {}));
  }, [notes]);

  const handleStartConnection = (noteId) => {
    setConnecting({ sourceId: noteId, x: 0, y: 0 }); // Initial coords
  };

  const handleMouseMove = (e) => {
    if (connecting) {
      const containerRect = containerRef.current.getBoundingClientRect();
      setConnecting({
        ...connecting,
        x: e.clientX - containerRect.left,
        y: e.clientY - containerRect.top
      });
    }
  };

  const handleEndConnection = (targetId) => {
    if (connecting && connecting.sourceId !== targetId) {
      setNewConnection({ sourceId: connecting.sourceId, targetId });
    }
    setConnecting(null);
  };
  
  const handleSaveConnection = (properties) => {
    const { sourceId, targetId } = newConnection;
    const sourceNote = notes.find(n => n.id === sourceId);
    if (!sourceNote) return;

    const newConnections = [...(sourceNote.connections || []), { targetId, ...properties }];
    onUpdate(sourceId, { connections: newConnections });
    setNewConnection(null);
  };

  const removeConnection = (sourceId, targetId) => {
    const sourceNote = notes.find(n => n.id === sourceId);
    const updatedConnections = sourceNote.connections.filter(c => c.targetId !== targetId);
    onUpdate(sourceId, { connections: updatedConnections });
  };

  const getEdgePoint = (rect, targetRect) => {
      const dx = targetRect.x - rect.x;
      const dy = targetRect.y - rect.y;
      
      const angle = Math.atan2(dy, dx);
      
      const x = rect.x + (rect.width / 2) + (rect.width / 2) * Math.cos(angle);
      const y = rect.y + (rect.height / 2) + (rect.height / 2) * Math.sin(angle);
      
      return { x, y };
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen p-6 overflow-auto"
      onMouseMove={handleMouseMove}
      onMouseUp={() => setConnecting(null)}
    >
      <AnimatePresence>
        {newConnection && (
          <ConnectionModal
            onSave={handleSaveConnection}
            onCancel={() => setNewConnection(null)}
          />
        )}
      </AnimatePresence>

      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
            </marker>
          </defs>

          {notes.map(sourceNote =>
            (sourceNote.connections || []).map((conn, index) => {
              const targetNote = notes.find(n => n.id === conn.targetId);
              if (!targetNote || !noteRefs[sourceNote.id]?.current || !noteRefs[targetNote.id]?.current) {
                return null;
              }
              const sourceRect = noteRefs[sourceNote.id].current.getBoundingClientRect();
              const targetRect = noteRefs[targetNote.id].current.getBoundingClientRect();
              
              const p1 = getEdgePoint(sourceRect, targetRect);
              const p2 = getEdgePoint(targetRect, sourceRect);

              const midX = (p1.x + p2.x) / 2;
              const midY = (p1.y + p2.y) / 2;
              
              return (
                <g key={`${sourceNote.id}-${conn.targetId}-${index}`} className="group">
                  <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#cbd5e1" strokeWidth="2" markerEnd="url(#arrow)" />
                  <circle cx={midX} cy={midY} r="12" fill={conn.type === 'reinforcing' ? '#22c55e' : '#ef4444'} className="opacity-70" />
                  <text x={midX} y={midY + 4} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
                    {conn.type === 'reinforcing' ? '+' : '-'}
                  </text>
                  {conn.delay && <path d={`M ${midX-10} ${midY-15} L ${midX-10} ${midY+15}`} stroke="#94a3b8" strokeWidth="3" />}
                  {conn.delay && <path d={`M ${midX+10} ${midY-15} L ${midX+10} ${midY+15}`} stroke="#94a3b8" strokeWidth="3" />}
                   <rect
                      x={midX - 15} y={midY - 15} width="30" height="30"
                      fill="transparent"
                      className="cursor-pointer"
                      onClick={() => removeConnection(sourceNote.id, conn.targetId)}
                    />
                </g>
              );
            })
          )}
          
          {connecting && (
            <line x1={noteRefs[connecting.sourceId]?.current?.getBoundingClientRect().x} y1={noteRefs[connecting.sourceId]?.current?.getBoundingClientRect().y} x2={connecting.x} y2={connecting.y} stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" />
          )}
        </svg>
      </div>

      {notes.map(note => (
        <div key={note.id} ref={noteRefs[note.id]}>
          <StickyNoteCard
            note={note}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onArchive={onArchive}
            onFocusNote={onFocusNote}
            isConnectionView
            onStartConnection={() => handleStartConnection(note.id)}
            onEndConnection={() => handleEndConnection(note.id)}
          />
        </div>
      ))}
    </div>
  );
}