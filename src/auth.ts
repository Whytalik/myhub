import NextAuth, { type DefaultSession } from "next-auth";
import { type JWT } from "next-auth/jwt";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";
import { type Role } from "@/app/generated/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      profileId?: string;
      personId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: Role;
    profileId?: string;
    personId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    profileId?: string;
    personId?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET || process.env.SESSION_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const email = (credentials.email as string).toLowerCase();
          console.log("[Auth] Attempting findUnique for email:", email);
          
          const user = await prisma.user.findUnique({
            where: { email },
            include: {
              profile: {
                include: {
                  persons: {
                    take: 1,
                    orderBy: { createdAt: "asc" },
                  },
                },
              },
            },
          });

          if (!user) {
            console.log("[Auth] User not found:", email);
            return null;
          }

          if (!user.passwordHash) {
            console.log("[Auth] User has no password hash:", email);
            return null;
          }

          const isValid = await compare(credentials.password as string, user.passwordHash);
          if (!isValid) {
            console.log("[Auth] Invalid password for user:", email);
            return null;
          }

          console.log("[Auth] User authorized successfully:", email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            profileId: user.profile?.id,
            personId: user.profile?.persons[0]?.id,
          };
        } catch (error: any) {
          console.error("[Auth] findUnique error:", error);
          // Re-throw to see the full stack trace in the log if possible
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign in, add data to token
      if (user) {
        token.id = user.id as string;
        token.role = user.role as Role;
        token.profileId = user.profileId;
        token.personId = user.personId;
      }
      
      // OPTIONAL: Always fetch fresh role from DB to avoid session lag
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: { role: true }
          });
          if (dbUser) {
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error("[Auth] jwt findUnique error:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.profileId = token.profileId;
        session.user.personId = token.personId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
