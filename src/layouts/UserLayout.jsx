import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { MobileNav } from '../components/layout/MobileNav';
import { LayoutDashboard, CheckSquare, Video, Settings } from 'lucide-react';

export default function UserLayout() {
  const navItems = [
    { id: 'userDashboard', label: 'My Dashboard', icon: LayoutDashboard, path: '/user-dashboard', end: true },
    { id: 'mytasks', label: 'My Assigned Tasks', icon: CheckSquare, path: '/user-dashboard/tasks' },
    { id: 'personal', label: 'Personal Tasks', icon: CheckSquare, path: '/user-dashboard/personal' },
    { id: 'meetings', label: 'Meetings', icon: Video, path: '/user-dashboard/meetings' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/user-dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <MobileNav navItems={navItems} />
      <div className="hidden lg:block">
        <Sidebar navItems={navItems} />
      </div>
      <div className="lg:ml-64">
        <Navbar />
        <main className="pt-16 p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}