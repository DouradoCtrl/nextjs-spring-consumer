// app/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Spring Boot API",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const res = await fetch("http://localhost:8080/api/v1/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: credentials?.email,
            password: credentials?.password,
          }),
          headers: { "Content-Type": "application/json" },
        });

        const userResponse = await res.json();

        if (
          res.ok &&
          userResponse?.user &&
          userResponse?.token &&
          userResponse?.user.enabled
        ) {
          return {
            ...userResponse.user,
            token: userResponse.token,
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.token;
        token.username = user.username;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
        token.id = user.id;
        token.enabled = user.enabled;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user = {
        ...session.user,
        username: token.username,
        role: token.role,
        name: token.name,
        email: token.email,
        id: token.id,
        enabled: token.enabled,
      };
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/logout",
  },
};
