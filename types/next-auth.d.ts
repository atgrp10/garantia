/// <reference types="next-auth" />
import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      unite: string // ✅ ajout ici
    }
  }

  interface User {
    id: string
    name: string
    email: string
    role: string
    unite: string // ✅ ajout ici
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    name: string
    email: string
    role: string
    unite: string // ✅ ajout ici
  }
}
