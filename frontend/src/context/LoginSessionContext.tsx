"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface LoginSessionContextProps {
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  loading: boolean; // Added loading state
}

const LoginSessionContext = createContext<LoginSessionContextProps | undefined>(
  undefined
);

export const LoginSessionProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Initialize loading

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false); // Set loading to false after check
  }, []);

  const setToken = (token: string) => {
    sessionStorage.setItem("token", token);
    setIsAuthenticated(true);
  };

  return (
    <LoginSessionContext.Provider
      value={{ isAuthenticated, setToken, loading }}
    >
      {children}
    </LoginSessionContext.Provider>
  );
};

export const useLoginSession = () => {
  const context = useContext(LoginSessionContext);
  if (context === undefined) {
    throw new Error(
      "useLoginSession must be used within a LoginSessionProvider"
    );
  }
  return context;
};
