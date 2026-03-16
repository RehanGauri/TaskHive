import { LayoutDashboard, CheckSquare, BarChart3, Users, Settings, Video } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from "../../assets/images/logo.png"

export function Sidebar({ navItems: customNav }) {
  const { currentUser } = useAuth();

  const displayName = currentUser?.full_name || currentUser?.name || 'User';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const defaultNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
    { id: 'team', label: 'Team', icon: Users, path: '/team' },
    { id: 'meetings', label: 'Meetings', icon: Video, path: '/meetings' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const navItems = customNav || defaultNav;

  const filteredNav = navItems.filter((item) => {
    if (item.id === 'team' && currentUser?.role !== 'admin') return false;
    return true;
  });

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          {/* <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"> */}
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            {/* <CheckSquare className="w-5 h-5 text-white" /> */}
            <img src={logo} alt="TaskHive" className="w-8 h-8 object-contain" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">TaskHive</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  // ✅ use end from navItem, or auto-detect dashboard routes
                  end={item.end ?? (item.path === '/' || item.path === '/admin-dashboard' || item.path === '/user-dashboard')}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {displayName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
              {currentUser?.role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}