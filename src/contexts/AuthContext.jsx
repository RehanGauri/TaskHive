import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [profile, setProfile] = useState(null); // stores full profile (name, email, etc.)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);

      if (sessionUser) {
        await fetchProfile(sessionUser.id);
      }

      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user ?? null;
      setUser(sessionUser);

      if (sessionUser) {
        await fetchProfile(sessionUser.id);
      } else {
        setRole(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("role, first_name, last_name, email, company")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setRole(data.role);
      setProfile(data);
    }
  };

  const signup = async (formData) => {
    const { email, password, firstName, lastName, company } = formData;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          email: data.user.email,
          first_name: firstName,
          last_name: lastName,
          company,
          role: "user",
        });

      if (profileError) throw profileError;
    }
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      setUser(data.user);
      await fetchProfile(data.user.id);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setProfile(null);
  };

  // simple helper for prototype/demo skipping auth
  const skipLogin = (asAdmin = false) => {
    const dummyUser = { id: 'demo', email: asAdmin ? 'admin@demo.local' : 'user@demo.local' };
    setUser(dummyUser);
    setRole(asAdmin ? 'admin' : 'user');
    setProfile({
      first_name: asAdmin ? 'Admin' : 'Demo',
      last_name: 'User',
      email: dummyUser.email,
      company: 'Demo Co',
    });
  };

  // Derived helpers
  const isAdmin = role === "admin";

  // Build a display name from profile
  const displayName =
    profile
      ? [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
        profile.email
      : user?.email || "";

  // Initials for avatar
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        profile,
        loading,
        isAdmin,
        displayName,
        initials,
        signup,
        login,
        logout,
        skipLogin, // prototype helper
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);