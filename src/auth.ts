import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

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
          role: user.role, // initial role
          profileId: user.profile?.id,
          personId: user.profile?.persons[0]?.id,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // On initial sign in, add data to token
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.profileId = (user as any).profileId;
        token.personId = (user as any).personId;
      }
      
      // OPTIONAL: Always fetch fresh role from DB to avoid session lag
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email as string },
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
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).profileId = token.profileId;
        (session.user as any).personId = token.personId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
