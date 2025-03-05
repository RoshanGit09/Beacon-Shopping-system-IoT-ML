import React, { createContext, useState, useContext } from 'react';

// Create the context
const UserContext = createContext();

// Create provider component
export const UserProvider = ({ children }) => {
  const [userEmail, setUserEmail] = useState('');

  return (
    <UserContext.Provider value={{ userEmail, setUserEmail }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for using the context
export const useUserContext = () => useContext(UserContext);