'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Download, RotateCcw, Eye, Trash2, 
  User, Calendar, FileText, TrendingUp, ChevronDown 
} from 'lucide-react';
import { DocumentVersion, VersionDiff } from '@/lib/collaboration/versioning';

interface VersionHistoryProps {
  documentId: string;
  onRestore?: (version: number) => void;
  className?: string;
}

const VersionHistory: React.FC<VersionHistoryProps> = ({
  documentId,
  onRestore,
  className = ''
}) => {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [compareVersion, setCompareVersion] = useState<DocumentVersion | null>(null);
  const [diff, setDiff] = useState<VersionDiff | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVersions();
  }, [documentId]);

  const fetchVersions = async () => {
    try {
      // In production, fetch from API
      // For now, using dummy data
      const dummyVersions: DocumentVersion[] = [
        {
          id: 'v1',
          documentId,
          version: 1,
          content: 'Initial content',
          snapshot: new Uint8Array(),
          createdBy: {
            userId: 'user1',
            userName: 'Alice'
          },
          createdAt: new Date(Date.now() - 3600000 * 24),
          changes: [],
          metadata: {
            size: 100,
            changeCount: 0
          }
        },
        {
          id: 'v2',
          documentId,
          version: 2,
          content: 'Updated content with changes',
          snapshot: new Uint8Array(),
          createdBy: {
            userId: 'user2',
            userName: 'Bob'
          },
          createdAt: new Date(Date.now() - 3600000 * 12),
          changes: [],
          metadata: {
            size: 150,
            changeCount: 5
          }
        }
      ];

      setVersions(dummyVersions);
    } catch (error) {
      console.error('Error fetching versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (version: DocumentVersion) => {
    if (!confirm(`Restore to version ${version.version}?`)) return;

    if (onRestore) {
      onRestore(version.version);
    }

    // TODO: API call to restore version
  };

  const handleCompare = (v1: DocumentVersion, v2: DocumentVersion) => {
    // Calculate diff
    const mockDiff: VersionDiff = {
      additions: 50,
      deletions: 20,
      changes: [],
      similarity: 85
    };

    setDiff(mockDiff);
    setSelectedVersion(v1);
    setCompareVersion(v2);
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Less than an hour ago';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`bg-black/20 border border-cyan-500/20 rounded-lg flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-cyan-500/10">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          <h3 className="text-cyan-400 font-mono">Version History</h3>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {versions.length} version{versions.length !== 1 ? 's' : ''} saved
        </p>
      </div>

      {/* Versions List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No versions saved yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {versions.map((version, index) => (
                <motion.div
                  key={version.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-black/40 border border-cyan-500/10 rounded-lg p-4 hover:border-cyan-500/30 transition-colors"
                >
                  {/* Version Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-mono text-cyan-400">
                          v{version.version}
                        </span>
                        {index === 0 && (
                          <span className="px-2 py-0.5 bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400">
                            Current
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{version.createdBy.userName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatTimestamp(version.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>{version.metadata.size} chars</span>
                        </div>
                        {version.metadata.changeCount > 0 && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span>{version.metadata.changeCount} changes</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedVersion(version)}
                        className="p-2 hover:bg-cyan-500/20 rounded transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4 text-cyan-400" />
                      </button>

                      {index > 0 && (
                        <>
                          <button
                            onClick={() => handleRestore(version)}
                            className="p-2 hover:bg-green-500/20 rounded transition-colors"
                            title="Restore"
                          >
                            <RotateCcw className="w-4 h-4 text-green-400" />
                          </button>

                          <button
                            onClick={() => {
                              const previousVersion = versions[index - 1];
                              handleCompare(version, previousVersion);
                            }}
                            className="p-2 hover:bg-blue-500/20 rounded transition-colors"
                            title="Compare"
                          >
                            <ChevronDown className="w-4 h-4 text-blue-400" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {version.metadata.description && (
                    <p className="text-sm text-gray-400 mb-2">
                      {version.metadata.description}
                    </p>
                  )}

                  {/* Tags */}
                  {version.metadata.tags && version.metadata.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {version.metadata.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-xs text-cyan-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Version Detail Modal */}
      {selectedVersion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => setSelectedVersion(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-black border border-cyan-500/30 rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-mono text-cyan-400">
                Version {selectedVersion.version}
              </h3>
              <button
                onClick={() => setSelectedVersion(null)}
                className="p-2 hover:bg-gray-500/20 rounded transition-colors"
              >
                <Eye className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-cyan-500/5 rounded border border-cyan-500/10">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Author</p>
                    <p className="text-gray-300">{selectedVersion.createdBy.userName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Date</p>
                    <p className="text-gray-300">
                      {selectedVersion.createdAt.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Size</p>
                    <p className="text-gray-300">{selectedVersion.metadata.size} characters</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Changes</p>
                    <p className="text-gray-300">{selectedVersion.metadata.changeCount}</p>
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Content Preview</p>
                <div className="p-4 bg-black/40 border border-cyan-500/10 rounded max-h-64 overflow-y-auto">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                    {selectedVersion.content}
                  </pre>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleRestore(selectedVersion)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded text-green-400 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restore This Version
                </button>
                <button
                  onClick={() => setSelectedVersion(null)}
                  className="px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 rounded text-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Diff Modal */}
      {diff && compareVersion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={() => {
            setDiff(null);
            setCompareVersion(null);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-black border border-cyan-500/30 rounded-lg p-6 max-w-3xl w-full"
          >
            <h3 className="text-xl font-mono text-cyan-400 mb-4">Version Comparison</h3>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded text-center">
                <p className="text-2xl font-mono text-green-400">+{diff.additions}</p>
                <p className="text-xs text-gray-400">Additions</p>
              </div>
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded text-center">
                <p className="text-2xl font-mono text-red-400">-{diff.deletions}</p>
                <p className="text-xs text-gray-400">Deletions</p>
              </div>
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded text-center">
                <p className="text-2xl font-mono text-blue-400">{diff.similarity}%</p>
                <p className="text-xs text-gray-400">Similar</p>
              </div>
            </div>

            <button
              onClick={() => {
                setDiff(null);
                setCompareVersion(null);
              }}
              className="w-full px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded text-cyan-400 transition-colors"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VersionHistory;
