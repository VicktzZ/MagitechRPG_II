/* eslint-disable @typescript-eslint/no-unused-vars */
import type { JWT } from '@node_modules/next-auth/jwt'
import _ from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
        _id: string
        name: string
        email: string
        image: string
    }

    accessToken: string
    token: JWT
  }
}