import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { MobileNav } from '../components/layout/MobileNav';
import { TrialBanner } from '../components/TrialBanner';
import { LayoutDashboard, CheckSquare, Video, Users, Settings, BarChart3 } from 'lucide-react';

export default function AdminLayout() {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin-dashboard', end: true },
    { id: 'assigned', label: 'Assigned Tasks', icon: CheckSquare, path: '/admin-dashboard/assigned' },
    { id: 'personal', label: 'Personal Tasks', icon: CheckSquare, path: '/admin-dashboard/personal' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin-dashboard/analytics' },
    { id: 'meetings', label: 'Meetings', icon: Video, path: '/admin-dashboard/meetings' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin-dashboard/users' },
    { id: 'team', label: 'Team', icon: Users, path: '/team' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin-dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TrialBanner />
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