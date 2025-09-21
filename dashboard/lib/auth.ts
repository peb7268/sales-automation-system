import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { query } from "./db";

export const authOptions: NextAuthOptions = {
  providers: [
    // Username/Password Authentication
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        try {
          // Check if user exists in database
          const result = await query(
            'SELECT * FROM users WHERE email = $1',
            [credentials.email]
          );

          const user = result.rows[0];

          if (!user) {
            throw new Error("User not found");
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password_hash
          );

          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw new Error("Authentication failed");
        }
      }
    }),

    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists in database
          const result = await query(
            'SELECT * FROM users WHERE email = $1',
            [user.email!]
          );
          
          const existingUser = result.rows[0];

          if (!existingUser) {
            // Create new user from Google OAuth
            await query(
              `INSERT INTO users (email, name, image, provider, google_id) 
               VALUES ($1, $2, $3, $4, $5)`,
              [user.email!, user.name, user.image, "google", account.providerAccountId]
            );
          } else {
            // Update existing user with Google ID if not set
            if (!existingUser.google_id) {
              await query(
                'UPDATE users SET google_id = $1, image = $2 WHERE id = $3',
                [account.providerAccountId, user.image, existingUser.id]
              );
            }
          }
        } catch (error) {
          console.error("Error managing Google user:", error);
          return false;
        }
      }
      return true;
    },

    async session({ session, token }) {
      if (session?.user?.email) {
        try {
          // Get user from database
          const result = await query(
            'SELECT id, role, team_id FROM users WHERE email = $1',
            [session.user.email]
          );
          
          const user = result.rows[0];

          if (user) {
            session.user.id = user.id;
            session.user.role = user.role;
            session.user.teamId = user.team_id;
          }
        } catch (error) {
          console.error('Session callback error:', error);
        }
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },

  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    newUser: "/auth/welcome"
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};