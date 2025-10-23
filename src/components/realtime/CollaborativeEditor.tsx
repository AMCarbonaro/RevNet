'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Users, Edit3, Save, Eye, Lock } from 'lucide-react';

interface CollaborativeEditorProps {
  documentId: string;
  initialContent?: string;
  readOnly?: boolean;
  onSave?: (content: string) => void;
  className?: string;
}

interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursor?: {
    position: number;
    selection?: {
      start: number;
      end: number;
    };
  };
}

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  documentId,
  initialContent = '',
  readOnly = false,
  onSave,
  className = ''
}) => {
  const [content, setContent] = useState(initialContent);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const cursorTimeoutRef = useRef<NodeJS.Timeout>();

  // Simulated collaborators for demo
  useEffect(() => {
    const mockCollaborators: Collaborator[] = [
      { id: '1', name: 'Alice', color: '#00ff88' },
      { id: '2', name: 'Bob', color: '#ff6b6b' },
      { id: '3', name: 'Charlie', color: '#4ecdc4' }
    ];
    
    setCollaborators(mockCollaborators);
    setIsConnected(true);
  }, []);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    
    // Clear existing timeout
    if (cursorTimeoutRef.current) {
      clearTimeout(cursorTimeoutRef.current);
    }
    
    // Set new timeout for cursor position
    cursorTimeoutRef.current = setTimeout(() => {
      if (editorRef.current) {
        setCursorPosition(editorRef.current.selectionStart);
      }
    }, 100);
  };

  const handleSave = async () => {
    if (readOnly || isSaving) return;
    
    setIsSaving(true);
    
    try {
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onSave) {
        onSave(content);
      }
      
      setLastSaved(new Date());
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Auto-save on Ctrl+S or Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return 'Never saved';
    
    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return lastSaved.toLocaleTimeString();
  };

  return (
    <div className={`bg-black/20 border border-cyan-500/20 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cyan-500/10">
        <div className="flex items-center gap-3">
          <Edit3 className="w-5 h-5 text-cyan-400" />
          <h3 className="text-cyan-400 font-mono text-sm">Collaborative Editor</h3>
          
          {readOnly && (
            <div className="flex items-center gap-1 text-xs text-yellow-400">
              <Lock className="w-3 h-3" />
              <span>Read Only</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Collaborators */}
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <div className="flex -space-x-2">
              {collaborators.map((collaborator) => (
                <motion.div
                  key={collaborator.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-6 h-6 rounded-full border-2 border-black flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: collaborator.color }}
                >
                  {collaborator.name[0]}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          {!readOnly && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded text-cyan-400 text-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <textarea
          ref={editorRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          placeholder="Start typing to collaborate in real-time..."
          className="w-full h-96 p-4 bg-transparent text-gray-300 placeholder-gray-600 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          style={{ lineHeight: '1.6' }}
        />

        {/* Cursor Indicators */}
        {collaborators.map((collaborator) => (
          collaborator.cursor && (
            <motion.div
              key={collaborator.id}
              className="absolute pointer-events-none"
              style={{
                left: `${(collaborator.cursor.position / content.length) * 100}%`,
                top: '16px',
                height: '20px',
                width: '2px',
                backgroundColor: collaborator.color,
                zIndex: 10
              }}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-4 border-t border-cyan-500/10 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>Last saved: {formatLastSaved()}</span>
          <span className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Eye className="w-3 h-3" />
          <span>{content.length} characters</span>
        </div>
      </div>
    </div>
  );
};

export default CollaborativeEditor;
