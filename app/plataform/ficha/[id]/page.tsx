import { RequireAuth } from '@components/misc';
import { Box } from '@mui/material';
import { type ReactElement } from 'react';

export default function Ficha({ params }: { params: { id: string } }): ReactElement {
    return (
        <RequireAuth>
            <Box>{params.id}</Box>
        </RequireAuth>    
    )
}