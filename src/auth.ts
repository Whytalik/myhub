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
    role: Role;
    profileId?: string;
    personId?: string;
  }

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

        const email = (credentials.email as string).toLowerCase();
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

        if (!user || !user.passwordHash) return null;

        const isValid = await compare(credentials.password as string, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          profileId: user.profile?.id,
          personId: user.profile?.persons[0]?.id,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign in, add data to token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.profileId = user.profileId;
        token.personId = user.personId;
      }
      
      // OPTIONAL: Always fetch fresh role from DB to avoid session lag
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { role: true }
        });
        if (dbUser) {
          token.role = dbUser.role;
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
