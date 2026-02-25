import { LayoutDashboard, CheckSquare, BarChart3, Users, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export function MobileNav() {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'tasks', icon: CheckSquare, path: '/tasks' },
    { id: 'analytics', icon: BarChart3, path: '/analytics' },
    { id: 'team', icon: Users, path: '/team' },
    { id: 'settings', icon: Settings, path: '/settings' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`
              }
            >
              <Icon className="w-5 h-5" />
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
