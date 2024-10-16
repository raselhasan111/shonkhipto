// src.auth.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { User } from "@/lib/definitions";
import google from "next-auth/providers/google";
import axios from "axios";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    // **************************************************************
    // added provider
    google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    // **************************************************************
    Credentials({
      async authorize(credentials) {
        if (credentials.id && credentials.password) {
          // Add you backend code here
          // let loginRes = await backendLogin(credentials.id, credentials.password)
          let loginRes = {
            success: true,
            data: {
              user: {
                ID: "john_doe",
                NAME: "John Doe",
                EMAIL: "email@email.email",
              },
            },
          };
          // Failed logging in
          if (!loginRes.success) return null;
          // Successful log in
          const user = {
            id: loginRes.data.user.ID ?? "",
            name: loginRes.data.user.NAME ?? "",
            email: loginRes.data.user.EMAIL ?? "",
          } as User;
          return user;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      session.user = token.user as User;
      session.token = token.token;
      return session;
    },
    async jwt({ token, user, trigger, session, account }) {
      if (user) {
        token.user = user;
      }
      // ***************************************************************
      if (account) {
        if (account.provider === "google") {
          console.log("nextauthproviderinfo", {
            token,
            user,
            trigger,
            session,
            account,
          });
          const response = await axios.post(
            "http://localhost:8000/auth/google",
            {
              id_token: account.id_token,
            }
          );

          console.log({ response });

          token.user = response.data;
        }
      }
      // ***************************************************************
      // added code
      if (trigger === "update" && session) {
        token = { ...token, user: session.user };
      }
      // **************************************************************
      return token;
    },
  },
});
