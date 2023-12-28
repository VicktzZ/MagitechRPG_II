'use client';

import { Box, Container, Typography } from '@mui/material'
import React, { type ReactElement } from 'react'

import Logo from './Logo';

export default function Footer(): ReactElement {
    return (
        <Container
            sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 5,
                mt: 10,
                p: 5
            }} 
        >
            <Logo />
            <Box>
                <Typography>2023 Magitech II - Todos direitos reservados, segurança e privacidade</Typography>
                <Typography fontWeight={900}>© Magitech 2023</Typography>
            </Box>
        </Container>
    )
}