import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "./context/AuthContext";
import { TaskProvider } from "./context/TaskContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import FallbackRedirect from "./routes/FallbackRedirect";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";

// admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AssignedTasks from "./pages/admin/AssignedTasks";
import AdminMeetings from "./pages/admin/Meetings";
import UsersPage from "./pages/admin/Users";
import { Team } from "./pages/Team";

// user pages
import UserDashboard from "./pages/user/Dashboard";
import MyTasks from "./pages/user/MyTasks";
import UserMeetings from "./pages/user/Meetings";

// common
import { PersonalTasks } from "./pages/common/PersonalTasks";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";

function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <ThemeProvider attribute="class" defaultTheme="light">
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Admin routes */}
              <Route element={<ProtectedRoute role="admin" />}>
                <Route path="/admin-dashboard" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="assigned" element={<AssignedTasks />} />
                  <Route path="personal" element={<PersonalTasks />} />
                  <Route path="meetings" element={<AdminMeetings />} />
                  <Route path="users" element={<UsersPage />} />
                </Route>
                <Route path="/team" element={<AdminLayout />}>
                  <Route index element={<Team />} />
                </Route>
              </Route>

              {/* User routes */}
              <Route element={<ProtectedRoute role="user" />}>
                <Route path="/user-dashboard" element={<UserLayout />}>
                  <Route index element={<UserDashboard />} />
                  <Route path="tasks" element={<MyTasks />} />
                  <Route path="personal" element={<PersonalTasks />} />
                  <Route path="meetings" element={<UserMeetings />} />
                </Route>
              </Route>

              <Route path="*" element={<FallbackRedirect />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </TaskProvider>
    </AuthProvider>
  );
}

export default App;