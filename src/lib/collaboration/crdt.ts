import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export interface CRDTDocument {
  id: string;
  ydoc: Y.Doc;
  provider: WebsocketProvider | null;
  content: Y.Text;
  metadata: Y.Map<any>;
  awareness: any;
}

export interface CollaboratorCursor {
  userId: string;
  userName: string;
  userColor: string;
  position: number;
  selection?: {
    start: number;
    end: number;
  };
}

/**
 * Create a new CRDT document
 */
export function createCRDTDocument(documentId: string): CRDTDocument {
  const ydoc = new Y.Doc();
  const content = ydoc.getText('content');
  const metadata = ydoc.getMap('metadata');

  return {
    id: documentId,
    ydoc,
    provider: null,
    content,
    metadata,
    awareness: null
  };
}

/**
 * Connect to WebSocket provider for real-time sync
 */
export function connectCRDTProvider(
  doc: CRDTDocument,
  wsUrl: string,
  room: string,
  userInfo: { userId: string; userName: string; userColor: string }
): WebsocketProvider {
  const provider = new WebsocketProvider(wsUrl, room, doc.ydoc, {
    connect: true
  });

  // Set user awareness (cursor position, selection, etc.)
  const awareness = provider.awareness;
  awareness.setLocalState({
    user: {
      id: userInfo.userId,
      name: userInfo.userName,
      color: userInfo.userColor
    }
  });

  doc.provider = provider;
  doc.awareness = awareness;

  // Handle connection events
  provider.on('status', (event: { status: string }) => {
    console.log(`CRDT connection status: ${event.status}`);
  });

  provider.on('sync', (isSynced: boolean) => {
    console.log(`CRDT synced: ${isSynced}`);
  });

  return provider;
}

/**
 * Disconnect from provider
 */
export function disconnectCRDTProvider(doc: CRDTDocument): void {
  if (doc.provider) {
    doc.provider.disconnect();
    doc.provider.destroy();
    doc.provider = null;
  }
}

/**
 * Insert text at position
 */
export function insertText(doc: CRDTDocument, position: number, text: string): void {
  doc.content.insert(position, text);
}

/**
 * Delete text from position
 */
export function deleteText(doc: CRDTDocument, position: number, length: number): void {
  doc.content.delete(position, length);
}

/**
 * Replace text range
 */
export function replaceText(
  doc: CRDTDocument,
  start: number,
  end: number,
  newText: string
): void {
  const length = end - start;
  doc.content.delete(start, length);
  doc.content.insert(start, newText);
}

/**
 * Get full document content
 */
export function getDocumentContent(doc: CRDTDocument): string {
  return doc.content.toString();
}

/**
 * Set document metadata
 */
export function setMetadata(doc: CRDTDocument, key: string, value: any): void {
  doc.metadata.set(key, value);
}

/**
 * Get document metadata
 */
export function getMetadata(doc: CRDTDocument, key: string): any {
  return doc.metadata.get(key);
}

/**
 * Get all metadata
 */
export function getAllMetadata(doc: CRDTDocument): Record<string, any> {
  const metadata: Record<string, any> = {};
  doc.metadata.forEach((value, key) => {
    metadata[key] = value;
  });
  return metadata;
}

/**
 * Update cursor position
 */
export function updateCursor(
  doc: CRDTDocument,
  position: number,
  selection?: { start: number; end: number }
): void {
  if (doc.awareness) {
    const currentState = doc.awareness.getLocalState();
    doc.awareness.setLocalState({
      ...currentState,
      cursor: {
        position,
        selection
      }
    });
  }
}

/**
 * Get all collaborator cursors
 */
export function getCollaboratorCursors(doc: CRDTDocument): CollaboratorCursor[] {
  if (!doc.awareness) return [];

  const cursors: CollaboratorCursor[] = [];
  const states = doc.awareness.getStates();

  states.forEach((state: any, clientId: number) => {
    if (state.user && state.cursor && clientId !== doc.awareness.clientID) {
      cursors.push({
        userId: state.user.id,
        userName: state.user.name,
        userColor: state.user.color,
        position: state.cursor.position,
        selection: state.cursor.selection
      });
    }
  });

  return cursors;
}

/**
 * Subscribe to document changes
 */
export function onDocumentChange(
  doc: CRDTDocument,
  callback: (content: string) => void
): () => void {
  const observer = () => {
    callback(doc.content.toString());
  };

  doc.content.observe(observer);

  // Return unsubscribe function
  return () => {
    doc.content.unobserve(observer);
  };
}

/**
 * Subscribe to cursor changes
 */
export function onCursorChange(
  doc: CRDTDocument,
  callback: (cursors: CollaboratorCursor[]) => void
): () => void {
  if (!doc.awareness) {
    return () => {};
  }

  const observer = () => {
    callback(getCollaboratorCursors(doc));
  };

  doc.awareness.on('change', observer);

  // Return unsubscribe function
  return () => {
    if (doc.awareness) {
      doc.awareness.off('change', observer);
    }
  };
}

/**
 * Create snapshot of document state
 */
export function createSnapshot(doc: CRDTDocument): Uint8Array {
  return Y.encodeStateAsUpdate(doc.ydoc);
}

/**
 * Restore document from snapshot
 */
export function restoreFromSnapshot(doc: CRDTDocument, snapshot: Uint8Array): void {
  Y.applyUpdate(doc.ydoc, snapshot);
}

/**
 * Get document history (requires Y.UndoManager)
 */
export function createUndoManager(doc: CRDTDocument): Y.UndoManager {
  return new Y.UndoManager(doc.content, {
    trackedOrigins: new Set([doc.ydoc.clientID])
  });
}

/**
 * Merge two documents
 */
export function mergeDocuments(targetDoc: CRDTDocument, sourceDoc: CRDTDocument): void {
  const update = Y.encodeStateAsUpdate(sourceDoc.ydoc);
  Y.applyUpdate(targetDoc.ydoc, update);
}

/**
 * Get conflict-free document size
 */
export function getDocumentSize(doc: CRDTDocument): number {
  return doc.content.length;
}

/**
 * Export document to JSON
 */
export function exportToJSON(doc: CRDTDocument): any {
  return {
    id: doc.id,
    content: doc.content.toString(),
    metadata: getAllMetadata(doc),
    size: getDocumentSize(doc)
  };
}

/**
 * Import document from JSON
 */
export function importFromJSON(documentId: string, data: any): CRDTDocument {
  const doc = createCRDTDocument(documentId);
  
  if (data.content) {
    doc.content.insert(0, data.content);
  }
  
  if (data.metadata) {
    Object.entries(data.metadata).forEach(([key, value]) => {
      doc.metadata.set(key, value);
    });
  }
  
  return doc;
}

export default {
  createCRDTDocument,
  connectCRDTProvider,
  disconnectCRDTProvider,
  insertText,
  deleteText,
  replaceText,
  getDocumentContent,
  setMetadata,
  getMetadata,
  getAllMetadata,
  updateCursor,
  getCollaboratorCursors,
  onDocumentChange,
  onCursorChange,
  createSnapshot,
  restoreFromSnapshot,
  createUndoManager,
  mergeDocuments,
  getDocumentSize,
  exportToJSON,
  importFromJSON
};
