'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Search, Filter, Code2, 
  Copy, Check, ChevronDown, ChevronRight,
  Play, ExternalLink
} from 'lucide-react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function APIDocumentation() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const tags = [
    { id: 'all', name: 'All Endpoints', count: 25 },
    { id: 'Authentication', name: 'Authentication', count: 3 },
    { id: 'Users', name: 'Users', count: 5 },
    { id: 'Projects', name: 'Projects', count: 8 },
    { id: 'Letters', name: 'Letters', count: 4 },
    { id: 'Donations', name: 'Donations', count: 3 },
    { id: 'Collaboration', name: 'Collaboration', count: 2 }
  ];

  const endpoints = [
    {
      path: '/user/profile',
      method: 'GET',
      summary: 'Get current user profile',
      description: 'Retrieve the profile information of the currently authenticated user',
      tag: 'Users',
      parameters: [
        { name: 'include', type: 'string', description: 'Include additional fields' }
      ],
      responses: {
        '200': { description: 'User profile retrieved successfully' },
        '401': { description: 'Unauthorized' }
      }
    },
    {
      path: '/projects',
      method: 'GET',
      summary: 'List all projects',
      description: 'Retrieve a paginated list of all projects',
      tag: 'Projects',
      parameters: [
        { name: 'status', type: 'string', description: 'Filter by project status' },
        { name: 'limit', type: 'integer', description: 'Number of results per page' }
      ],
      responses: {
        '200': { description: 'Projects retrieved successfully' },
        '400': { description: 'Invalid parameters' }
      }
    },
    {
      path: '/letters',
      method: 'GET',
      summary: 'Get all letters',
      description: 'Retrieve all available Anthony Letters',
      tag: 'Letters',
      responses: {
        '200': { description: 'Letters retrieved successfully' }
      }
    },
    {
      path: '/donations',
      method: 'POST',
      summary: 'Create a donation',
      description: 'Process a new donation to a project',
      tag: 'Donations',
      parameters: [
        { name: 'projectId', type: 'string', description: 'ID of the project to donate to' },
        { name: 'amount', type: 'number', description: 'Donation amount in USD' }
      ],
      responses: {
        '201': { description: 'Donation created successfully' },
        '400': { description: 'Invalid donation data' }
      }
    }
  ];

  const filteredEndpoints = endpoints.filter(endpoint => {
    const matchesSearch = endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         endpoint.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === 'all' || endpoint.tag === selectedTag;
    return matchesSearch && matchesTag;
  });

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCode(type);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const generateCodeExample = (endpoint: any, language: 'curl' | 'javascript' | 'python') => {
    const baseUrl = 'https://revolutionnetwork.com/api';
    
    switch (language) {
      case 'curl':
        return `curl -X ${endpoint.method} "${baseUrl}${endpoint.path}" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`;
      
      case 'javascript':
        return `const response = await fetch('${baseUrl}${endpoint.path}', {
  method: '${endpoint.method}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`;
      
      case 'python':
        return `import requests

url = '${baseUrl}${endpoint.path}'
headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}

response = requests.${endpoint.method.toLowerCase()}(url, headers=headers)
data = response.json()
print(data)`;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-black/80 border-b border-cyan-500/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-cyan-400" />
              <h1 className="text-3xl font-mono text-cyan-400">API Documentation</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search endpoints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-black/40 border border-cyan-500/20 rounded-lg text-gray-300 focus:outline-none focus:border-cyan-500/40"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols合理-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-6 sticky top-32">
              <h2 className="text-lg font-mono text-cyan-400 mb-4">Categories</h2>
              
              <div className="space-y-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => setSelectedTag(tag.id)}
                    className={`w-full text-left px-3 py-2 rounded transition-colors ${
                      selectedTag === tag.id
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-500/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{tag.name}</span>
                      <span className="text-xs bg-gray-500/20 px-2 py-1 rounded">
                        {tag.count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Overview */}
            <div className="mb-8">
              <h2 className="text-2xl font-mono text-cyan-400 mb-4">Overview</h2>
              <div className="bg-black/40 border border-cyan-500/20 rounded-lg p-6">
                <p className="text-gray-300 mb-4">
                  The Revolution Network API provides comprehensive access to our platform's features 
                  through RESTful endpoints. All API requests must include authentication via API key 
                  or JWT token.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-mono text-cyan-400 mb-2">Base URL</h3>
                    <code className="text-green-400 bg-black/60 px-3 py-1 rounded">
                      https://revolutionnetwork.com/api
                    </code>
                  </div>
                  <div>
                    <h3 className="text-lg font-mono text-cyan-400 mb-2">Authentication</h3>
                    <code className="text-blue-400 bg-black/60 px-3 py-1 rounded">
                      Bearer YOUR_API_KEY
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Endpoints */}
            <div className="space-y-4">
              <h2 className="text-2xl font-mono text-cyan-400 mb-4">
                Endpoints ({filteredEndpoints.length})
              </h2>

              {filteredEndpoints.map((endpoint, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-black/40 border border-cyan-500/20 rounded-lg overflow-hidden"
                >
                  {/* Endpoint Header */}
                  <div 
                    className="p-6 cursor-pointer hover:bg-cyan-500/5 transition-colors"
                    onClick={() => setExpandedEndpoint(
                      expandedEndpoint === endpoint.path ? null : endpoint.path
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded text-sm font-mono ${
                          endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                          endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                          endpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {endpoint.method}
                        </span>
                        <code className="text-cyan-400 font-mono">{endpoint.path}</code>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded">
                          {endpoint.tag}
                        </span>
                        {expandedEndpoint === endpoint.path ? 
                          <ChevronDown className="w-5 h-5 text-gray-400" /> :
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        }
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mt-2">{endpoint.summary}</p>
                  </div>

                  {/* Expanded Content */}
                  {expandedEndpoint === endpoint.path && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-cyan-500/10"
                    >
                      <div className="p-6 space-y-6">
                        {/* Description */}
                        <div>
                          <h3 className="text-lg font-mono text-cyan-400 mb-2">Description</h3>
                          <p className="text-gray-300">{endpoint.description}</p>
                        </div>

                        {/* Parameters */}
                        {endpoint.parameters && endpoint.parameters.length > 0 && (
                          <div>
                            <h3 className="text-lg font-mono text-cyan-400 mb-3">Parameters</h3>
                            <div className="space-y-2">
                              {endpoint.parameters.map((param: any, i: number) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-black/60 rounded">
                                  <code className="text-green-400 font-mono text-sm">{param.name}</code>
                                  <span className="text-gray-400 text-sm">({param.type})</span>
                                  <span className="text-gray-300 text-sm flex-1">{param.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Code Examples */}
                        <div>
                          <h3 className="text-lg font-mono text-cyan-400 mb-3">Code Examples</h3>
                          <div className="space-y-4">
                            {['curl', 'javascript', 'python'].map((lang) => (
                              <div key={lang} className="bg-black/60 border border-cyan-500/10 rounded-lg">
                                <div className="flex items-center justify-between p-3 border-b border-cyan-500/10">
                                  <span className="text-cyan-400 font-mono capitalize">{lang}</span>
                                  <button
                                    onClick={() => copyToClipboard(generateCodeExample(endpoint, lang as any), lang)}
                                    className="flex items-center gap-2 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded text-cyan-400 text-sm transition-colors"
                                  >
                                    {copiedCode === lang ? (
                                      <>
                                        <Check className="w-4 h-4" />
                                        Copied
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-4 h-4" />
                                        Copy
                                      </>
                                    )}
                                  </button>
                                </div>
                                <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                                  <code>{generateCodeExample(endpoint, lang as any)}</code>
                                </pre>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Responses */}
                        <div>
                          <h3 className="text-lg font-mono text-cyan-400 mb-3">Responses</h3>
                          <div className="space-y-2">
                            {Object.entries(endpoint.responses).map(([code, response]: [string, any]) => (
                              <div key={code} className="flex items-start gap-3 p-3 bg-black/60 rounded">
                                <span className={`px-2 py-1 rounded text-xs font-mono ${
                                  code.startsWith('2') ? 'bg-green-500/20 text-green-400' :
                                  code.startsWith('4') ? 'bg-red-500/20 text-red-400' :
                                  'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                  {code}
                                </span>
                                <span className="text-gray-300 text-sm">{response.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
