'use client';

import { IconButton, type IconButtonProps, useTheme } from '@mui/material';
import type { ReactElement } from 'react';

export default function CustomIconButton(props: IconButtonProps): ReactElement {
    const theme = useTheme()
    
    return (
        <IconButton {...props} sx={{ border: `1px solid ${theme.palette.primary.main}50`, p: 1.25 }}>
            {props.children}
        </IconButton>
    )
}