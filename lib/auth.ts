import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { compare } from "bcryptjs"; // For password comparison if you're hashing passwords

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username and password are required");
        }

        const user = await prisma.user.findUnique({
          where: {
            username: credentials.username
          },
          select: {
            id: true,
            username: true,
            password: true,
            role: true,
            departmentId: true,
          }
        });

        if (!user) {
          throw new Error("No user found with this username");
        }

        // If you're hashing passwords (which you should be), compare here
        // const isValid = await compare(credentials.password, user.password);
        // For this example, we'll assume plain text comparison (not recommended for production)
        const isValid = credentials.password === user.password;

        if (!isValid) {
          throw new Error("Incorrect password");
        }

        // Return user object with the properties you want in the session
        return {
          id: user.id.toString(),
          name: user.username,
          role: user.role,
          department: user.departmentId?.toString() || ''
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }:any) {
      // Persist the user id and role to the token right after signin
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.department = user.department;
      }
      return token;
    },
    async session({ session, token }:any) {
      // Send properties to the client, like an access_token and user id from a provider.
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.name as string;
        session.user.department = token.department as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login", // Custom sign-in page
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Enable debug messages in the console if you're having problems
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);