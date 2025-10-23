'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Key, Plus, Copy, Trash2, Eye, EyeOff, 
  Edit2, Check, X, AlertCircle, Clock,
  BarChart3, Shield, Settings
} from 'lucide-react';
import { useSession } from 'next-auth/react';

interface APIKey {
  id: string;
  name: string;
  key?: string; // Only shown during creation
  permissions: string[];
  rateLimit: number;
  createdAt: Date;
  lastUsed?: Date;
  expiresAt?: Date;
  isActive: boolean;
  description?: string;
  allowedOrigins?: string[];
}

export default function APIKeysPage() {
  const { data: session } = useSession();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [editingKey, setEditingKey] = useState<APIKey | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    rateLimit: 1000,
    expiresAt: '',
    allowedOrigins: [] as string[]
  });

  const availablePermissions = [
    { id: 'read:users', name: 'Read Users', description: 'View user profiles and data' },
    { id: 'write:users', name: 'Write Users', description: 'Create and update user data' },
    { id: 'read:projects', name: 'Read Projects', description: 'View project information' },
    { id: 'write:projects', name: 'Write Projects', description: 'Create and update projects' },
    { id: 'read:letters', name: 'Read Letters', description: 'Access Anthony Letters' },
    { id: 'write:letters', name: 'Write Letters', description: 'Create and update letters' },
    { id: 'read:donations', name: 'Read Donations', description: 'View donation data' },
    { id: 'write:donations', name: 'Write Donations', description: 'Process donations' },
    { id: 'admin', name: 'Admin Access', description: 'Full administrative access' }
  ];

  useEffect(() => {
    fetchAPIKeys();
  }, []);

  const fetchAPIKeys = async () => {
    try {
      const response = await fetch('/api/developers/keys');
      const data = await response.json();
      setApiKeys(data.keys || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    try {
      const response = await fetch('/api/developers/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (response.ok) {
        setNewKey(data.key);
        setShowKeyModal(true);
        setShowCreateModal(false);
        setFormData({
          name: '',
          description: '',
          permissions: [],
          rateLimit: 1000,
          expiresAt: '',
          allowedOrigins: []
        });
        fetchAPIKeys();
      }
    } catch (error) {
      console.error('Error creating API key:', error);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/developers/keys/${keyId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchAPIKeys();
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
    }
  };

  const handleToggleKey = async (keyId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/developers/keys/${keyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });

      if (response.ok) {
        fetchAPIKeys();
      }
    } catch (error) {
      console.error('Error toggling API key:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getPermissionName = (permissionId: string) => {
    const permission = availablePermissions.find(p => p.id === permissionId);
    return permission?.name || permissionId;
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-mono text-cyan-400 mb-2">Authentication Required</h2>
          <p className="text-gray-400">Please sign in to manage your API keys.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-black/80 border-b border-cyan-500/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="w-8 h-8 text-cyan-400" />
              <h1 className="text-3xl font-mono text-cyan-400">API Keys</h1>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 font-mono transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create API Key</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-12">
            <Key className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-mono text-cyan-400 mb-2">No API Keys</h2>
            <p className="text-gray-400 mb-6">Create your first API key to start building with our API.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 font-mono transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First API Key</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {apiKeys.map((key) => (
              <motion.div
                key={key.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-500/30 transition-colors"
              >
                {/* Key Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-mono text-cyan-400 mb-1">{key.name}</h3>
                    {key.description && (
                      <p className="text-gray-400 text-sm">{key.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded text-xs ${
                      key.isActive 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }`}>
                      {key.isActive ? 'Active' : 'Inactive'}
                    </div>
                    
                    <button
                      onClick={() => handleToggleKey(key.id, key.isActive)}
                      className="p-2 hover:bg-gray-500/20 rounded transition-colors"
                    >
                      {key.isActive ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Key Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Created:</span>
                    <span className="text-gray-300">{formatDate(key.createdAt)}</span>
                  </div>
                  
                  {key.lastUsed && (
                    <div className="flex items-center gap-2 text-sm">
                      <BarChart3 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">Last used:</span>
                      <span className="text-gray-300">{formatDate(key.lastUsed)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Rate limit:</span>
                    <span className="text-gray-300">{key.rateLimit} requests/hour</span>
                  </div>
                </div>

                {/* Permissions */}
                <div className="mb-4">
                  <h4 className="text-sm font-mono text-cyan-400 mb-2">Permissions</h4>
                  <div className="flex flex-wrap gap-1">
                    {key.permissions.map((permission) => (
                      <span
                        key={permission}
                        className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-xs text-cyan-400"
                      >
                        {getPermissionName(permission)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingKey(key)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded text-blue-400 text-sm transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  
                  <button
                    onClick={() => handleDeleteKey(key.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded text-red-400 text-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create API Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black border border-cyan-500/30 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-mono text-cyan-400">Create API Key</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-500/20 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-cyan-400 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My API Key"
                  className="w-full p-3 bg-black/40 border border-cyan-500/20 rounded-lg text-gray-300 focus:outline-none focus:border-cyan-500/40"
                />
              </div>

              <div>
                <label className="block text-sm font-mono text-cyan-400 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description for this API key"
                  rows={3}
                  className="w-full p-3 bg-black/40 border border-cyan-500/20 rounded-lg text-gray-300 focus:outline-none focus:border-cyan-500/40"
                />
              </div>

              <div>
                <label className="block text-sm font-mono text-cyan-400 mb-2">Permissions</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availablePermissions.map((permission) => (
                    <label key={permission.id} className="flex items-start gap-3 p-3 bg-black/20 rounded-lg cursor-pointer hover:bg-black/30 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, permissions: [...formData.permissions, permission.id] });
                          } else {
                            setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== permission.id) });
                          }
                        }}
                        className="mt-1"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-300">{permission.name}</div>
                        <div className="text-xs text-gray-500">{permission.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-mono text-cyan-400 mb-2">Rate Limit (requests/hour)</label>
                <input
                  type="number"
                  value={formData.rateLimit}
                  onChange={(e) => setFormData({ ...formData, rateLimit: parseInt(e.target.value) })}
                  min="1"
                  max="10000"
                  className="w-full p-3 bg-black/40 border border-cyan-500/20 rounded-lg text-gray-300 focus:outline-none focus:border-cyan-500/40"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateKey}
                disabled={!formData.name || formData.permissions.length === 0}
                className="flex-1 px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 font-mono transition-colors disabled:opacity-50"
              >
                Create API Key
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 rounded-lg text-gray-400 font-mono transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Show New Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black border border-cyan-500/30 rounded-lg p-6 max-w-2xl w-full"
          >
            <div className="text-center">
              <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-mono text-cyan-400 mb-2">API Key Created</h2>
              <p className="text-gray-400 mb-6">
                Your API key has been created successfully. Please copy it now as it won't be shown again.
              </p>
              
              <div className="bg-black/60 border border-cyan-500/20 rounded-lg p-4 mb-6">
                <code className="text-green-400 font-mono break-all">{newKey}</code>
              </div>
              
              <button
                onClick={() => copyToClipboard(newKey)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 font-mono transition-colors"
              >
                {copiedKey === newKey ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy API Key
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowKeyModal(false)}
                className="block mx-auto mt-4 text-gray-400 hover:text-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
