import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUserRef = useRef(null);
  const initializedRef = useRef(false); // ✅ prevents double-init
  const fetchingRef = useRef(false);    // ✅ prevents concurrent fetchUser calls

  const fetchUser = async (id) => {
    // Prevent concurrent fetches
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, email, role, company_id")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      const normalized = data ? { ...data, name: data.full_name } : null;
      currentUserRef.current = normalized;
      setCurrentUser(normalized);
      if (normalized?.company_id) {
        await fetchCompanyUsers(normalized.company_id);
      }
    } catch (err) {
      console.error("fetchUser error", err.message);
      // Only clear user if session is truly gone
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        currentUserRef.current = null;
        setCurrentUser(null);
      }
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  const fetchCompanyUsers = async (companyId) => {
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, role")
      .eq("company_id", companyId);
    if (!error) {
      setUsers((data || []).map((u) => ({ ...u, name: u.full_name })));
    }
  };

  useEffect(() => {
    // ✅ Only initialize once
    if (initializedRef.current) return;
    initializedRef.current = true;

    supabase.auth.getSession().then(({ data }) => {
      const session = data?.session;
      if (session?.user) {
        const hash = window.location.hash;
        if (hash.includes("type=invite") || hash.includes("type=recovery")) {
          setLoading(false);
          return;
        }
        fetchUser(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, payload) => {
        const session = payload?.session;

        // ✅ Ignore these — they don't mean logout
        if (event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") return;

        if (event === "SIGNED_OUT" || event === "USER_DELETED") {
          currentUserRef.current = null;
          setCurrentUser(null);
          setUsers([]);
          setLoading(false);
          return;
        }

        if (event === "SIGNED_IN" && session?.user) {
          if (window.location.pathname === "/invite") return;
          if (window.location.pathname === "/reset-password") return;

          // ✅ Only fetch if we don't already have this user loaded
          if (currentUserRef.current?.id === session.user.id) return;

          fetchUser(session.user.id);
          return;
        }

        // Only clear if truly no session AND no user loaded
        if (!session && !currentUserRef.current) {
          setCurrentUser(null);
          setUsers([]);
          setLoading(false);
        }
      }
    );

    return () => listener?.subscription?.unsubscribe();
  }, []);

  const signupAdmin = async ({ companyName, fullName, email, password }) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const resp = await fetch(`${backendUrl}/api/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName, fullName, email, password }),
    });
    const text = await resp.text();
    let result;
    try { result = JSON.parse(text); } catch { throw new Error("Server error"); }
    if (!resp.ok) throw new Error(result.error || "Signup failed");
    await login({ email, password });
  };

  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data?.user) await fetchUser(data.user.id);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    currentUserRef.current = null;
    initializedRef.current = false; // ✅ allow re-init on next login
    setCurrentUser(null);
    setUsers([]);
  };

  const inviteUser = async (email, fullName) => {
    if (!currentUser?.company_id) throw new Error("Missing admin or company context");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("No active session");
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!backendUrl) throw new Error("VITE_BACKEND_URL is not set in .env");
    const resp = await fetch(`${backendUrl}/api/invite-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email, fullName,
        companyId: currentUser.company_id,
        accessToken: session.access_token,
      }),
    });
    const text = await resp.text();
    let result;
    try { result = JSON.parse(text); } catch { throw new Error(`Server error: ${text.slice(0, 100)}`); }
    if (!resp.ok) throw new Error(result.error || "Invite failed");
    await fetchCompanyUsers(currentUser.company_id);
    return result;
  };

  const getUserById = (id) => users.find((u) => u.id === id) || null;
  const isAdmin = currentUser?.role === "admin";

  return (
    <AuthContext.Provider value={{
      currentUser, users, loading, isAdmin,
      signupAdmin, login, logout, inviteUser,
      getUserById, fetchCompanyUsers,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);