'use client';

import { CreateFichaModal } from '@layout';
import { Box } from '@mui/material';
import { useState, type ReactElement } from 'react';

export default function Ficha(): ReactElement {
    const [ open, setOpen ] = useState<boolean>(false);
    
    return (
        <Box bgcolor='#27282e'>
            <CreateFichaModal 
                open={open}
                handleClose={() => { setOpen(false) }}
            />
        </Box>
    )
}