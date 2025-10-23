import { CRDTDocument, createSnapshot } from './crdt';

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  content: string;
  snapshot: Uint8Array;
  createdBy: {
    userId: string;
    userName: string;
  };
  createdAt: Date;
  changes: VersionChange[];
  metadata: {
    title?: string;
    description?: string;
    tags?: string[];
    size: number;
    changeCount: number;
  };
}

export interface VersionChange {
  type: 'insert' | 'delete' | 'replace';
  position: number;
  length?: number;
  text?: string;
  timestamp: Date;
}

export interface VersionDiff {
  additions: number;
  deletions: number;
  changes: VersionChange[];
  similarity: number; // 0-100%
}

class VersionManager {
  private versions: Map<string, DocumentVersion[]> = new Map();
  private currentVersion: Map<string, number> = new Map();
  private maxVersionsPerDocument: number = 100;

  /**
   * Create a new version
   */
  public async createVersion(
    doc: CRDTDocument,
    createdBy: { userId: string; userName: string },
    description?: string
  ): Promise<DocumentVersion> {
    const documentId = doc.id;
    const versions = this.versions.get(documentId) || [];
    const versionNumber = (this.currentVersion.get(documentId) || 0) + 1;

    const content = doc.content.toString();
    const snapshot = createSnapshot(doc);

    // Calculate changes from previous version
    const changes = this.calculateChanges(documentId, content);

    const version: DocumentVersion = {
      id: `${documentId}-v${versionNumber}`,
      documentId,
      version: versionNumber,
      content,
      snapshot,
      createdBy,
      createdAt: new Date(),
      changes,
      metadata: {
        title: doc.metadata.get('title'),
        description,
        tags: doc.metadata.get('tags') || [],
        size: content.length,
        changeCount: changes.length
      }
    };

    versions.push(version);

    // Keep only last N versions
    if (versions.length > this.maxVersionsPerDocument) {
      versions.shift();
    }

    this.versions.set(documentId, versions);
    this.currentVersion.set(documentId, versionNumber);

    console.log(`✅ Created version ${versionNumber} for document ${documentId}`);
    return version;
  }

  /**
   * Get all versions for a document
   */
  public getVersions(documentId: string): DocumentVersion[] {
    return this.versions.get(documentId) || [];
  }

  /**
   * Get specific version
   */
  public getVersion(documentId: string, versionNumber: number): DocumentVersion | null {
    const versions = this.versions.get(documentId) || [];
    return versions.find(v => v.version === versionNumber) || null;
  }

  /**
   * Get latest version
   */
  public getLatestVersion(documentId: string): DocumentVersion | null {
    const versions = this.versions.get(documentId) || [];
    return versions[versions.length - 1] || null;
  }

  /**
   * Compare two versions
   */
  public compareVersions(
    documentId: string,
    version1: number,
    version2: number
  ): VersionDiff | null {
    const v1 = this.getVersion(documentId, version1);
    const v2 = this.getVersion(documentId, version2);

    if (!v1 || !v2) return null;

    return this.diff(v1.content, v2.content);
  }

  /**
   * Restore document to specific version
   */
  public async restoreVersion(
    doc: CRDTDocument,
    versionNumber: number
  ): Promise<boolean> {
    const version = this.getVersion(doc.id, versionNumber);
    if (!version) return false;

    // Clear current content
    const currentLength = doc.content.length;
    if (currentLength > 0) {
      doc.content.delete(0, currentLength);
    }

    // Insert version content
    doc.content.insert(0, version.content);

    console.log(`✅ Restored document ${doc.id} to version ${versionNumber}`);
    return true;
  }

  /**
   * Delete version
   */
  public deleteVersion(documentId: string, versionNumber: number): boolean {
    const versions = this.versions.get(documentId) || [];
    const index = versions.findIndex(v => v.version === versionNumber);

    if (index === -1) return false;

    versions.splice(index, 1);
    this.versions.set(documentId, versions);

    console.log(`🗑️ Deleted version ${versionNumber} from document ${documentId}`);
    return true;
  }

  /**
   * Delete all versions for a document
   */
  public deleteAllVersions(documentId: string): void {
    this.versions.delete(documentId);
    this.currentVersion.delete(documentId);
    console.log(`🗑️ Deleted all versions for document ${documentId}`);
  }

  /**
   * Auto-save version (debounced)
   */
  private autoSaveTimers: Map<string, NodeJS.Timeout> = new Map();

  public scheduleAutoSave(
    doc: CRDTDocument,
    createdBy: { userId: string; userName: string },
    delayMs: number = 30000 // 30 seconds
  ): void {
    const existingTimer = this.autoSaveTimers.get(doc.id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      this.createVersion(doc, createdBy, 'Auto-saved');
      this.autoSaveTimers.delete(doc.id);
    }, delayMs);

    this.autoSaveTimers.set(doc.id, timer);
  }

  /**
   * Private: Calculate changes between versions
   */
  private calculateChanges(documentId: string, newContent: string): VersionChange[] {
    const previousVersion = this.getLatestVersion(documentId);
    if (!previousVersion) return [];

    const oldContent = previousVersion.content;
    return this.computeChanges(oldContent, newContent);
  }

  /**
   * Private: Compute changes using simple diff algorithm
   */
  private computeChanges(oldText: string, newText: string): VersionChange[] {
    const changes: VersionChange[] = [];

    // Simple implementation - in production, use a proper diff library
    if (oldText === newText) return changes;

    // Find common prefix
    let prefixLength = 0;
    while (
      prefixLength < oldText.length &&
      prefixLength < newText.length &&
      oldText[prefixLength] === newText[prefixLength]
    ) {
      prefixLength++;
    }

    // Find common suffix
    let suffixLength = 0;
    while (
      suffixLength < oldText.length - prefixLength &&
      suffixLength < newText.length - prefixLength &&
      oldText[oldText.length - 1 - suffixLength] === newText[newText.length - 1 - suffixLength]
    ) {
      suffixLength++;
    }

    const oldMiddle = oldText.slice(prefixLength, oldText.length - suffixLength);
    const newMiddle = newText.slice(prefixLength, newText.length - suffixLength);

    if (oldMiddle.length > 0 && newMiddle.length > 0) {
      changes.push({
        type: 'replace',
        position: prefixLength,
        length: oldMiddle.length,
        text: newMiddle,
        timestamp: new Date()
      });
    } else if (oldMiddle.length > 0) {
      changes.push({
        type: 'delete',
        position: prefixLength,
        length: oldMiddle.length,
        timestamp: new Date()
      });
    } else if (newMiddle.length > 0) {
      changes.push({
        type: 'insert',
        position: prefixLength,
        text: newMiddle,
        timestamp: new Date()
      });
    }

    return changes;
  }

  /**
   * Private: Compute diff between two strings
   */
  private diff(text1: string, text2: string): VersionDiff {
    const changes = this.computeChanges(text1, text2);
    
    let additions = 0;
    let deletions = 0;

    changes.forEach(change => {
      if (change.type === 'insert') {
        additions += change.text?.length || 0;
      } else if (change.type === 'delete') {
        deletions += change.length || 0;
      } else if (change.type === 'replace') {
        deletions += change.length || 0;
        additions += change.text?.length || 0;
      }
    });

    // Calculate similarity (simple version)
    const maxLength = Math.max(text1.length, text2.length);
    const similarity = maxLength > 0
      ? Math.round(((maxLength - (additions + deletions)) / maxLength) * 100)
      : 100;

    return {
      additions,
      deletions,
      changes,
      similarity
    };
  }

  /**
   * Get version history statistics
   */
  public getStatistics(documentId: string): {
    totalVersions: number;
    oldestVersion: Date | null;
    newestVersion: Date | null;
    totalChanges: number;
    averageChangeSize: number;
  } {
    const versions = this.versions.get(documentId) || [];

    if (versions.length === 0) {
      return {
        totalVersions: 0,
        oldestVersion: null,
        newestVersion: null,
        totalChanges: 0,
        averageChangeSize: 0
      };
    }

    const totalChanges = versions.reduce((sum, v) => sum + v.changes.length, 0);
    const averageChangeSize = totalChanges / versions.length;

    return {
      totalVersions: versions.length,
      oldestVersion: versions[0].createdAt,
      newestVersion: versions[versions.length - 1].createdAt,
      totalChanges,
      averageChangeSize
    };
  }

  /**
   * Export versions to JSON
   */
  public exportVersions(documentId: string): any {
    const versions = this.versions.get(documentId) || [];
    
    return {
      documentId,
      currentVersion: this.currentVersion.get(documentId) || 0,
      versions: versions.map(v => ({
        id: v.id,
        version: v.version,
        content: v.content,
        createdBy: v.createdBy,
        createdAt: v.createdAt,
        metadata: v.metadata
      }))
    };
  }

  /**
   * Set maximum versions per document
   */
  public setMaxVersions(max: number): void {
    this.maxVersionsPerDocument = Math.max(1, max);
  }
}

// Singleton instance
let versionManagerInstance: VersionManager | null = null;

export function getVersionManager(): VersionManager {
  if (!versionManagerInstance) {
    versionManagerInstance = new VersionManager();
  }
  return versionManagerInstance;
}

export function resetVersionManager(): void {
  versionManagerInstance = null;
}

export default VersionManager;
