import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CRDTDocument, 
  createCRDTDocument, 
  connectCRDTProvider,
  disconnectCRDTProvider,
  insertText,
  deleteText,
  getDocumentContent,
  updateCursor,
  getCollaboratorCursors,
  onDocumentChange,
  onCursorChange,
  CollaboratorCursor
} from '@/lib/collaboration/crdt';
import { 
  UserPresenceData, 
  getPresenceManager 
} from '@/lib/collaboration/presence';
import {
  getVersionManager
} from '@/lib/collaboration/versioning';

export interface UseCollaborationOptions {
  documentId: string;
  userId: string;
  userName: string;
  userColor?: string;
  wsUrl?: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export interface UseCollaborationReturn {
  // Document state
  content: string;
  isConnected: boolean;
  isSynced: boolean;

  // Collaborators
  collaborators: UserPresenceData[];
  cursors: CollaboratorCursor[];
  typingUsers: UserPresenceData[];

  // Document operations
  insert: (position: number, text: string) => void;
  delete: (position: number, length: number) => void;
  replace: (start: number, end: number, newText: string) => void;

  // Cursor operations
  setCursor: (position: number, selection?: { start: number; end: number }) => void;

  // Presence operations
  setTyping: (isTyping: boolean) => void;
  setStatus: (status: 'active' | 'idle' | 'away' | 'offline') => void;

  // Version operations
  saveVersion: (description?: string) => Promise<void>;
  
  // Cleanup
  disconnect: () => void;
}

export function useCollaboration(
  options: UseCollaborationOptions
): UseCollaborationReturn {
  const {
    documentId,
    userId,
    userName,
    userColor = '#00ff88',
    wsUrl = 'ws://localhost:3000',
    autoSave = true,
    autoSaveDelay = 30000
  } = options;

  const [content, setContent] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [collaborators, setCollaborators] = useState<UserPresenceData[]>([]);
  const [cursors, setCursors] = useState<CollaboratorCursor[]>([]);
  const [typingUsers, setTypingUsers] = useState<UserPresenceData[]>([]);

  const docRef = useRef<CRDTDocument | null>(null);
  const presenceManager = useRef(getPresenceManager());
  const versionManager = useRef(getVersionManager());

  // Initialize document and connect
  useEffect(() => {
    // Create CRDT document
    const doc = createCRDTDocument(documentId);
    docRef.current = doc;

    // Connect to WebSocket provider
    try {
      const provider = connectCRDTProvider(doc, wsUrl, documentId, {
        userId,
        userName,
        userColor
      });

      // Handle connection status
      provider.on('status', (event: { status: string }) => {
        setIsConnected(event.status === 'connected');
      });

      provider.on('sync', (synced: boolean) => {
        setIsSynced(synced);
      });

      // Subscribe to document changes
      const unsubscribeDoc = onDocumentChange(doc, (newContent) => {
        setContent(newContent);
      });

      // Subscribe to cursor changes
      const unsubscribeCursors = onCursorChange(doc, (newCursors) => {
        setCursors(newCursors);
      });

      // Initialize presence
      presenceManager.current.initialize({
        userId,
        userName,
        userColor,
        currentDocument: documentId
      });

      // Subscribe to presence changes
      const unsubscribePresence = presenceManager.current.subscribe((users) => {
        setCollaborators(users.filter(u => u.currentDocument === documentId));
        setTypingUsers(users.filter(u => u.isTyping && u.userId !== userId));
      });

      // Cleanup
      return () => {
        unsubscribeDoc();
        unsubscribeCursors();
        unsubscribePresence();
        disconnectCRDTProvider(doc);
        presenceManager.current.destroy();
      };
    } catch (error) {
      console.error('Failed to connect to collaboration server:', error);
      // Fallback to local-only mode
      setContent(getDocumentContent(doc));
    }
  }, [documentId, userId, userName, userColor, wsUrl]);

  // Auto-save versions
  useEffect(() => {
    if (!autoSave || !docRef.current) return;

    const timer = setInterval(() => {
      if (docRef.current) {
        versionManager.current.scheduleAutoSave(
          docRef.current,
          { userId, userName },
          autoSaveDelay
        );
      }
    }, autoSaveDelay);

    return () => clearInterval(timer);
  }, [autoSave, autoSaveDelay, userId, userName]);

  // Document operations
  const insert = useCallback((position: number, text: string) => {
    if (!docRef.current) return;
    insertText(docRef.current, position, text);
  }, []);

  const deleteOp = useCallback((position: number, length: number) => {
    if (!docRef.current) return;
    deleteText(docRef.current, position, length);
  }, []);

  const replace = useCallback((start: number, end: number, newText: string) => {
    if (!docRef.current) return;
    const length = end - start;
    deleteText(docRef.current, start, length);
    insertText(docRef.current, start, newText);
  }, []);

  // Cursor operations
  const setCursor = useCallback((position: number, selection?: { start: number; end: number }) => {
    if (!docRef.current) return;
    updateCursor(docRef.current, position, selection);
    presenceManager.current.updateCursor(position, selection);
  }, []);

  // Presence operations
  const setTyping = useCallback((isTyping: boolean) => {
    presenceManager.current.setTyping(isTyping);
  }, []);

  const setStatus = useCallback((status: 'active' | 'idle' | 'away' | 'offline') => {
    presenceManager.current.updatePresence({ status });
  }, []);

  // Version operations
  const saveVersion = useCallback(async (description?: string) => {
    if (!docRef.current) return;

    await versionManager.current.createVersion(
      docRef.current,
      { userId, userName },
      description
    );
  }, [userId, userName]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (docRef.current) {
      disconnectCRDTProvider(docRef.current);
    }
    presenceManager.current.destroy();
  }, []);

  return {
    content,
    isConnected,
    isSynced,
    collaborators,
    cursors,
    typingUsers,
    insert,
    delete: deleteOp,
    replace,
    setCursor,
    setTyping,
    setStatus,
    saveVersion,
    disconnect
  };
}

export default useCollaboration;
