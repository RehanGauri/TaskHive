import { Mail, UserPlus, Crown, Shield, User as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export function Team() {
  const { currentUser, inviteUser } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Invite modal state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMsg, setInviteMsg] = useState(null);

  useEffect(() => {
    if (currentUser?.company_id) loadTeam();
  }, [currentUser?.company_id]);

  const loadTeam = async () => {
    setLoading(true);
    const { data: users, error } = await supabase
      .from("users")
      .select("id, full_name, email, role, created_at")
      .eq("company_id", currentUser.company_id);

    if (error) {
      console.error("fetch team", error);
      setLoading(false);
      return;
    }

    const members = await Promise.all(
      users.map(async (u) => {
        const name = u.full_name || u.email || "Unknown";

        const { data: completed } = await supabase
          .from("tasks")
          .select("id", { count: "exact" })
          .eq("company_id", currentUser.company_id)
          .eq("assigned_to", u.id)
          .eq("status", "completed");

        const { data: inProgress } = await supabase
          .from("tasks")
          .select("id", { count: "exact" })
          .eq("company_id", currentUser.company_id)
          .eq("assigned_to", u.id)
          .neq("status", "completed");

        const initials =
          name
            .split(" ")
            .filter(Boolean)
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "?";

        return {
          id: u.id,
          name,
          email: u.email,
          role: u.role || "user",
          avatar: initials,
          tasksCompleted: completed?.length || 0,
          tasksInProgress: inProgress?.length || 0,
          joinedDate: new Date(u.created_at).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          }),
        };
      }),
    );

    setTeamMembers(members);
    setLoading(false);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteMsg(null);
    setInviteLoading(true);
    try {
      await inviteUser(inviteEmail, inviteName);
      setInviteMsg({ type: "success", text: `Invite sent to ${inviteEmail}!` });
      setInviteEmail("");
      setInviteName("");
      loadTeam();
      setTimeout(() => {
        setShowInvite(false);
        setInviteMsg(null);
      }, 2000);
    } catch (err) {
      setInviteMsg({ type: "error", text: err.message });
    } finally {
      setInviteLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    if (role === "admin") return Crown;
    return UserIcon;
  };

  const getRoleBadgeColor = (role) => {
    if (role === "admin")
      return "bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400";
    return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-12">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Team
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your team members and their roles
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
        >
          <UserPlus className="w-5 h-5" />
          Invite Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total Members
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
            {teamMembers.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-600 dark:text-gray-400">Admins</p>
          <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mt-1">
            {teamMembers.filter((m) => m.role === "admin").length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-600 dark:text-gray-400">Members</p>
          <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mt-1">
            {teamMembers.filter((m) => m.role === "user").length}
          </p>
        </div>
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : teamMembers.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <UserIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            No team members yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {teamMembers.map((member) => {
            const RoleIcon = getRoleIcon(member.role);
            return (
              <div
                key={member.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0">
                    {member.avatar}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {member.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {member.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${getRoleBadgeColor(member.role)}`}
                  >
                    <RoleIcon className="w-3.5 h-3.5" />
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Joined {member.joinedDate}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Completed
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-0.5">
                      {member.tasksCompleted}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      In Progress
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-0.5">
                      {member.tasksInProgress}
                    </p>
                  </div>
                </div>

                <a
                  href={`https://mail.google.com/mail/?view=cm&to=${member.email}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Invite Team Member
            </h2>

            {inviteMsg && (
              <p
                className={`text-sm px-4 py-2 rounded-lg border mb-4 ${
                  inviteMsg.type === "success"
                    ? "text-green-700 bg-green-50 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900"
                    : "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900"
                }`}
              >
                {inviteMsg.text}
              </p>
            )}

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  required
                  placeholder="Jane Doe"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  placeholder="jane@company.com"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowInvite(false);
                    setInviteMsg(null);
                  }}
                  className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteLoading}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {inviteLoading ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
