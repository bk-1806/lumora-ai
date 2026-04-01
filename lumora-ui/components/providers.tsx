"use client";

import { AuthProvider } from "@/context/auth-context";
import { AuthModal } from "@/components/auth-modal";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <AuthModal />
    </AuthProvider>
  );
}
