'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  BarChart3, 
  Settings, 
  FileText,
  Activity,
  LogOut,
  Menu,
  X,
  Home
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Moderation', href: '/admin/moderation', icon: Shield },
  { name: 'System', href: '/admin/system', icon: Activity },
  { name: 'Audit Logs', href: '/admin/audit', icon: FileText },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = () => {
    router.push('/api/auth/signout');
  };

  return (
    <div className="min-h-screen bg-matrix-darker">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-black border-r border-terminal-green/20 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-terminal-green/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-terminal-green rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">R</span>
              </div>
              <span className="text-terminal-green font-bold text-xl">Admin</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-terminal-cyan hover:text-terminal-green transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-terminal-cyan hover:text-terminal-green hover:bg-terminal-green/10 rounded-lg transition-colors group"
              >
                <item.icon className="w-5 h-5 group-hover:text-terminal-green transition-colors" />
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-terminal-green/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-terminal-green/20 rounded-full flex items-center justify-center">
                <span className="text-terminal-green font-semibold">
                  {session?.user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex-1">
                <div className="text-terminal-green font-semibold text-sm">
                  {session?.user?.name || 'Admin User'}
                </div>
                <div className="text-terminal-cyan text-xs">
                  {session?.user?.email || 'admin@example.com'}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 text-terminal-cyan hover:text-terminal-green hover:bg-terminal-green/10 rounded-lg transition-colors text-sm"
              >
                <Home className="w-4 h-4" />
                <span>Back to App</span>
              </Link>
              
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-2 text-terminal-red hover:text-terminal-red hover:bg-terminal-red/10 rounded-lg transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-sm border-b border-terminal-green/20">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-terminal-cyan hover:text-terminal-green transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <div>
                <h1 className="text-2xl font-bold text-terminal-green">{title}</h1>
                {description && (
                  <p className="text-terminal-cyan text-sm">{description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-terminal-cyan text-sm">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
