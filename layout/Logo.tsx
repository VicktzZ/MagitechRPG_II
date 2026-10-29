'use client';

import LogoMark from '@components/misc/LogoMark'
import { Box, Typography } from '@mui/material'
import { font } from '@themes/tokens'
import React, { type ReactElement } from 'react'

export default function Logo(): ReactElement {
    return (
        <Box
            component="a"
            href="/"
            aria-label="Magitech RPG, página inicial"
            sx={{ cursor: 'pointer', color: 'text.primary', textDecoration: 'none' }}
            display="flex"
            gap={1.5}
            alignItems="center"
        >
            <LogoMark size={44} />
            <Typography component="span" sx={{ fontFamily: font.display, fontWeight: 600, fontSize: '1.25rem', letterSpacing: '0.16em' }}>
                MAGITECH
            </Typography>
        </Box>
    )
}
