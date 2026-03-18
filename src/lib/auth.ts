import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getUtenteByEmail } from './db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const utente = await getUtenteByEmail(credentials.email as string)
        if (!utente) return null

        if (utente.stato !== 'approved') {
          throw new Error(
            utente.stato === 'pending'
              ? 'Il tuo account è in attesa di approvazione.'
              : 'Il tuo account non è attivo.'
          )
        }

        const valid = await bcrypt.compare(credentials.password as string, utente.passwordHash)
        if (!valid) return null

        return {
          id: utente.id,
          email: utente.email,
          name: utente.alias,
          tipo: utente.tipo,
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.tipo = (user as any).tipo
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        ;(session.user as any).tipo = token.tipo
      }
      return session
    },
  },
  pages: {
    signIn: '/accedi',
    error: '/accedi',
  },
  secret: process.env.NEXTAUTH_SECRET,
})
