import NextAuth, { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      tipo: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    tipo: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    tipo: string
  }
}
