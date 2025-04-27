import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions } from 'next-auth';
import { prisma } from "@/lib/db";
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
    providers: [
      CredentialsProvider({
        name: 'Credentials',
        credentials: {
          username: { label: "Username", type: "text" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials, req) {
          if (!credentials?.username || !credentials?.password) {
            throw new Error('Invalid credentials');
          }
          const user = await prisma.user.findUnique({
            where: {
              username: credentials.username,
            },
          });
  
          if (!user) {
            throw new Error('No user found with that username');
          }
          const isPasswordValid = credentials.password === user.password//await compare(credentials.password, user.password);
  
          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }
  
          return {
            id: user.id.toString(),
            username: user.username,
            role: user.role,
          };
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.role = user.role;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.role = token.role;
        }
        return session;
      },
    },
    pages: {
      signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
  };