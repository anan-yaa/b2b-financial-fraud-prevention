import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user from localStorage on mount
    const savedUser = localStorage.getItem('selectedUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const selectUser = (userData) => {
    setUser(userData);
    localStorage.setItem('selectedUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('selectedUser');
  };

  const value = {
    user,
    selectUser,
    logout,
    isAuthenticated: !!user,
    role: user?.role || null,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
