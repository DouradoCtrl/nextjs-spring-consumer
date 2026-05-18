"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

interface ProvidersProps extends React.ComponentProps<typeof NextThemesProvider> {
  children: React.ReactNode;
  session: Session | null;
}

export function Providers({ children, session, ...props }: ProvidersProps) {
  return (
    <NextThemesProvider {...props}>
      <SessionProvider session={session}>{children}</SessionProvider>
    </NextThemesProvider>
  );
}
