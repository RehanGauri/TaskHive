import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./context/AuthContext";
import { TaskProvider } from "./context/TaskContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import SubscriptionGuard from "./routes/SubscriptionGuard";
import FallbackRedirect from "./routes/FallbackRedirect";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import AcceptInvite from "./pages/AcceptInvite";

// admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AssignedTasks from "./pages/admin/AssignedTasks";
import AdminMeetings from "./pages/admin/Adminmeetings";
import UsersPage from "./pages/admin/Users";
import { Team } from "./pages/Team";
import { Analytics } from './pages/admin/Analytics';

// user pages
import UserDashboard from "./pages/user/Dashboard";
import MyTasks from "./pages/user/MyTasks";
import UserMeetings from "./pages/user/Usermeetings";

// common
import { PersonalTasks } from "./pages/common/PersonalTasks";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { Settings } from "./pages/Settings";
import Pricing from "./pages/Pricing";
import SubscriptionRequired from "./pages/SubscriptionRequired";
import PaymentSuccess from "./pages/PaymentSuccess";

function InviteHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=invite")) navigate("/invite", { replace: true });
    else if (hash.includes("type=recovery")) navigate("/reset-password", { replace: true });
  }, []);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <SubscriptionProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            <BrowserRouter>
              <InviteHandler />
              <Routes>
                {/* Public */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/invite" element={<AcceptInvite />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/subscription-required" element={<SubscriptionRequired />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />

                {/* Admin — auth + subscription guarded */}
                <Route element={<ProtectedRoute role="admin" />}>
                  <Route element={<SubscriptionGuard />}>
                    <Route path="/admin-dashboard" element={<AdminLayout />}>
                      <Route index element={<AdminDashboard />} />
                      <Route path="assigned" element={<AssignedTasks />} />
                      <Route path="personal" element={<PersonalTasks />} />
                      <Route path="meetings" element={<AdminMeetings />} />
                      <Route path="users" element={<UsersPage />} />
                      <Route path="settings" element={<Settings />} />
                      <Route path="analytics" element={<Analytics />} />
                    </Route>
                    <Route path="/team" element={<AdminLayout />}>
                      <Route index element={<Team />} />
                    </Route>
                  </Route>
                </Route>

                {/* User — auth + subscription guarded */}
                <Route element={<ProtectedRoute role="user" />}>
                  <Route element={<SubscriptionGuard />}>
                    <Route path="/user-dashboard" element={<UserLayout />}>
                      <Route index element={<UserDashboard />} />
                      <Route path="tasks" element={<MyTasks />} />
                      <Route path="personal" element={<PersonalTasks />} />
                      <Route path="meetings" element={<UserMeetings />} />
                      <Route path="settings" element={<Settings />} />
                    </Route>
                  </Route>
                </Route>

                <Route path="*" element={<FallbackRedirect />} />
              </Routes>
            </BrowserRouter>
          </ThemeProvider>
        </SubscriptionProvider>
      </TaskProvider>
    </AuthProvider>
  );
}

export default App;