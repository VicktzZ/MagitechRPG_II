import type { Metadata } from 'next'

import '@public/global.css'

import { type ReactElement } from 'react';
import ContextProvider from '@contexts/ContextProvider';
import { startJobs } from '@jobs'

// Inicia os jobs apenas no servidor
if (typeof window === 'undefined') {
    startJobs()
}

export const metadata: Metadata = {
    title: 'Magitech RPG',
    description: 'A RPG created by Vitor Santos',
    manifest: '/manifest.json'
}

export default function RootLayout({
    children
}: {
    children: React.ReactNode
}): ReactElement<any, any> {
    return (
        <html className='html' lang="en">
            <body style={{
                boxSizing: 'border-box',
                margin: 0,
                padding: 0,
                overflowX: 'hidden',
                backgroundColor: '#0d0e1b',
                WebkitBoxSizing: 'border-box',
                MozBoxSizing: 'border-box',
                color: '#f4f4f4',
                fontFamily: 'Inter'
            }}>
                <ContextProvider>
                    {children}
                </ContextProvider>
            </body>
        </html>
    )
}
