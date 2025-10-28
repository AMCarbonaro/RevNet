# Phase 11: Real-time Collaboration (Google Docs-style)

## Overview

Enterprise-grade real-time collaboration system featuring conflict-free replicated data types (CRDT), user presence tracking, cursor synchronization, comments, and version history - enabling Google Docs-style collaborative editing.

## Features Implemented

### 1. CRDT Implementation (Yjs)

**File**: `src/lib/collaboration/crdt.ts`

Conflict-free Replicated Data Type implementation using Yjs for real-time collaborative editing without conflicts.

**Key Features**:
- Document creation and management
- WebSocket provider for real-time sync
- Text operations (insert, delete, replace)
- Metadata management
- Cursor tracking and synchronization
- Collaborative awareness
- Document snapshots
- Undo/redo support
- Document merging

**Core Functions**:
- `createCRDTDocument()` - Initialize new collaborative document
- `connectCRDTProvider()` - Connect to WebSocket sync server
- `insertText()` / `deleteText()` / `replaceText()` - Text operations
- `updateCursor()` - Broadcast cursor position
- `getCollaboratorCursors()` - Get all active cursors
- `onDocumentChange()` - Subscribe to content updates
- `createSnapshot()` / `restoreFromSnapshot()` - Version snapshots

### 2. Presence Management

**File**: `src/lib/collaboration/presence.ts`

Real-time user presence system tracking online users, their status, and activities.

**Key Features**:
- User status tracking (active, idle, away, offline)
- Automatic idle detection (5 minutes)
- Automatic away status (15 minutes)
- Cursor position tracking
- Typing indicators
- Heartbeat mechanism
- Stale user cleanup
- Per-document presence

**Presence States**:
- **Active**: User is actively working
- **Idle**: No activity for 5 minutes
- **Away**: No activity for 15 minutes  
- **Offline**: User disconnected

**Core Methods**:
- `initialize()` - Set up presence for local user
- `updatePresence()` - Update user status
- `updateCursor()` - Sync cursor position
- `setTyping()` - Set typing indicator
- `getActiveUsers()` - Get all online users
- `getUsersInDocument()` - Get users in specific document
- `cleanupStaleUsers()` - Remove inactive users

### 3. Version History & Control

**File**: `src/lib/collaboration/versioning.ts`

Comprehensive version management system with diff comparison and restoration.

**Key Features**:
- Automatic version creation
- Version snapshots
- Change tracking
- Diff calculation
- Version comparison
- Version restoration
- Auto-save with debouncing
- Version metadata (title, description, tags)
- Statistics and analytics

**Version Operations**:
- `createVersion()` - Save new version
- `getVersions()` - List all versions
- `getVersion()` - Get specific version
- `compareVersions()` - Diff two versions
- `restoreVersion()` - Revert to previous version
- `deleteVersion()` - Remove version
- `scheduleAutoSave()` - Debounced auto-save

**Version Metadata**:
- Version number
- Author information
- Creation timestamp
- Content snapshot
- Change list
- File size
- Change count

### 4. Comments System

**File**: `src/components/collaboration/Comments.tsx`

Threaded comment system with reactions, replies, and resolution tracking.

**Key Features**:
- Create, edit, delete comments
- Threaded replies
- Emoji reactions (likes, hearts)
- Comment resolution
- Position anchoring
- Real-time updates
- Keyboard shortcuts (Cmd/Ctrl + Enter)

**Comment Features**:
- **Threading**: Reply to comments
- **Reactions**: Like and love reactions
- **Resolution**: Mark comments as resolved
- **Editing**: Edit own comments
- **Deletion**: Remove comments
- **Anchoring**: Link comments to document positions

### 5. Version History UI

**File**: `src/components/collaboration/VersionHistory.tsx`

Visual interface for browsing, comparing, and restoring document versions.

**Key Features**:
- Version timeline
- Version comparison with diff stats
- Version restoration
- Version preview
- Author and timestamp display
- Change statistics
- Tag filtering

**UI Elements**:
- Version list with metadata
- Version detail modal
- Diff comparison modal
- Restore confirmation
- Download options

### 6. Collaborative Editor

**File**: `src/components/realtime/CollaborativeEditor.tsx`

Enhanced from Phase 9 files - Real-time collaborative text editor with presence.

**Key Features**:
- Live multi-user editing
- Cursor indicators for each user
- Typing indicators
- Connection status
- Auto-save with timestamps
- User avatars and colors
- Read-only mode support

### 7. Live Activity Feed

**File**: `src/components/realtime/LiveActivityFeed.tsx`

Real-time feed showing document activities and user actions.

**Key Features**:
- Real-time activity stream
- Online user count
- Activity icons and formatting
- Auto-scroll option
- Connection status indicator

### 8. Custom React Hook

**File**: `src/hooks/useCollaboration.ts`

Comprehensive React hook that integrates all collaboration features.

**Hook Features**:
- Document state management
- Real-time synchronization
- Collaborator tracking
- Cursor management
- Presence updates
- Version control
- Auto-save
- Connection management

**Usage Example**:
```typescript
const {
  content,
  isConnected,
  collaborators,
  cursors,
  insert,
  delete: deleteText,
  setCursor,
  setTyping,
  saveVersion
} = useCollaboration({
  documentId: 'doc-123',
  userId: 'user-456',
  userName: 'John Doe',
  userColor: '#00ff88'
});
```

### 9. API Integration

**File**: `src/app/api/collaboration/route.ts`

RESTful API for collaboration features.

**Endpoints**:
- `GET /api/collaboration?action=presence` - Get active collaborators
- `GET /api/collaboration?action=versions` - Get version history
- `GET /api/collaboration?action=comments` - Get comments
- `POST /api/collaboration` - Update presence, create versions, add comments

## Dependencies

Added to `package.json`:

```json
{
  "dependencies": {
    "yjs": "^13.6.11",
    "y-websocket": "^2.0.4",
    "y-protocols": "^1.0.6",
    "lib0": "^0.2.94"
  }
}
```

## Architecture

### CRDT (Conflict-Free Replicated Data Type)

```
┌─────────────┐
│   Client A  │ ───┐
└─────────────┘    │
                   │    ┌──────────────┐
┌─────────────┐    ├───→│ WebSocket   │
│   Client B  │ ───┘    │   Server    │
└─────────────┘         └──────────────┘
                              │
┌─────────────┐              │
│   Client C  │ ─────────────┘
└─────────────┘

All clients sync through CRDT,
guaranteeing eventual consistency
```

### Presence System

```
User Activity → Presence Manager → WebSocket → All Clients
                     ↓
              Status Updates:
              - Active (< 5min idle)
              - Idle (5-15min idle)
              - Away (> 15min idle)
              - Offline (disconnected)
```

### Version Management

```
Document Changes → Auto-save Timer → Create Version
                       (30s debounce)
                              ↓
                    Store in Version History
                              ↓
                    Calculate Diffs & Stats
```

## Configuration

### WebSocket Server

For production, you'll need a WebSocket server for CRDT synchronization:

```javascript
// server.js (example with y-websocket)
const WebSocket = require('ws');
const { setupWSConnection } = require('y-websocket/bin/utils');

const wss = new WebSocket.Server({ port: 1234 });

wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req);
});
```

### Environment Variables

```env
# Collaboration Settings
COLLABORATION_WS_URL=ws://localhost:1234
COLLABORATION_AUTO_SAVE=true
COLLABORATION_AUTO_SAVE_DELAY=30000
```

## Usage Examples

### Basic Collaborative Document

```typescript
import { useCollaboration } from '@/hooks/useCollaboration';
import CollaborativeEditor from '@/components/realtime/CollaborativeEditor';

function DocumentEditor({ documentId }) {
  const {
    content,
    isConnected,
    collaborators,
    insert,
    setCursor
  } = useCollaboration({
    documentId,
    userId: session.user.id,
    userName: session.user.name
  });

  return (
    <div>
      <CollaborativeEditor
        documentId={documentId}
        initialContent={content}
      />
      <div>
        {collaborators.length} users editing
      </div>
    </div>
  );
}
```

### With Comments

```typescript
import Comments from '@/components/collaboration/Comments';

function DocumentWithComments({ documentId }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">
        <CollaborativeEditor documentId={documentId} />
      </div>
      <div>
        <Comments documentId={documentId} />
      </div>
    </div>
  );
}
```

### With Version History

```typescript
import VersionHistory from '@/components/collaboration/VersionHistory';

function DocumentWithVersions({ documentId }) {
  const { saveVersion } = useCollaboration({...});

  const handleRestore = async (version) => {
    // Restore to specific version
  };

  return (
    <div>
      <button onClick={() => saveVersion('Manual save')}>
        Save Version
      </button>
      <VersionHistory 
        documentId={documentId}
        onRestore={handleRestore}
      />
    </div>
  );
}
```

## Conflict Resolution

CRDTs automatically resolve conflicts through:

1. **Operational Transformation**: Each edit is transformed based on concurrent edits
2. **Vector Clocks**: Track causal relationships between edits
3. **Commutative Operations**: Operations can be applied in any order
4. **Eventually Consistent**: All clients converge to the same state

## Performance Optimizations

1. **Debounced Updates**: Cursor updates throttled to 100ms
2. **Batch Operations**: Multiple edits batched into single sync
3. **Incremental Sync**: Only deltas synced, not full document
4. **Stale User Cleanup**: Remove inactive users after 5 minutes
5. **Auto-save Debouncing**: 30-second delay before creating version

## Security Considerations

1. **Authentication Required**: All API endpoints check user session
2. **Document Permissions**: Verify user has access to document
3. **Rate Limiting**: Prevent spam in comments and presence updates
4. **Input Sanitization**: Clean user-generated content
5. **WebSocket Authentication**: Verify user identity on connection

## Limitations & Known Issues

1. **WebSocket Requirement**: Requires separate WebSocket server
2. **Memory Usage**: Large documents may consume significant memory
3. **Version Storage**: Older versions stored in memory (100 max per document)
4. **Browser Support**: Requires modern browser with WebSocket support

## Future Enhancements

1. **Rich Text Support**: Beyond plain text (bold, italic, etc.)
2. **Document Permissions**: Read-only, comment-only, edit access
3. **Offline Support**: Queue changes for later sync
4. **Video Chat**: Integrate video/audio for collaborators
5. **Mention System**: @mention users in comments
6. **Change Suggestions**: Google Docs-style suggestion mode
7. **Document Locking**: Prevent editing specific sections
8. **Export Formats**: PDF, Markdown, DOCX export

## Testing

### Unit Tests
```bash
npm test -- collaboration
```

### Integration Tests
```bash
npm run test:integration -- collaboration
```

### Load Testing
```bash
# Test with 100 concurrent collaborators
npm run test:load -- collaboration-load-test.js
```

## Monitoring

Key metrics to monitor:

- **Active Connections**: Number of WebSocket connections
- **Sync Latency**: Time for edits to propagate
- **Version Count**: Total versions across all documents
- **Memory Usage**: CRDT document size in memory
- **Error Rate**: Failed sync attempts

## Conclusion

Phase 11 implements a production-ready, Google Docs-style collaboration system with CRDT for conflict-free editing, comprehensive presence tracking, threaded comments, and robust version control. The system is designed for scalability, performance, and excellent user experience.
