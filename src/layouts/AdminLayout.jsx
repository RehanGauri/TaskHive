import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Navbar } from '../components/layout/Navbar';
import { MobileNav } from '../components/layout/MobileNav';
import { LayoutDashboard, CheckSquare, Video, Users } from 'lucide-react';

export default function AdminLayout() {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin-dashboard' },
    { id: 'assigned', label: 'All Assigned Tasks', icon: CheckSquare, path: '/admin-dashboard/assigned' },
    { id: 'personal', label: 'Personal Tasks', icon: CheckSquare, path: '/admin-dashboard/personal' },
    { id: 'meetings', label: 'Meetings', icon: Video, path: '/admin-dashboard/meetings' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin-dashboard/users' },
    // team page is admin-only and lives outside the dashboard prefix
    { id: 'team', label: 'Team', icon: Users, path: '/team' },
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
