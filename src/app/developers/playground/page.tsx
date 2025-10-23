'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Copy, Check, Code2, Settings, 
  ChevronDown, ChevronRight, AlertCircle,
  Clock, BarChart3, Globe
} from 'lucide-react';

interface APIRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers: Record<string, string>;
  body?: string;
}

interface APIResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  responseTime: number;
}

export default function APIPlayground() {
  const [apiKey, setApiKey] = useState('');
  const [selectedEndpoint, setSelectedEndpoint] = useState('/user/profile');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState<APIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    headers: false,
    response: false,
    history: false
  });
  const [requestHistory, setRequestHistory] = useState<APIRequest[]>([]);

  const endpoints = [
    {
      path: '/user/profile',
      method: 'GET',
      description: 'Get current user profile',
      requiresAuth: true
    },
    {
      path: '/projects',
      method: 'GET',
      description: 'List all projects',
      requiresAuth: true
    },
    {
      path: '/projects',
      method: 'POST',
      description: 'Create a new project',
      requiresAuth: true
    },
    {
      path: '/letters',
      method: 'GET',
      description: 'Get all Anthony Letters',
      requiresAuth: true
    },
    {
      path: '/donations',
      method: 'POST',
      description: 'Create a donation',
      requiresAuth: true
    }
  ];

  const selectedEndpointData = endpoints.find(ep => ep.path === selectedEndpoint && ep.method === method);

  useEffect(() => {
    // Load API key from localStorage if available
    const savedApiKey = localStorage.getItem('playground_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const executeRequest = async () => {
    if (!apiKey.trim()) {
      setError('API key is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const startTime = Date.now();
      
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      };

      const requestOptions: RequestInit = {
        method,
        headers
      };

      if (method !== 'GET' && requestBody.trim()) {
        try {
          JSON.parse(requestBody);
          requestOptions.body = requestBody;
        } catch (e) {
          setError('Invalid JSON in request body');
          setLoading(false);
          return;
        }
      }

      const fullUrl = `https://revolutionnetwork.com/api${selectedEndpoint}`;
      const response = await fetch(fullUrl, requestOptions);
      
      const responseTime = Date.now() - startTime;
      const responseData = await response.json();

      const apiResponse: APIResponse = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        responseTime
      };

      setResponse(apiResponse);

      // Save to history
      const request: APIRequest = {
        method,
        url: fullUrl,
        headers,
        body: requestOptions.body
      };
      setRequestHistory(prev => [request, ...prev.slice(0, 9)]); // Keep last 10

    } catch (err: any) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = async () => {
    if (response) {
      await navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
    }
  };

  const loadFromHistory = (request: APIRequest) => {
    setMethod(request.method as any);
    setSelectedEndpoint(request.url.replace('https://revolutionnetwork.com/api', ''));
    setRequestBody(request.body || '');
  };

  const formatResponseTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-400';
    if (status >= 400 && status < 500) return 'text-yellow-400';
    if (status >= 500) return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-black/80 border-b border-cyan-500/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Play className="w-8 h-8 text-cyan-400" />
              <h1 className="text-3xl font-mono text-cyan-400">API Playground</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">Live Environment</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Request Builder */}
          <div className="lg:col-span-2">
            <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-6">
              <h2 className="text-xl font-mono text-cyan-400 mb-6">Request Builder</h2>

              {/* API Key Input */}
              <div className="mb-6">
                <label className="block text-sm font-mono text-cyan-400 mb-2">API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    localStorage.setItem('playground_api_key', e.target.value);
                  }}
                  placeholder="Enter your API key"
                  className="w-full p-3 bg-black/40 border border-cyan-500/20 rounded-lg text-gray-300 focus:outline-none focus:border-cyan-500/40"
                />
              </div>

              {/* Endpoint Selection */}
              <div className="mb-6">
                <label className="block text-sm font-mono text-cyan-400 mb-2">Endpoint</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={selectedEndpoint}
                    onChange={(e) => setSelectedEndpoint(e.target.value)}
                    className="p-3 bg-black/40 border border-cyan-500/20 rounded-lg text-gray-300 focus:outline-none focus:border-cyan-500/40"
                  >
                    {endpoints.map((endpoint) => (
                      <option key={`${endpoint.method}-${endpoint.path}`} value={endpoint.path}>
                        {endpoint.method} {endpoint.path}
                      </option>
                    ))}
                  </select>
                  
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as any)}
                    className="p-3 bg-black/40 border border-cyan-500/20 rounded-lg text-gray-300 focus:outline-none focus:border-cyan-500/40"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                
                {selectedEndpointData && (
                  <p className="text-gray-400 text-sm mt-2">{selectedEndpointData.description}</p>
                )}
              </div>

              {/* Request Body */}
              {method !== 'GET' && (
                <div className="mb-6">
                  <label className="block text-sm font-mono text-cyan-400 mb-2">Request Body (JSON)</label>
                  <textarea
                    value={requestBody}
                    onChange={(e) => setRequestBody(e.target.value)}
                    placeholder="Enter JSON request body"
                    rows={8}
                    className="w-full p-3 bg-black/40 border border-cyan-500/20 rounded-lg text-gray-300 focus:outline-none focus:border-cyan-500/40 font-mono text-sm"
                  />
                </div>
              )}

              {/* Execute Button */}
              <button
                onClick={executeRequest}
                disabled={loading || !apiKey.trim()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 font-mono transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Execute Request</span>
                  </>
                )}
              </button>
            </div>

            {/* Response */}
            {response && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 border border-cyan-500/20 rounded-lg p-6 mt-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-mono text-cyan-400">Response</h2>
                  <button
                    onClick={copyResponse}
                    className="flex items-center gap-2 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded text-cyan-400 text-sm transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                </div>

                {/* Status */}
                <div className="flex items-center gap-4 mb-4">
                  <span className={`px-3 py-1 rounded text-sm font-mono ${getStatusColor(response.status)}`}>
                    {response.status} {response.statusText}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{formatResponseTime(response.responseTime)}</span>
                  </div>
                </div>

                {/* Response Body */}
                <div className="bg-black/60 border border-cyan-500/10 rounded-lg p-4">
                  <pre className="text-sm text-gray-300 overflow-x-auto">
                    <code>{JSON.stringify(response.data, null, 2)}</code>
                  </pre>
                </div>
              </motion.div>
            )}

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mt-6"
              >
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-mono">Error</span>
                </div>
                <p className="text-red-300 mt-2">{error}</p>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Endpoints */}
            <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-6">
              <h3 className="text-lg font-mono text-cyan-400 mb-4">Quick Endpoints</h3>
              <div className="space-y-2">
                {endpoints.map((endpoint) => (
                  <button
                    key={`${endpoint.method}-${endpoint.path}`}
                    onClick={() => {
                      setSelectedEndpoint(endpoint.path);
                      setMethod(endpoint.method as any);
                    }}
                    className={`w-full text-left p-3 rounded transition-colors ${
                      selectedEndpoint === endpoint.path && method === endpoint.method
                        ? 'bg-cyan-500/20 border border-cyan-500/30'
                        : 'bg-black/20 border border-transparent hover:bg-black/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-mono text-cyan-400">
                          {endpoint.method} {endpoint.path}
                        </div>
                        <div className="text-xs text-gray-400">{endpoint.description}</div>
                      </div>
                      {endpoint.requiresAuth && (
                        <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Requires authentication" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Request History */}
            {requestHistory.length > 0 && (
              <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-6">
                <h3 className="text-lg font-mono text-cyan-400 mb-4">Recent Requests</h3>
                <div className="space-y-2">
                  {requestHistory.slice(0, 5).map((request, index) => (
                    <button
                      key={index}
                      onClick={() => loadFromHistory(request)}
                      className="w-full text-left p-2 bg-black/20 hover:bg-black/40 rounded transition-colors"
                    >
                      <div className="text-sm font-mono text-cyan-400">
                        {request.method} {request.url.replace('https://revolutionnetwork.com/api', '')}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* API Info */}
            <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-6">
              <h3 className="text-lg font-mono text-cyan-400 mb-4">API Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Base URL:</span>
                  <div className="text-cyan-400 font-mono">https://revolutionnetwork.com/api</div>
                </div>
                <div>
                  <span className="text-gray-400">Authentication:</span>
                  <div className="text-cyan-400 font-mono">Bearer Token</div>
                </div>
                <div>
                  <span className="text-gray-400">Content-Type:</span>
                  <div className="text-cyan-400 font-mono">application/json</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
