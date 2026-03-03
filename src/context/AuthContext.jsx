import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (id) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, email, role, company_id")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      const normalized = data ? { ...data, name: data.full_name } : null;
      setCurrentUser(normalized);
      if (normalized?.company_id) {
        await fetchCompanyUsers(normalized.company_id);
      }
    } catch (err) {
      console.error("fetchUser error", err.message);
      setCurrentUser(null);
    } finally {
      setLoading(false);
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
    supabase.auth.getSession().then(({ data }) => {
      const session = data?.session;
      if (session?.user) {
        fetchUser(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, payload) => {
        const session = payload?.session;
        if (event === "SIGNED_OUT" || event === "USER_DELETED" || !session) {
          setCurrentUser(null);
          setUsers([]);
          setLoading(false);
          return;
        }
        if (session.user) {
          fetchUser(session.user.id);
        }
      }
    );

    return () => listener?.subscription?.unsubscribe();
  }, []);

  const signupAdmin = async ({ companyName, fullName, email, password }) => {
    const { data: signData, error: authErr } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authErr) throw authErr;
    const user = signData?.user;
    if (!user) throw new Error("User not created");

    const { data: company, error: cmpErr } = await supabase
      .from("companies")
      .insert({ name: companyName })
      .select()
      .single();
    if (cmpErr) throw cmpErr;

    const { error: userErr } = await supabase.from("users").insert({
      id: user.id,
      company_id: company.id,
      full_name: fullName,
      email,
      role: "admin",
    });
    if (userErr) throw userErr;

    await fetchUser(user.id);
  };

  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    if (data?.user) await fetchUser(data.user.id);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setUsers([]);
  };

  const inviteUser = async (email, fullName) => {
    if (!currentUser?.company_id)
      throw new Error("Missing admin or company context");

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("No active session");

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!backendUrl) throw new Error("VITE_BACKEND_URL is not set in .env");

    const resp = await fetch(`${backendUrl}/api/invite-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        fullName,
        companyId: currentUser.company_id,
        accessToken: session.access_token,
      }),
    });

    // safely parse response — avoids "unexpected token <" if server returns HTML
    const text = await resp.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      throw new Error(`Server returned unexpected response: ${text.slice(0, 100)}`);
    }

    if (!resp.ok) throw new Error(result.error || "Invite failed");

    await fetchCompanyUsers(currentUser.company_id);
    return result;
  };

  const getUserById = (id) => users.find((u) => u.id === id) || null;

  const isAdmin = currentUser?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        loading,
        isAdmin,
        signupAdmin,
        login,
        logout,
        inviteUser,
        getUserById,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);