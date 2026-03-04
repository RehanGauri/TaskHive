import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  // ref to prevent clearing user during token refresh
  const currentUserRef = useRef(null);

  const fetchUser = async (id) => {
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
      // only clear user if we truly have no session
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        currentUserRef.current = null;
        setCurrentUser(null);
      }
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
    // get initial session
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

        // TOKEN_REFRESHED is normal — don't clear the user
        if (event === "TOKEN_REFRESHED") return;

        if (event === "SIGNED_OUT" || event === "USER_DELETED") {
          currentUserRef.current = null;
          setCurrentUser(null);
          setUsers([]);
          setLoading(false);
          return;
        }

        if (event === "SIGNED_IN" && session?.user) {
          fetchUser(session.user.id);
          return;
        }

        // for any other event with no session, only logout if we
        // don't already have a user loaded
        if (!session && !currentUserRef.current) {
          setCurrentUser(null);
          setUsers([]);
          setLoading(false);
        }
      }
    );

    return () => listener?.subscription?.unsubscribe();
  }, []);

  // const signupAdmin = async ({ companyName, fullName, email, password }) => {
  //   const { data: signData, error: authErr } = await supabase.auth.signUp({
  //     email,
  //     password,
  //   });
  //   if (authErr) throw authErr;
  //   const user = signData?.user;
  //   if (!user) throw new Error("User not created");

  //   const { data: company, error: cmpErr } = await supabase
  //     .from("companies")
  //     .insert({ name: companyName })
  //     .select()
  //     .single();
  //   if (cmpErr) throw cmpErr;

  //   const { error: userErr } = await supabase.from("users").insert({
  //     id: user.id,
  //     company_id: company.id,
  //     full_name: fullName,
  //     email,
  //     role: "admin",
  //   });
  //   if (userErr) throw userErr;

  //   await fetchUser(user.id);
  // };

const signupAdmin = async ({ companyName, fullName, email, password }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const resp = await fetch(`${backendUrl}/api/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ companyName, fullName, email, password }),
  });

  const text = await resp.text();
  let result;
  try {
    result = JSON.parse(text);
  } catch {
    throw new Error('Server error');
  }

  if (!resp.ok) throw new Error(result.error || 'Signup failed');

  // now login with the created credentials
  await login({ email, password });
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
    currentUserRef.current = null;
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

    const text = await resp.text();
    let result;
    try {
      result = JSON.parse(text);
    } catch {
      throw new Error(`Server error: ${text.slice(0, 100)}`);
    }

    if (!resp.ok) throw new Error(result.error || "Invite failed");

    // refresh company users list
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