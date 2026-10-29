'use client';

import { IconButton, type IconButtonProps, useTheme } from '@mui/material';
import { forwardRef } from 'react';

// forwardRef: o Tooltip do MUI precisa da ref do filho para posicionar a dica
const CustomIconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function CustomIconButton(props, ref) {
    const theme = useTheme()

    return (
        <IconButton ref={ref} {...props} sx={{ border: `1px solid ${theme.palette.primary.main}50`, p: 1.25, ...props.sx }}>
            {props.children}
        </IconButton>
    )
})

export default CustomIconButton
