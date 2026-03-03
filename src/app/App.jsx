import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../routes/ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";

// admin pages
import AdminDashboard from "../pages/admin/Dashboard";
import AssignedTasks from "../pages/admin/AssignedTasks";
import AdminMeetings from "../pages/admin/Meetings";
import UsersPage from "../pages/admin/Users";
import { Team } from "../pages/Team";

// user pages
import UserDashboard from "../pages/user/Dashboard";
import MyTasks from "../pages/user/MyTasks";
import UserMeetings from "../pages/user/Meetings";

// common
import { PersonalTasks } from "../pages/common/PersonalTasks";

import { Login } from "../pages/Login";
import { Signup } from "../pages/Signup";  // still redirecting to login
import FallbackRedirect from "../routes/FallbackRedirect";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="light">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* legacy alias for generic dashboard path */}
            <Route path="/dashboard" element={<FallbackRedirect />} />

            {/* admin routes */}
            <Route element={<ProtectedRoute role="admin" />}> 
              <Route
                path="/admin-dashboard"
                element={<AdminLayout />}
              >
                <Route index element={<AdminDashboard />} />
                <Route path="assigned" element={<AssignedTasks />} />
                <Route path="personal" element={<PersonalTasks />} />
                <Route path="meetings" element={<AdminMeetings />} />
                <Route path="users" element={<UsersPage />} />
              </Route>
              {/* standalone admin-only team page uses same layout */}
              <Route path="/team" element={<AdminLayout />}>
                <Route index element={<Team />} />
              </Route>
            </Route>

            {/* user routes */}
            <Route element={<ProtectedRoute role="user" />}> 
              <Route
                path="/user-dashboard"
                element={<UserLayout />}
              >
                <Route index element={<UserDashboard />} />
                <Route path="tasks" element={<MyTasks />} />
                <Route path="personal" element={<PersonalTasks />} />
                <Route path="meetings" element={<UserMeetings />} />
              </Route>
            </Route>

            {/* catch all go to login or appropriate redirect */}
            <Route path="*" element={<FallbackRedirect />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;