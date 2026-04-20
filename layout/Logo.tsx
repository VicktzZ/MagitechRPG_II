'use client';

import { Box } from '@mui/material'
import React, { type ReactElement } from 'react'

import logo from '@public/assets/magitech_logo_written.png'
import Image from 'next/image'

export default function Logo(): ReactElement {
    return (
        <Box onClick={() => { location.href = '/' }} sx={{ cursor: 'pointer' }} display='flex' gap={2} alignItems='center'>
            <Image 
                height={0} 
                width={0} 
                src={logo} 
                alt='logo'
                style={{
                    width: '7.5rem',
                    height: '7.5rem',
                    filter: 'drop-shadow(6px 6px 3px rgba(0, 0, 0, .7))' 
                }} 
            />
        </Box>
    )
}