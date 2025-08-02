
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Sparkles, Loader2 } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { UploadFile, InvokeLLM } from '@/api/integrations';
import ImageModal from './ImageModal';

const colorThemes = {
  yellow: 'from-yellow-400/80 to-amber-500/80',
  blue: 'from-blue-400/80 to-sky-500/80',
  green: 'from-green-400/80 to-emerald-500/80',
  pink: 'from-pink-400/80 to-rose-500/80',
  purple: 'from-purple-400/80 to-violet-500/80',
  orange: 'from-orange-400/80 to-red-500/80'
};

export default function FocusEditOverlay({ note, onSave, onClose, audienceMode }) {
  const [editData, setEditData] = useState({
    title: note?.title || '',
    content: note?.content || '',
    category: note?.category || (audienceMode === 'student' ? 'subject_notes' : 'work'),
    status: note?.status || 'active',
    priority: note?.priority || 'medium',
    project: note?.project || '',
    assigned_to: note?.assigned_to || '',
    note_type: note?.note_type || (audienceMode === 'student' ? 'study_note' : 'task'),
    due_date: note?.due_date || ''
  });
  const quillRef = useRef(null);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const theme = colorThemes[note?.color] || colorThemes.yellow;

  const handleSave = () => {
    onSave(editData);
  };
  
  const fileUploadHandler = (fileType) => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', `${fileType}/*`);
    input.click();

    input.onchange = async () => {
      if (!input.files) return;
      const file = input.files[0];
      if (file) {
        const { file_url } = await UploadFile({ file });
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, fileType, file_url);
          quill.setSelection(range.index + 1);
        }
      }
    };
  }

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = Array.from(e.dataTransfer.files);
    
    for (const file of files) {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const { file_url } = await UploadFile({ file });
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection(true);
          const fileType = file.type.startsWith('image/') ? 'image' : 'video';
          quill.insertEmbed(range.index, fileType, file_url);
          quill.setSelection(range.index + 1);
        }
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
        setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{'list': 'ordered'}, {'list': 'bullet'}],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        'image': () => fileUploadHandler('image'),
        'video': () => fileUploadHandler('video')
      }
    }
  }), []);

  const handleQuillChange = (content) => {
    setEditData({ ...editData, content });
  };

  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const handleImageClick = (event) => {
        if (event.target.tagName === 'IMG' && event.target.closest('.ql-editor')) {
          setSelectedImage({ src: event.target.src, alt: event.target.alt || 'Note image' });
        }
      };
      quill.root.addEventListener('click', handleImageClick);
      return () => {
        quill.root.removeEventListener('click', handleImageClick);
      };
    }
  }, [quillRef]);

  const handleAutoCategorize = async () => {
    if (!editData.title && !editData.content) {
      return;
    }
    setIsCategorizing(true);
    try {
      const availableCategories = categories.map(c => c.value);
      const prompt = `Analyze the following note's title and content and determine the most appropriate category from the provided list.
      
      Categories: ${availableCategories.join(', ')}.

      Note Title: "${editData.title}"
      Note Content: "${editData.content.replace(/<[^>]*>?/gm, ' ')}"

      Return only the single best category.`;

      const response = await InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            category: {
              type: "string",
              enum: availableCategories,
              description: "The most fitting category for the note."
            }
          },
          required: ["category"]
        }
      });
      
      if (response && response.category) {
        setEditData(prev => ({ ...prev, category: response.category }));
      }
    } catch (error) {
      console.error("AI categorization failed:", error);
    } finally {
      setIsCategorizing(false);
    }
  };

  const backdropVariants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 }
  };

  const cardVariants = {
    visible: { opacity: 1, y: 0, scale: 1 },
    hidden: { opacity: 0, y: -50, scale: 0.8 }
  };
  
  const professionalCategories = [
    { value: 'work', label: '💼 Work' },
    { value: 'personal', label: '👤 Personal' },
    { value: 'ideas', label: '💡 Ideas' },
    { value: 'todo', label: '✅ To-Do' },
    { value: 'meetings', label: '🤝 Meetings' },
    { value: 'projects', label: '📋 Projects' },
    { value: 'references', label: '📚 References' },
  ];
  
  const studentCategories = [
    { value: 'subject_notes', label: '📚 Subject Notes' },
    { value: 'assignment', label: '📝 Assignment' },
    { value: 'exam_prep', label: '🧠 Exam Prep' },
    { value: 'project_research', label: '🔬 Project Research' },
    { value: 'reading_list', label: '📖 Reading List' },
    { value: 'reminder', label: '⏰ Reminder' },
  ];
  
  const categories = audienceMode === 'student' ? studentCategories : professionalCategories;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      <style>{`
        .glass-quill .ql-container.ql-snow {
          border: none;
        }
        .glass-quill .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: 8px 8px 0 0;
          background: rgba(255, 255, 255, 0.2);
        }
        .glass-quill .ql-toolbar.ql-snow .ql-stroke {
          stroke: #334155;
        }
        .glass-quill .ql-toolbar.ql-snow .ql-picker-label {
          color: #334155;
        }
        .glass-quill .ql-toolbar.ql-snow .ql-active .ql-stroke {
          stroke: #6d28d9;
        }
        .glass-quill .ql-editor {
          min-height: 200px;
          font-size: 16px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 0 0 8px 8px;
          color: #334155;
        }
        .glass-quill .ql-editor.ql-blank::before {
          color: rgba(51, 65, 85, 0.6);
          font-style: normal;
        }
        .glass-quill .ql-editor img, .glass-quill .ql-editor video {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.2s ease;
          border: 1px solid rgba(0,0,0,0.1);
        }
        .glass-quill .ql-editor img:hover {
          transform: scale(1.02);
        }
        .glass-quill .ql-editor.drag-over {
          background: rgba(59, 130, 246, 0.2);
          border: 2px dashed rgba(51, 65, 85, 0.5);
        }
      `}</style>
      <motion.div
        variants={cardVariants}
        className="w-full max-w-4xl max-h-[90vh] flex flex-col text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        <Card className={`bg-gradient-to-br ${theme} border border-white/20 shadow-2xl overflow-hidden backdrop-blur-2xl`}>
          <CardContent className="p-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-3 right-3 h-8 w-8 p-0 rounded-full text-slate-600 hover:bg-black/10 z-10"
            >
              <X className="w-5 h-5" />
            </Button>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <Input
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                  className="text-xl font-bold bg-white/50 border-slate-300/50 h-12 placeholder:text-slate-500"
                  placeholder="Note title..."
                />
                <div 
                  className={`rounded-lg overflow-hidden glass-quill ${isDraggingOver ? 'drag-over' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                >
                  <ReactQuill
                    ref={quillRef}
                    theme="snow"
                    value={editData.content}
                    onChange={handleQuillChange}
                    modules={modules}
                    placeholder="Add your thoughts, drag & drop images/videos, or embed media..."
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Select
                  value={editData.priority}
                  onValueChange={(value) => setEditData({ ...editData, priority: value })}
                >
                  <SelectTrigger className="bg-white/50 border-slate-300/50">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800/80 backdrop-blur-lg border-white/20 text-white">
                    <SelectItem value="urgent" className="focus:bg-white/20">🔴 Urgent</SelectItem>
                    <SelectItem value="high" className="focus:bg-white/20">🟠 High</SelectItem>
                    <SelectItem value="medium" className="focus:bg-white/20">🟡 Medium</SelectItem>
                    <SelectItem value="low" className="focus:bg-white/20">🟢 Low</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={editData.status}
                  onValueChange={(value) => setEditData({ ...editData, status: value })}
                >
                  <SelectTrigger className="bg-white/50 border-slate-300/50">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800/80 backdrop-blur-lg border-white/20 text-white">
                    <SelectItem value="active" className="focus:bg-white/20">▶️ Active</SelectItem>
                    <SelectItem value="in_progress" className="focus:bg-white/20">⏳ In Progress</SelectItem>
                    <SelectItem value="waiting" className="focus:bg-white/20">⏸️ Waiting</SelectItem>
                    <SelectItem value="completed" className="focus:bg-white/20">✅ Completed</SelectItem>
                    <SelectItem value="on_hold" className="focus:bg-white/20">⏹️ On Hold</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex items-center gap-2">
                  <Select
                    value={editData.category}
                    onValueChange={(value) => setEditData({ ...editData, category: value })}
                  >
                    <SelectTrigger className="bg-white/50 border-slate-300/50 flex-1">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800/80 backdrop-blur-lg border-white/20 text-white">
                      {categories.map(cat => (
                         <SelectItem key={cat.value} value={cat.value} className="focus:bg-white/20">{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAutoCategorize}
                    disabled={isCategorizing}
                    className="bg-gradient-to-r from-purple-500/80 to-pink-500/80 hover:from-purple-500/90 hover:to-pink-500/90 border-2 border-purple-300/50 hover:border-purple-300/70 flex-shrink-0 px-3 py-2"
                    title="Auto-categorize with AI"
                  >
                    {isCategorizing ? (
                      <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-white mr-1" />
                        <span className="text-white font-medium text-xs">AI</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  value={editData.project}
                  onChange={(e) => setEditData({ ...editData, project: e.target.value })}
                  className="bg-white/50 border-slate-300/50 placeholder:text-slate-500"
                  placeholder="Project name..."
                />
                <Input
                  value={editData.assigned_to}
                  onChange={(e) => setEditData({ ...editData, assigned_to: e.target.value })}
                  className="bg-white/50 border-slate-300/50 placeholder:text-slate-500"
                  placeholder="Assigned to..."
                />
              </div>

              <Input
                type="date"
                value={editData.due_date}
                onChange={(e) => setEditData({ ...editData, due_date: e.target.value })}
                className="bg-white/50 border-slate-300/50"
                style={{ colorScheme: 'dark' }}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-400/30">
                <Button variant="outline" onClick={onClose} className="bg-black/5 hover:bg-black/10 border-slate-400/50">
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-blue-500 hover:bg-blue-600 shadow-lg text-white">
                  {note?.id ? 'Save Changes' : 'Create Note'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <ImageModal
        src={selectedImage?.src}
        alt={selectedImage?.alt}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </motion.div>
  );
}
