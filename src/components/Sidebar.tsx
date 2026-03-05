import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  FileText,
  ChevronLeft,
  ChevronRight,
  FolderTree,
  Briefcase
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/dashboard/users', icon: Users, label: 'Users' },
    { to: '/dashboard/categories', icon: FolderTree, label: 'Job Categories' },
    { to: '/dashboard/jobs', icon: Briefcase, label: 'Jobs' },
    { to: '/dashboard/reports', icon: FileText, label: 'Reports' },
    { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div
      className={`bg-gray-900 text-white h-screen transition-all duration-300 flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-800">
        {!isCollapsed && (
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            MyApp
          </h1>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-gray-800 transition ml-auto"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition group ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="font-medium">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
