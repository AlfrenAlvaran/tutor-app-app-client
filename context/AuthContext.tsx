"use client";

import { createContext, useContext, type ReactNode } from "react";
import { PublicUser } from "@/constant/request/interface";

type AuthContextValue = {
  user: PublicUser;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Wraps a subtree with the already-resolved user.
 * The user MUST be fetched server-side (getCurrentUser()) by a parent
 * layout/page and passed in here as a prop — this component does not
 * fetch, store, or refresh anything on its own, since the auth cookie
 * is httpOnly and isn't readable from client JS anyway.
 */
export function AuthProvider({
  user,
  children,
}: {
  user: PublicUser;
  children: ReactNode;
}) {
  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}