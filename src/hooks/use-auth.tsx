"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { useAppDispatch, useAppSelector } from "./use-redux";
import {
  login as loginThunk,
  signupFirm,
  signupIndividual,
  fetchMe,
  logout as logoutAction,
  setUser,
  setLoading,
} from "@/store/slices/auth.slice";
import { setAccessToken, getAccessToken } from "@/lib/api/error-handler";
import { authService, type SignupClientCredentials } from "@/lib/api/services/auth.service";
import type { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    email: string;
    password: string;
    name: string;
    role: "firm" | "lawyer" | "client";
    company?: string;
  }) => Promise<void>;
  signupFirm: (data: {
    firmName: string;
    subdomain: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
  }) => Promise<void>;
  signupIndividual: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  signupClient: (data: SignupClientCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function sessionUserToUser(
  sessionUser: { id?: string; email?: string | null; name?: string | null }
): User {
  return {
    id: sessionUser.id ?? sessionUser.email ?? "google-user",
    email: sessionUser.email ?? "",
    name: sessionUser.name ?? "User",
    role: "lawyer",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading: authLoading } = useAppSelector((s) => s.auth);
  const { data: session, status: sessionStatus } = useSession();

  useEffect(() => {
    const token = getAccessToken();
    if (token && !user) {
      dispatch(setLoading(true));
      dispatch(fetchMe());
    } else if (!token) {
      dispatch(setLoading(false));
    }
  }, [dispatch, user]);

  const effectiveUser =
    user ??
    (session?.user
      ? sessionUserToUser(session.user as { id?: string; email?: string | null; name?: string | null })
      : null);
  const effectiveLoading = authLoading || sessionStatus === "loading";

  const login = async (email: string, password: string) => {
    const result = await dispatch(loginThunk({ email, password }));
    if (loginThunk.rejected.match(result)) {
      throw new Error((result.payload as { message?: string })?.message ?? "Login failed");
    }
  };

  const signup = async (data: {
    email: string;
    password: string;
    name: string;
    role: "firm" | "lawyer" | "client";
    company?: string;
  }) => {
    if (data.role === "firm") {
      const result = await dispatch(
        signupFirm({
          firmName: data.company ?? "My Firm",
          subdomain: (data.company ?? "firm").toLowerCase().replace(/\s+/g, "-"),
          adminName: data.name,
          adminEmail: data.email,
          adminPassword: data.password,
        })
      );
      if (signupFirm.rejected.match(result)) {
        throw new Error((result.payload as { message?: string })?.message ?? "Signup failed");
      }
    } else {
      const result = await dispatch(
        signupIndividual({
          name: data.name,
          email: data.email,
          password: data.password,
        })
      );
      if (signupIndividual.rejected.match(result)) {
        throw new Error((result.payload as { message?: string })?.message ?? "Signup failed");
      }
    }
  };

  const signupFirmFn = async (data: {
    firmName: string;
    subdomain: string;
    adminName: string;
    adminEmail: string;
    adminPassword: string;
  }) => {
    const result = await dispatch(signupFirm(data));
    if (signupFirm.rejected.match(result)) {
      throw new Error((result.payload as { message?: string })?.message ?? "Signup failed");
    }
  };

  const signupIndividualFn = async (data: {
    name: string;
    email: string;
    password: string;
  }) => {
    const result = await dispatch(signupIndividual(data));
    if (signupIndividual.rejected.match(result)) {
      throw new Error((result.payload as { message?: string })?.message ?? "Signup failed");
    }
  };

  const signupClientFn = async (data: SignupClientCredentials) => {
    try {
      const { data: res } = await authService.signupClient(data);
      const token = res.accessToken ?? res.token;
      if (token) setAccessToken(token);
      dispatch(setUser(res.user));
    } catch (err) {
      const msg = err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : "Signup failed";
      throw new Error(msg ?? "Signup failed");
    }
  };

  const logout = () => {
    dispatch(logoutAction());
    nextAuthSignOut({ redirect: false });
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: effectiveUser,
        isAuthenticated: !!effectiveUser,
        isLoading: effectiveLoading,
        login,
        signup,
        signupFirm: signupFirmFn,
        signupIndividual: signupIndividualFn,
        signupClient: signupClientFn,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
