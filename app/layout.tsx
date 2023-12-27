import type { Metadata } from 'next'

import '@public/fonts/fonts.css'

import { type ReactElement } from 'react';
import ContextProvider from '@contexts/ContextProvider';

export const metadata: Metadata = {
    title: 'Magitech RPG',
    description: 'A RPG created by Vitor Santos'
}

export default function RootLayout({
    children
}: {
  children: React.ReactNode
}): ReactElement<any, any> {
    return (
        <html lang="en">
            <body style={{
                boxSizing: 'border-box',
                margin: 0,
                padding: 0,
                overflowX: 'hidden',
                backgroundColor: '#101621',
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
