import { useState, useEffect } from 'react';
import { User, Lock, Palette, CreditCard, Sun, Moon, Monitor, Clock, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '../context/SubscriptionContext';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

export function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, setTheme } = useTheme();
  const { currentUser } = useAuth();
  const { subscription, trialMsLeft } = useSubscription();
  const navigate = useNavigate();

  // Profile
  const [fullName, setFullName] = useState(currentUser?.full_name || currentUser?.name || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Real-time trial countdown
  const [timeLeft, setTimeLeft] = useState(trialMsLeft());
  useEffect(() => {
    if (!subscription || subscription.subscription_status !== 'trial') return;
    setTimeLeft(trialMsLeft());
    const interval = setInterval(() => {
      const ms = trialMsLeft();
      setTimeLeft(ms);
      if (ms <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [subscription]);

  const initials = (fullName || '?')
    .split(' ').filter(Boolean).map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ];

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    if (!fullName.trim()) { setProfileMsg({ type: 'error', text: 'Name cannot be empty' }); return; }
    setProfileLoading(true);
    try {
      const { error } = await supabase.from('users').update({ full_name: fullName.trim() }).eq('id', currentUser.id);
      if (error) throw error;
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (!currentPassword) { setPwMsg({ type: 'error', text: 'Please enter your current password' }); return; }
    if (newPassword !== confirmPassword) { setPwMsg({ type: 'error', text: 'New passwords do not match' }); return; }
    if (newPassword.length < 6) { setPwMsg({ type: 'error', text: 'New password must be at least 6 characters' }); return; }
    if (currentPassword === newPassword) { setPwMsg({ type: 'error', text: 'New password must be different from current password' }); return; }
    setPwLoading(true);
    try {
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email: currentUser.email, password: currentPassword });
      if (signInErr) { setPwMsg({ type: 'error', text: 'Current password is incorrect' }); setPwLoading(false); return; }
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
      if (updateErr) throw updateErr;
      setPwMsg({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message });
    } finally {
      setPwLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(currentUser.email, { redirectTo: `${window.location.origin}/reset-password` });
      if (error) throw error;
      setResetSent(true);
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message });
    } finally {
      setResetLoading(false);
    }
  };

  const msgClass = (type) =>
    type === 'success'
      ? 'text-green-700 bg-green-50 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900'
      : 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900';

  // ── Billing helpers ───────────────────────────────────────
  const planLabels = { starter: 'Starter', pro: 'Pro', enterprise: 'Enterprise', free: 'Free' };
  const planPrices = { starter: '₹800/mo', pro: '₹1,600/mo', enterprise: '₹3,200/mo', free: '₹0' };

  const formatCountdown = (ms) => {
    if (ms <= 0) return 'Expired';
    const d = Math.floor(ms / (1000 * 60 * 60 * 24));
    const h = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);
    return d > 0 ? `${d}d ${h}h ${m}m ${s}s` : `${h}h ${m}m ${s}s`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const statusConfig = {
    active: { label: 'Active', color: 'bg-green-500', icon: CheckCircle, iconColor: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' },
    trial:  { label: timeLeft > 0 ? 'Trial Active' : 'Trial Expired', color: timeLeft > 0 ? 'bg-blue-500' : 'bg-red-500', icon: Clock, iconColor: timeLeft > 0 ? 'text-blue-500' : 'text-red-500', bg: timeLeft > 0 ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900' },
    expired: { label: 'Expired', color: 'bg-red-500', icon: AlertTriangle, iconColor: 'text-red-500', bg: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900' },
  };

  const status = subscription?.subscription_status || 'trial';
  const config = statusConfig[status] || statusConfig.trial;
  const StatusIcon = config.icon;

  return (
    <div className="space-y-6">
      <div className="mt-12">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-2 shadow-sm">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                      activeTab === tab.id
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}>
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Profile Information</h2>
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-semibold shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{currentUser?.email}</p>
                      <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 capitalize">
                        {currentUser?.role}
                      </span>
                    </div>
                  </div>
                  {profileMsg && <p className={`text-sm px-4 py-2 rounded-lg border ${msgClass(profileMsg.type)}`}>{profileMsg.text}</p>}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name"
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                    <input type="email" value={currentUser?.email || ''} disabled
                      className="w-full px-3 py-2.5 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 cursor-not-allowed" />
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={profileLoading}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                      {profileLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Security Settings</h2>
                {resetSent && (
                  <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg mb-6">
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">✅ Password reset email sent to <strong>{currentUser?.email}</strong></p>
                    <p className="text-xs text-green-600 dark:text-green-500 mt-1">Check your inbox and click the link to reset your password.</p>
                  </div>
                )}
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {pwMsg && <p className={`text-sm px-4 py-2 rounded-lg border ${msgClass(pwMsg.type)}`}>{pwMsg.text}</p>}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required placeholder="Enter your current password"
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} placeholder="Enter new password"
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required placeholder="Confirm new password"
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <button type="button" onClick={handleForgotPassword} disabled={resetLoading || resetSent}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:no-underline">
                      {resetLoading ? 'Sending...' : resetSent ? 'Reset email sent ✓' : 'Forgot password?'}
                    </button>
                    <button type="submit" disabled={pwLoading}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                      {pwLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Appearance</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Theme</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'Light', icon: Sun, preview: 'bg-white border-gray-200' },
                      { value: 'dark', label: 'Dark', icon: Moon, preview: 'bg-gray-900 border-gray-700' },
                      { value: 'system', label: 'System', icon: Monitor, preview: 'bg-gradient-to-br from-white to-gray-900 border-gray-400' },
                    ].map((t) => {
                      const Icon = t.icon;
                      const active = theme === t.value;
                      return (
                        <button key={t.value} onClick={() => setTheme(t.value)}
                          className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${active ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                          <div className={`w-full h-12 rounded-lg border ${t.preview}`} />
                          <div className="flex items-center gap-1.5">
                            <Icon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                            <span className={`text-sm font-medium ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>{t.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── Billing Tab ── */}
            {activeTab === 'billing' && (
              <div className="p-6 space-y-5">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Billing & Subscription</h2>

                {/* Current Plan Card */}
                <div className={`p-5 border rounded-xl ${config.bg}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`w-6 h-6 ${config.iconColor}`} />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {status === 'active'
                            ? `${planLabels[subscription?.plan_type] || 'Pro'} Plan`
                            : 'Free Trial'}
                        </h3>
                        {status === 'active' && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{planPrices[subscription?.plan_type] || ''}</p>
                        )}
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-white text-xs font-semibold rounded-full shrink-0 ${config.color}`}>
                      {config.label}
                    </span>
                  </div>

                  {/* Trial countdown */}
                  {status === 'trial' && timeLeft > 0 && (
                    <div className="mt-3 p-3 bg-white/60 dark:bg-gray-900/40 rounded-lg">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Time remaining</p>
                      <p className="font-mono font-bold text-blue-600 dark:text-blue-400 text-lg">
                        {formatCountdown(timeLeft)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Trial ends on {formatDate(subscription?.trial_end_date)}</p>
                    </div>
                  )}

                  {/* Active subscription details */}
                  {status === 'active' && (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white/60 dark:bg-gray-900/40 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Plan started</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(subscription?.trial_start_date)}</p>
                      </div>
                      <div className="p-3 bg-white/60 dark:bg-gray-900/40 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Billing</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Monthly</p>
                      </div>
                    </div>
                  )}

                  {/* Expired */}
                  {(status === 'expired' || (status === 'trial' && timeLeft <= 0)) && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                      Your access has expired. Please subscribe to continue using TaskHive.
                    </p>
                  )}
                </div>

                {/* Upgrade / Manage button — only for admins */}
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => navigate('/pricing')}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {status === 'active' ? 'Change Plan' : 'View Pricing & Upgrade'}
                  </button>
                )}

                {/* Non-admin message */}
                {currentUser?.role !== 'admin' && status !== 'active' && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    Contact your administrator to manage the subscription.
                  </p>
                )}

                {/* Razorpay badge */}
                <p className="text-xs text-center text-gray-400">
                  Payments secured by Razorpay
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}