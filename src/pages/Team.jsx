import { Mail, UserPlus, Crown, User as UserIcon, AlertTriangle, ArrowUp, ShoppingCart, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../context/SubscriptionContext";
import { useNavigate } from "react-router-dom";

const PLAN_LIMITS = {
  starter:    { users: 5,  extraPrice: 149 },
  pro:        { users: 10, extraPrice: 99  },
  enterprise: { users: 20, extraPrice: 79  },
  free:       { users: 5,  extraPrice: 149 },
  trial:      { users: 5,  extraPrice: 149 },
};

export function Team() {
  const { currentUser, inviteUser } = useAuth();
  const { subscription, fetchSubscription } = useSubscription();
  const navigate = useNavigate();

  const [teamMembers, setTeamMembers]     = useState([]);
  const [loading, setLoading]             = useState(true);
  const [extraUsers, setExtraUsers]       = useState(0);

  // Invite modal
  const [showInvite, setShowInvite]       = useState(false);
  const [inviteEmail, setInviteEmail]     = useState("");
  const [inviteName, setInviteName]       = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMsg, setInviteMsg]         = useState(null);

  // Limit modal
  const [showLimitModal, setShowLimitModal] = useState(false);

  // Buy extra users modal
  const [showBuyModal, setShowBuyModal]   = useState(false);
  const [buyQty, setBuyQty]               = useState(1);
  const [buyLoading, setBuyLoading]       = useState(false);
  const [buyMsg, setBuyMsg]               = useState(null);

  // Plan info
  const planType = subscription?.subscription_status === 'active'
    ? (subscription?.plan_type || 'starter')
    : 'trial';
  const planConfig   = PLAN_LIMITS[planType] || PLAN_LIMITS.starter;
  const maxUsers     = planConfig.users + extraUsers;
  const currentCount = teamMembers.length;
  const canInvite    = currentCount < maxUsers;
  const slotsLeft    = Math.max(0, maxUsers - currentCount);
  const isOnPaidPlan = subscription?.subscription_status === 'active';

  useEffect(() => {
    if (currentUser?.company_id) {
      loadTeam();
      fetchExtraUsers();
    }
  }, [currentUser?.company_id]);

  const fetchExtraUsers = async () => {
    const { data } = await supabase
      .from('companies')
      .select('extra_users')
      .eq('id', currentUser.company_id)
      .maybeSingle();
    setExtraUsers(data?.extra_users || 0);
  };

  const loadTeam = async () => {
    setLoading(true);
    const { data: users, error } = await supabase
      .from("users")
      .select("id, full_name, email, role, created_at")
      .eq("company_id", currentUser.company_id);

    if (error) { console.error("fetch team", error); setLoading(false); return; }

    const members = await Promise.all(
      users.map(async (u) => {
        const name = u.full_name || u.email || "Unknown";
        const { data: completed } = await supabase.from("tasks").select("id", { count: "exact" })
          .eq("company_id", currentUser.company_id).eq("assigned_to", u.id).eq("status", "completed");
        const { data: inProgress } = await supabase.from("tasks").select("id", { count: "exact" })
          .eq("company_id", currentUser.company_id).eq("assigned_to", u.id).neq("status", "completed");
        const initials = name.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
        return {
          id: u.id, name, email: u.email,
          role: u.role || "user", avatar: initials,
          tasksCompleted: completed?.length || 0,
          tasksInProgress: inProgress?.length || 0,
          joinedDate: new Date(u.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        };
      })
    );
    setTeamMembers(members);
    setLoading(false);
  };

  const handleInviteClick = () => {
    if (!canInvite) { setShowLimitModal(true); return; }
    setShowInvite(true);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteMsg(null);
    if (currentCount >= maxUsers) { setShowInvite(false); setShowLimitModal(true); return; }
    setInviteLoading(true);
    try {
      await inviteUser(inviteEmail, inviteName);
      setInviteMsg({ type: "success", text: `Invite sent to ${inviteEmail}!` });
      setInviteEmail(""); setInviteName("");
      loadTeam();
      setTimeout(() => { setShowInvite(false); setInviteMsg(null); }, 2000);
    } catch (err) {
      setInviteMsg({ type: "error", text: err.message });
    } finally {
      setInviteLoading(false);
    }
  };

  // ✅ Option 2 — updates Razorpay subscription quantity (auto monthly billing)
  const handleBuyExtraUsers = async () => {
    setBuyLoading(true);
    setBuyMsg(null);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const resp = await fetch(`${backendUrl}/api/buy-extra-users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: currentUser.company_id,
          quantity: buyQty,
        }),
      });
      const data = await resp.json();

      if (!resp.ok) {
        // If not on paid plan yet, redirect to pricing
        if (data.requiresSubscription) {
          setShowBuyModal(false);
          setShowLimitModal(false);
          navigate('/pricing');
          return;
        }
        throw new Error(data.error);
      }

      // Success — refresh data
      await fetchExtraUsers();
      await fetchSubscription();
      setBuyMsg({ type: 'success', text: `✅ ${buyQty} slot${buyQty > 1 ? 's' : ''} added! You'll be charged ₹${data.monthlyTotal}/month from next billing cycle.` });
      setTimeout(() => {
        setShowBuyModal(false);
        setBuyMsg(null);
        setShowLimitModal(false);
        setShowInvite(true);
      }, 3000);
    } catch (err) {
      setBuyMsg({ type: 'error', text: err.message });
    } finally {
      setBuyLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    if (role === "admin") return "bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400";
    return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
  };

  const planLabel = planType.charAt(0).toUpperCase() + planType.slice(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-12">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Team</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your team members and their roles</p>
        </div>
        <button onClick={handleInviteClick}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm ${
            canInvite ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}>
          <UserPlus className="w-5 h-5" />
          {canInvite ? 'Invite Member' : 'Limit Reached'}
        </button>
      </div>

      {/* Plan usage bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{planLabel} Plan</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{currentCount} / {maxUsers} users</span>
            {extraUsers > 0 && (
              <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-full">
                +{extraUsers} extra slots
              </span>
            )}
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            slotsLeft === 0 ? 'bg-red-100 dark:bg-red-950/30 text-red-600'
            : slotsLeft <= 2 ? 'bg-orange-100 dark:bg-orange-950/30 text-orange-600'
            : 'bg-green-100 dark:bg-green-950/30 text-green-600'
          }`}>
            {slotsLeft === 0 ? 'Full' : `${slotsLeft} slot${slotsLeft !== 1 ? 's' : ''} left`}
          </span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              currentCount >= maxUsers ? 'bg-red-500'
              : currentCount >= maxUsers * 0.8 ? 'bg-orange-500'
              : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(100, (currentCount / maxUsers) * 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-400">
            {isOnPaidPlan
              ? `Extra users: ₹${planConfig.extraPrice}/user/month — billed with your subscription`
              : `Extra users: ₹${planConfig.extraPrice}/user/month — requires active subscription`}
          </p>
          <button onClick={() => setShowBuyModal(true)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
            + Buy more slots
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Members</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{teamMembers.length}</p>
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
          <p className="text-gray-500 dark:text-gray-400">No team members yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {teamMembers.map((member) => {
            const RoleIcon = member.role === 'admin' ? Crown : UserIcon;
            return (
              <div key={member.id}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0">
                    {member.avatar}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{member.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                    <RoleIcon className="w-3.5 h-3.5" />
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Joined {member.joinedDate}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-0.5">{member.tasksCompleted}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white mt-0.5">{member.tasksInProgress}</p>
                  </div>
                </div>
                <a href={`https://mail.google.com/mail/?view=cm&to=${member.email}`} target="_blank" rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm transition-colors">
                  <Mail className="w-4 h-4" /> Email
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Invite Modal ── */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invite Team Member</h2>
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-full">
                {slotsLeft} slot{slotsLeft !== 1 ? 's' : ''} left
              </span>
            </div>
            {inviteMsg && (
              <p className={`text-sm px-4 py-2 rounded-lg border mb-4 ${
                inviteMsg.type === "success"
                  ? "text-green-700 bg-green-50 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900"
                  : "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900"
              }`}>{inviteMsg.text}</p>
            )}
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input type="text" value={inviteName} onChange={(e) => setInviteName(e.target.value)} required placeholder="Jane Doe"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required placeholder="jane@company.com"
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowInvite(false); setInviteMsg(null); }}
                  className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={inviteLoading}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                  {inviteLoading ? "Sending..." : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Limit Reached Modal ── */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-950/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-500" />
              </div>
              <button onClick={() => setShowLimitModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mt-3">User Limit Reached</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 mb-5">
              Your <span className="font-semibold">{planLabel} plan</span> allows {maxUsers} users. Choose an option to add more:
            </p>
            <div className="space-y-3">
              <div className="p-4 border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20 rounded-xl">
                <p className="font-semibold text-gray-900 dark:text-white text-sm mb-0.5">Buy Extra User Slots</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  ₹{planConfig.extraPrice}/user/month — added to your monthly subscription automatically
                </p>
                <button onClick={() => { setShowLimitModal(false); setShowBuyModal(true); }}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                  <ShoppingCart className="w-4 h-4" /> Buy Slots
                </button>
              </div>
              <div className="p-4 border border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/20 rounded-xl">
                <p className="font-semibold text-gray-900 dark:text-white text-sm mb-0.5">Upgrade Your Plan</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Get more users + features at a better rate</p>
                <button onClick={() => { setShowLimitModal(false); navigate('/pricing'); }}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors">
                  <ArrowUp className="w-4 h-4" /> Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Buy Extra Users Modal ── */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Buy Extra User Slots</h2>
              <button onClick={() => { setShowBuyModal(false); setBuyMsg(null); }}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {!isOnPaidPlan ? (
              <div className="text-center py-4">
                <AlertTriangle className="w-10 h-10 text-orange-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  You need an active subscription to buy extra user slots. Extra slots are billed monthly with your plan.
                </p>
                <button onClick={() => { setShowBuyModal(false); navigate('/pricing'); }}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  Subscribe First
                </button>
              </div>
            ) : (
              <>
                {buyMsg && (
                  <p className={`text-sm px-4 py-2 rounded-lg border mb-4 ${
                    buyMsg.type === 'success'
                      ? 'text-green-700 bg-green-50 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900'
                      : 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900'
                  }`}>{buyMsg.text}</p>
                )}

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-5">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Price per extra slot</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ₹{planConfig.extraPrice}<span className="text-sm font-normal text-gray-400">/month</span>
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    ✅ Added to your monthly subscription — no separate payment needed
                  </p>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">How many slots?</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setBuyQty(q => Math.max(1, q - 1))}
                      className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-xl font-bold transition-colors">
                      −
                    </button>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white w-8 text-center">{buyQty}</span>
                    <button onClick={() => setBuyQty(q => q + 1)}
                      className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-xl font-bold transition-colors">
                      +
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg mb-5 flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Added to monthly bill</span>
                  <span className="text-lg font-bold text-blue-600">+₹{buyQty * planConfig.extraPrice}/mo</span>
                </div>

                <button onClick={handleBuyExtraUsers} disabled={buyLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {buyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
                  {buyLoading ? 'Processing...' : `Add ${buyQty} Slot${buyQty > 1 ? 's' : ''} — ₹${buyQty * planConfig.extraPrice}/mo`}
                </button>
                <p className="text-xs text-center text-gray-400 mt-3">
                  Charged automatically with your next billing cycle
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}