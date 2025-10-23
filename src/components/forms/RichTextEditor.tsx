'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useState, useCallback } from 'react';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo, 
  Link as LinkIcon,
  Image as ImageIcon,
  Save
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  autoSave?: boolean;
  onAutoSave?: (content: string) => void;
}

export default function RichTextEditor({ 
  content, 
  onChange, 
  placeholder = "Start writing...",
  autoSave = false,
  onAutoSave
}: RichTextEditorProps) {
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded border border-terminal-green',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-terminal-cyan hover:text-terminal-green underline',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      
      if (autoSave && onAutoSave) {
        handleAutoSave(html);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] p-4 bg-black border border-terminal-green rounded',
      },
    },
  });

  const handleAutoSave = useCallback(
    debounce(async (content: string) => {
      setIsAutoSaving(true);
      try {
        await onAutoSave?.(content);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsAutoSaving(false);
      }
    }, 2000),
    [onAutoSave]
  );

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  const saveContent = () => {
    if (editor && onAutoSave) {
      onAutoSave(editor.getHTML());
      setLastSaved(new Date());
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-black/20 border border-terminal-green rounded">
        {/* Text formatting */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('bold')
                ? 'bg-terminal-green text-black'
                : 'text-terminal-cyan hover:bg-terminal-green hover:text-black'
            }`}
          >
            <Bold className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('italic')
                ? 'bg-terminal-green text-black'
                : 'text-terminal-cyan hover:bg-terminal-green hover:text-black'
            }`}
          >
            <Italic className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('underline')
                ? 'bg-terminal-green text-black'
                : 'text-terminal-cyan hover:bg-terminal-green hover:text-black'
            }`}
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-terminal-green"></div>

        {/* Lists */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('bulletList')
                ? 'bg-terminal-green text-black'
                : 'text-terminal-cyan hover:bg-terminal-green hover:text-black'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('orderedList')
                ? 'bg-terminal-green text-black'
                : 'text-terminal-cyan hover:bg-terminal-green hover:text-black'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded transition-colors ${
              editor.isActive('blockquote')
                ? 'bg-terminal-green text-black'
                : 'text-terminal-cyan hover:bg-terminal-green hover:text-black'
            }`}
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-terminal-green"></div>

        {/* Media */}
        <div className="flex items-center gap-1">
          <button
            onClick={addLink}
            className={`p-2 rounded transition-colors ${
              editor.isActive('link')
                ? 'bg-terminal-green text-black'
                : 'text-terminal-cyan hover:bg-terminal-green hover:text-black'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={addImage}
            className="p-2 rounded transition-colors text-terminal-cyan hover:bg-terminal-green hover:text-black"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-terminal-green"></div>

        {/* History */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="p-2 rounded transition-colors text-terminal-cyan hover:bg-terminal-green hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Undo className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="p-2 rounded transition-colors text-terminal-cyan hover:bg-terminal-green hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Auto-save indicator */}
        {autoSave && (
          <div className="ml-auto flex items-center gap-2 text-xs text-terminal-cyan">
            {isAutoSaving ? (
              <span>Auto-saving...</span>
            ) : lastSaved ? (
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            ) : (
              <span>Ready</span>
            )}
          </div>
        )}

        {/* Manual save button */}
        {onAutoSave && !autoSave && (
          <button
            onClick={saveContent}
            className="ml-auto p-2 rounded transition-colors text-terminal-green hover:bg-terminal-green hover:text-black"
          >
            <Save className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Editor */}
      <div className="min-h-[200px] border border-terminal-green rounded overflow-hidden">
        <EditorContent editor={editor} />
      </div>

      {/* Character count */}
      <div className="text-right text-xs text-terminal-cyan">
        {editor.storage.characterCount?.characters() || 0} characters
      </div>
    </div>
  );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
