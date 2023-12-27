import { RequireAuth } from '@components/misc';
import { Box } from '@mui/material';
import { type ReactElement } from 'react';

export default function Layout({ children }: { children: ReactElement }): ReactElement {
    return (
        <Box sx={{ height: '100vh', width: '100vw', backgroundColor: '#27282e' }}>
            {children}
        </Box>
    )
}