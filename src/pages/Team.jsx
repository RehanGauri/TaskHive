import { Mail, Phone, MoreVertical, UserPlus, Crown, Shield, User as UserIcon } from 'lucide-react';

const teamMembers = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@company.com',
    role: 'admin',
    avatar: 'SJ',
    status: 'active',
    tasksCompleted: 124,
    tasksInProgress: 5,
    joinedDate: 'Jan 2024',
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike.c@company.com',
    role: 'manager',
    avatar: 'MC',
    status: 'active',
    tasksCompleted: 98,
    tasksInProgress: 3,
    joinedDate: 'Feb 2024',
  },
  {
    id: '3',
    name: 'Emma Wilson',
    email: 'emma.w@company.com',
    role: 'member',
    avatar: 'EW',
    status: 'away',
    tasksCompleted: 87,
    tasksInProgress: 7,
    joinedDate: 'Mar 2024',
  },
  {
    id: '4',
    name: 'David Lee',
    email: 'david.l@company.com',
    role: 'member',
    avatar: 'DL',
    status: 'active',
    tasksCompleted: 102,
    tasksInProgress: 4,
    joinedDate: 'Jan 2024',
  },
  {
    id: '5',
    name: 'Alex Turner',
    email: 'alex.t@company.com',
    role: 'member',
    avatar: 'AT',
    status: 'offline',
    tasksCompleted: 76,
    tasksInProgress: 2,
    joinedDate: 'Apr 2024',
  },
  {
    id: '6',
    name: 'Lisa Brown',
    email: 'lisa.b@company.com',
    role: 'manager',
    avatar: 'LB',
    status: 'active',
    tasksCompleted: 91,
    tasksInProgress: 6,
    joinedDate: 'Feb 2024',
  },
];

export function Team() {
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return Crown;
      case 'manager':
        return Shield;
      default:
        return UserIcon;
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400';
      case 'manager':
        return 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-12">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Team</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your team members and their roles
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm">
          <UserPlus className="w-5 h-5" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Members</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
            {teamMembers.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Now</p>
          <p className="text-2xl font-semibold text-green-600 dark:text-green-400 mt-1">
            {teamMembers.filter((m) => m.status === 'active').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Admins</p>
          <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mt-1">
            {teamMembers.filter((m) => m.role === 'admin').length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">Managers</p>
          <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mt-1">
            {teamMembers.filter((m) => m.role === 'manager').length}
          </p>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {teamMembers.map((member) => {
          const RoleIcon = getRoleIcon(member.role);
          return (
            <div
              key={member.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                      {member.avatar}
                    </div>
                    <div
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${getStatusColor(
                        member.status
                      )} border-2 border-white dark:border-gray-900 rounded-full`}
                    ></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${getRoleBadgeColor(
                    member.role
                  )}`}
                >
                  <RoleIcon className="w-3.5 h-3.5" />
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Joined {member.joinedDate}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                    {member.tasksCompleted}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">In Progress</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                    {member.tasksInProgress}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm transition-colors">
                  <Mail className="w-4 h-4" />
                  Email
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm transition-colors">
                  <Phone className="w-4 h-4" />
                  Call
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
