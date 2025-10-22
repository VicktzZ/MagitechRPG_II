/* eslint-disable @typescript-eslint/no-unused-vars */
import type { JWT } from '@node_modules/next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
        _id: string
        name: string
        email: string
        image: string
        token: JWT
    }
    token: JWT
  }
}