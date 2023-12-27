'use client';

import { Box, Typography } from '@mui/material'
import React, { type ReactElement } from 'react'

import logo from '@public/magitech_logo.png'
import Image from 'next/image'

export default function Logo(): ReactElement {
    return (
        <Box onClick={() => { location.href = '/' }} sx={{ cursor: 'pointer' }} display='flex' gap={2} alignItems='center'>
            <Image height={0} width={0} style={{ width: '2.5rem', height: '2.5rem' }} src={logo} alt='logo' />
            <Typography fontSize='2rem' fontFamily='WBZ'>Magitech II</Typography>
        </Box>
    )
}