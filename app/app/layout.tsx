'use client';

import '@public/fonts/fonts.css'

import { Box, type Theme, useMediaQuery } from '@mui/material';
import { AppDrawer, Notifications } from '@layout';
import { RequireAuth } from '@components/misc';
import type { ReactElement } from 'react';

export default function RootLayout({
    children
}: {
  children: ReactElement
}): ReactElement<any, any> {
    const NODE_ENV = process.env.NEXT_PUBLIC_NODE_ENV
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'))

    return NODE_ENV === 'production' ? (
        <RequireAuth>
            <Box p={isMobile ? 2 : 3}>
                <Box display='flex' width='100%' alignItems='center' justifyContent='space-between'>
                    <AppDrawer />
                    <Notifications />
                </Box>
                <Box>
                    {children}
                </Box>
            </Box>
        </RequireAuth>
    ) : (
        <>{children}</>
    )
}
