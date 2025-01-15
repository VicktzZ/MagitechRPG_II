/* eslint-disable @typescript-eslint/no-unsafe-argument */
'use client';

import React, { useEffect, type ReactElement, useState } from 'react';
import { Avatar, Box, IconButton, MenuItem, Typography, useMediaQuery } from '@mui/material';
import { getProviders, useSession, signIn, signOut } from 'next-auth/react';
import { CustomMenu } from '@layout';
import { useRouter } from 'next/navigation';
import { useTheme } from '@mui/material';

import googleIcon from '@public/icons/google_icon.svg';
import discordIcon from '@public/icons/discord_icon.svg';
import magitechIcon from '@public/assets/magitech_logo.png'
import Image from 'next/image';
export default function LandingPageHeader(): ReactElement {
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))

    const { data: session } = useSession()
    const [ providers, setProviders ] = useState<any>(null);
    const [ anchorEl, setAnchorEl ] = useState<EventTarget & HTMLButtonElement | null>(null)
    const [ open, setOpen ] = useState<boolean>()

    const handleClose = (): void => { setOpen(false) }

    const router = useRouter()

    const providersIcons: Record<string, any> = {
        google: googleIcon,
        discord: discordIcon,
        credentials: magitechIcon
    }

    useEffect(() => {
        (async () => {
            const response = await getProviders()

            console.log(session);

            setProviders(response)
        })()
    }, [ session ])

    return (
        <Box
            position='fixed'
            top='0'
            left='0'
            width='100%'
            bgcolor='transparent'
            zIndex={999}
        >
            <Box
                display='flex'
                justifyContent='space-between'
                alignItems='center'
                p={2.5}   
            >
                <Box mr={2}>
                    {/* <Logo /> */}
                </Box>
                <Box
                    display='flex'
                    flexDirection={!matches ? 'row' : 'column'}
                    gap={2.5}
                >
                    {(!session && providers) && Object.values(providers).map((provider: any) => (
                        <IconButton
                            onClick={() => { signIn(provider.id, { callbackUrl: '/plataform' }) }}
                            key={provider.name}
                            sx={{ display: 'flex', gap: 1, border: '1px solid white', bgcolor: '#00000090', borderRadius: 2, ':hover': { bgcolor: '#000' } }}
                        >
                            <Image style={{ width: '2rem', height: '2rem' }} src={providersIcons[provider.id]} alt={provider.name} />
                            <Typography>Sign in with {provider.name}</Typography>
                        </IconButton>
                    ))}
                    {session && (
                        <Box display='flex' alignItems='center' sx={{ cursor: 'pointer' }} gap={1}>
                            <IconButton onClick={e => {
                                setAnchorEl(e.currentTarget)
                                setOpen(true)
                            }}>
                                <Avatar sx={{ height: '3rem', width: '3rem' }}>
                                    <Image
                                        height={250}
                                        width={250} 
                                        style={{ height: '100%', width: '100%' }} 
                                        src={session.user?.image ?? 'undefined'} 
                                        alt={session.user?.name ?? 'User Avatar'} 
                                    />
                                </Avatar>
                            </IconButton>
                            <Typography>{session.user?.name}</Typography>
                            <CustomMenu
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={() => { router.push('/plataform') }}>Go to App</MenuItem>
                                <MenuItem onClick={() => { signOut({ callbackUrl: '/' }) }}>Sign Out</MenuItem>
                            </CustomMenu>
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    )
}