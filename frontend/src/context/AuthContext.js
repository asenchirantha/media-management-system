import { createContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);
  const [token, setToken] = useState(null);

  const login = (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userRole", role); 
    setToken(token);
    setUserRole(role);
  };

  return (
    <AuthContext.Provider value={{ userRole, token, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
