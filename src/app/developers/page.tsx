'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Code2, Key, BookOpen, Play, BarChart3, 
  Users, Zap, Shield, Globe, Terminal,
  ArrowRight, CheckCircle, Star
} from 'lucide-react';
import Link from 'next/link';

export default function DeveloperPortal() {
  const [stats, setStats] = useState({
    totalDevelopers: 1250,
    totalRequests: 1250000,
    averageResponseTime: 145,
    uptime: 99.99
  });

  const features = [
    {
      icon: <Code2 className="w-8 h-8" />,
      title: 'RESTful API',
      description: 'Clean, consistent REST endpoints with comprehensive documentation',
      color: 'text-blue-400'
    },
    {
      icon: <Key className="w-8 h-8" />,
      title: 'API Key Management',
      description: 'Secure API keys with granular permissions and rate limiting',
      color: 'text-green-400'
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Interactive Docs',
      description: 'Try API endpoints directly in your browser with our playground',
      color: 'text-purple-400'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Enterprise Security',
      description: 'OAuth 2.0, JWT tokens, and advanced security features',
      color: 'text-red-400'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Usage Analytics',
      description: 'Detailed insights into your API usage and performance',
      color: 'text-yellow-400'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'High Performance',
      description: 'Sub-200ms response times with 99.99% uptime SLA',
      color: 'text-cyan-400'
    }
  ];

  const quickStartSteps = [
    {
      step: 1,
      title: 'Create API Key',
      description: 'Generate your first API key with custom permissions',
      link: '/developers/keys'
    },
    {
      step: 2,
      title: 'Explore Documentation',
      description: 'Browse our comprehensive API documentation',
      link: '/developers/docs'
    },
    {
      step: 3,
      title: 'Try the Playground',
      description: 'Test API endpoints directly in your browser',
      link: '/developers/playground'
    },
    {
      step: 4,
      title: 'Build Your App',
      description: 'Start integrating with our powerful APIs',
      link: '/developers/docs'
    }
  ];

  const codeExample = `
// Get user profile
const response = await fetch('https://revolutionnetwork.com/api/user/profile', {
  headers: {
    'Authorization': 'Bearer your-api-key',
    'Content-Type': 'application/json'
  }
});

const user = await response.json();
console.log(user);
  `.trim();

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Terminal className="w-12 h-12 text-cyan-400" />
              <h1 className="text-6xl font-mono text-cyan-400">Developer Portal</h1>
            </div>
            
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Build powerful applications with the Revolution Network API. 
              Access our complete platform through clean, well-documented REST endpoints.
            </p>

            <div className="flex items-center justify-center gap-6 mb-12">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">99.99% Uptime</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-300">&lt;200ms Response Time</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-gray-300">{stats.totalDevelopers.toLocaleString()}+ Developers</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Link
                href="/developers/keys"
                className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 font-mono transition-colors"
              >
                <Key className="w-5 h-5" />
                <span>Get API Key</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                href="/developers/docs"
                className="inline-flex items-center gap-2 px-8 py-4 bg-transparent hover:bg-gray-500/10 border border-gray-500/30 rounded-lg text-gray-300 font-mono transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                <span>View Docs</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-mono text-cyan-400 mb-4">Why Choose Our API?</h2>
          <p className="text-gray-400 text-lg">Built for developers, by developers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-black/40 border border-cyan-500/10 rounded-lg p-8 hover:border-cyan-500/30 transition-colors"
            >
              <div className={`${feature.color} mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-mono text-cyan-400 mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border-y border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-mono text-cyan-400 mb-4">Quick Start</h2>
            <p className="text-gray-400 text-lg">Get up and running in minutes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStartSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <Link href={step.link}>
                  <div className="bg-black/60 border border-cyan-500/20 rounded-lg p-6 hover:border-cyan-500/40 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-cyan-500/20 border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 font-mono text-sm">
                        {step.step}
                      </div>
                      <h3 className="text-lg font-mono text-cyan-400">{step.title}</h3>
                    </div>
                    <p className="text-gray-400 text-sm">{step.description}</p>
                  </div>
                </Link>
                
                {index < quickStartSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-cyan-500/30 transform -translate-y-1/2" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Code Example */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-mono text-cyan-400 mb-6">Simple Integration</h2>
            <p className="text-gray-400 text-lg mb-8">
              Our API is designed for simplicity and power. Get started with just a few lines of code.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">RESTful endpoints</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">JSON responses</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Comprehensive documentation</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">SDKs for popular languages</span>
              </div>
            </div>
          </div>

          <div className="bg-black/60 border border-cyan-500/20 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Code2 className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-400 font-mono">JavaScript Example</span>
            </div>
            <pre className="text-sm text-gray-300 overflow-x-auto">
              <code>{codeExample}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-black/40 border-y border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-mono text-cyan-400 mb-2">
                {stats.totalRequests.toLocaleString()}+
              </div>
              <div className="text-gray-400">API Requests</div>
            </div>
            <div>
              <div className="text-3xl font-mono text-green-400 mb-2">
                {stats.averageResponseTime}ms
              </div>
              <div className="text-gray-400">Avg Response Time</div>
            </div>
            <div>
              <div className="text-3xl font-mono text-yellow-400 mb-2">
                {stats.uptime}%
              </div>
              <div className="text-gray-400">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-mono text-purple-400 mb-2">
                {stats.totalDevelopers.toLocaleString()}+
              </div>
              <div className="text-gray-400">Active Developers</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-mono text-cyan-400 mb-6">Ready to Build?</h2>
        <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of developers building amazing applications with the Revolution Network API.
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/developers/keys"
            className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 font-mono transition-colors"
          >
            <Key className="w-5 h-5" />
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          <Link
            href="/developers/docs"
            className="inline-flex items-center gap-2 px-8 py-4 bg-transparent hover:bg-gray-500/10 border border-gray-500/30 rounded-lg text-gray-300 font-mono transition-colors"
          >
            <BookOpen className="w-5 h-5" />
            <span>Read Documentation</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
