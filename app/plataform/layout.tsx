'use client';

import '@public/fonts/fonts.css'
import { type ReactElement } from 'react';
import { RequireAuth } from '@components/misc';
import { Box } from '@mui/material';
import { AppDrawer } from '@layout';

export default function RootLayout({
    children
}: {
  children: ReactElement
}): ReactElement<any, any> {
    const NODE_ENV = 'production' // process.env.NODE_ENV

    return NODE_ENV === 'production' ? (
        <RequireAuth>
            <Box p={3}>
                <AppDrawer />
                {children}
            </Box>
        </RequireAuth>
    ) : (
        <>{children}</>
    )
}
