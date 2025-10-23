'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Send, Trash2, Edit2, Check, X, 
  MoreVertical, Reply, Heart, AlertCircle 
} from 'lucide-react';

export interface Comment {
  id: string;
  documentId: string;
  content: string;
  position?: number; // Character position in document
  selection?: {
    start: number;
    end: number;
  };
  author: {
    userId: string;
    userName: string;
    userAvatar?: string;
  };
  createdAt: Date;
  updatedAt?: Date;
  replies?: Comment[];
  reactions?: {
    likes: number;
    loved: number;
  };
  isResolved?: boolean;
  isEditing?: boolean;
}

interface CommentsProps {
  documentId: string;
  selectedPosition?: number;
  onClose?: () => void;
  className?: string;
}

const Comments: React.FC<CommentsProps> = ({
  documentId,
  selectedPosition,
  onClose,
  className = ''
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchComments();
  }, [documentId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/collaboration/comments?documentId=${documentId}`);
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      documentId,
      content: newComment,
      position: selectedPosition,
      author: {
        userId: 'current-user',
        userName: 'Current User'
      },
      createdAt: new Date(),
      reactions: { likes: 0, loved: 0 }
    };

    if (replyTo) {
      // Add as reply
      setComments(prev =>
        prev.map(c =>
          c.id === replyTo
            ? { ...c, replies: [...(c.replies || []), comment] }
            : c
        )
      );
    } else {
      setComments(prev => [...prev, comment]);
    }

    setNewComment('');
    setReplyTo(null);

    // TODO: Send to API
    try {
      await fetch('/api/collaboration/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment)
      });
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleEditComment = (commentId: string, newContent: string) => {
    setComments(prev =>
      prev.map(c =>
        c.id === commentId
          ? { ...c, content: newContent, updatedAt: new Date() }
          : c
      )
    );
    setEditingId(null);
    setEditContent('');

    // TODO: Update via API
  };

  const handleDeleteComment = (commentId: string) => {
    if (!confirm('Delete this comment?')) return;

    setComments(prev => prev.filter(c => c.id !== commentId));

    // TODO: Delete via API
  };

  const handleResolveComment = (commentId: string) => {
    setComments(prev =>
      prev.map(c =>
        c.id === commentId ? { ...c, isResolved: !c.isResolved } : c
      )
    );

    // TODO: Update via API
  };

  const handleReaction = (commentId: string, type: 'likes' | 'loved') => {
    setComments(prev =>
      prev.map(c => {
        if (c.id === commentId && c.reactions) {
          return {
            ...c,
            reactions: {
              ...c.reactions,
              [type]: c.reactions[type] + 1
            }
          };
        }
        return c;
      })
    );

    // TODO: Update via API
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => {
    const isEditing = editingId === comment.id;

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`${isReply ? 'ml-8' : ''} mb-4`}
      >
        <div
          className={`bg-black/40 border rounded-lg p-4 ${
            comment.isResolved
              ? 'border-green-500/30 opacity-60'
              : 'border-cyan-500/10'
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-sm">
                {comment.author.userName[0]}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-300">
                  {comment.author.userName}
                </p>
                <p className="text-xs text-gray-500">
                  {formatTimestamp(comment.createdAt)}
                  {comment.updatedAt && ' (edited)'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {comment.isResolved && (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400">
                  <Check className="w-3 h-3" />
                  <span>Resolved</span>
                </div>
              )}

              <button
                onClick={() => handleResolveComment(comment.id)}
                className="p-1 hover:bg-gray-500/20 rounded transition-colors"
                title={comment.isResolved ? 'Unresolve' : 'Resolve'}
              >
                <Check className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => {
                  setEditingId(comment.id);
                  setEditContent(comment.content);
                }}
                className="p-1 hover:bg-gray-500/20 rounded transition-colors"
              >
                <Edit2 className="w-4 h-4 text-gray-400" />
              </button>

              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="p-1 hover:bg-gray-500/20 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="mb-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 bg-black/40 border border-cyan-500/30 rounded text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEditComment(comment.id, editContent)}
                  className="flex items-center gap-1 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded text-cyan-400 text-sm transition-colors"
                >
                  <Check className="w-3 h-3" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditContent('');
                  }}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 rounded text-gray-400 text-sm transition-colors"
                >
                  <X className="w-3 h-3" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-300 text-sm mb-3 whitespace-pre-wrap">
              {comment.content}
            </p>
          )}

          {/* Reactions and Reply */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleReaction(comment.id, 'likes')}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-cyan-400 transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
              <span>{comment.reactions?.likes || 0}</span>
            </button>

            <button
              onClick={() => handleReaction(comment.id, 'loved')}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-pink-400 transition-colors"
            >
              <Heart className="w-3 h-3" />
              <span>{comment.reactions?.loved || 0}</span>
            </button>

            {!isReply && (
              <button
                onClick={() => setReplyTo(comment.id)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-cyan-400 transition-colors"
              >
                <Reply className="w-3 h-3" />
                <span>Reply</span>
              </button>
            )}
          </div>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}

        {/* Reply Input */}
        {replyTo === comment.id && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="ml-8 mt-2"
          >
            <div className="bg-black/40 border border-cyan-500/10 rounded-lg p-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a reply..."
                className="w-full p-2 bg-transparent border-none text-gray-300 text-sm focus:outline-none resize-none"
                rows={2}
                autoFocus
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSubmitComment}
                  className="flex items-center gap-1 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded text-cyan-400 text-sm transition-colors"
                >
                  <Send className="w-3 h-3" />
                  Reply
                </button>
                <button
                  onClick={() => {
                    setReplyTo(null);
                    setNewComment('');
                  }}
                  className="px-3 py-1 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 rounded text-gray-400 text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className={`bg-black/20 border border-cyan-500/20 rounded-lg flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cyan-500/10">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-cyan-400" />
          <h3 className="text-cyan-400 font-mono">
            Comments ({comments.length})
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-500/20 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <AnimatePresence>
          {comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No comments yet</p>
            </div>
          ) : (
            comments.map(comment => renderComment(comment))
          )}
        </AnimatePresence>
      </div>

      {/* New Comment Input */}
      {!replyTo && (
        <div className="p-4 border-t border-cyan-500/10">
          <div className="bg-black/40 border border-cyan-500/10 rounded-lg p-3">
            <textarea
              ref={inputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-2 bg-transparent border-none text-gray-300 text-sm focus:outline-none resize-none"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmitComment();
                }
              }}
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                Cmd/Ctrl + Enter to submit
              </p>
              <button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded text-cyan-400 text-sm transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comments;
