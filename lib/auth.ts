// lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            apartment: {
              select: {
                id: true,
                identifier: true,
              },
            },
          },
        })

        if (!user) {
          throw new Error('Credenciales incorrectas')
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!passwordMatch) {
          throw new Error('Credenciales incorrectas')
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
          apartmentId: user.apartmentId,
          apartmentIdentifier: user.apartment?.identifier ?? null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // En el primer login 'user' tiene datos, los guardamos en el token
      if (user) {
        token.id = user.id
        token.role = user.role
        token.mustChangePassword = user.mustChangePassword
        token.apartmentId = user.apartmentId ?? null
        token.apartmentIdentifier = user.apartmentIdentifier ?? null
      }
      return token
    },
    async session({ session, token }) {
      // Pasamos los datos del token a la sesión
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.mustChangePassword = token.mustChangePassword as boolean
        session.user.apartmentId = token.apartmentId as string | null
        session.user.apartmentIdentifier = token.apartmentIdentifier as string | null
      }
      return session
    },
  },
}