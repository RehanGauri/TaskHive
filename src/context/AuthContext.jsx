import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

// dummy users for prototype
const DUMMY_USERS = [
  { id: '1', name: 'Admin', role: 'admin' },
  { id: '2', name: 'User', role: 'user' },
];

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const loginAsAdmin = () => {
    setCurrentUser(DUMMY_USERS[0]);
  };

  const loginAsUser = () => {
    setCurrentUser(DUMMY_USERS[1]);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const isAdmin = currentUser?.role === 'admin';

  const getUserById = (id) => DUMMY_USERS.find((u) => u.id === id) || { name: 'Unknown' };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loginAsAdmin,
        loginAsUser,
        logout,
        isAdmin,
        users: DUMMY_USERS,
        getUserById,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
