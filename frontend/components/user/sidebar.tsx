'use client';

import { useState } from 'react';
import { 
  Activity,
  Shield,
  Database,
  Zap,
  Users,
  Key
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function UserSidebar({ activeSection, onSectionChange }: SidebarProps) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'auth', label: 'Auth', icon: Shield },
    { id: 'api', label: 'API', icon: Key },
    { id: 'databases', label: 'Databases', icon: Database },
    { id: 'functions', label: 'Functions', icon: Zap },
    { id: 'storage', label: 'Storage', icon: Database },
    { id: 'messaging', label: 'Messaging', icon: Users },
  ];

  return (
    <div className="w-64 bg-black border-r border-gray-800 min-h-screen">
      <div className="p-6">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-4">BUILD</div>
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-3 transition-colors ${
                  isActive 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}