/* eslint-disable @typescript-eslint/no-misused-promises */
import { Avatar, Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, useTheme, alpha, Tooltip, IconButton } from '@mui/material';
import { type KeyboardEvent, type MouseEvent, type ReactElement, type ReactNode, useState } from 'react';
import { Article, AutoStories, Home, Logout, Menu, Start, LightMode, DarkMode } from '@mui/icons-material';
import { useThemeContext } from '@contexts';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CustomIconButton from './CustomIconButton';
import Image from 'next/image';

export default function AppDrawer(): ReactElement {
    const theme = useTheme();
    const { data: session } = useSession();
    const { themeMode, toggleTheme } = useThemeContext();
    
    const [ drawerOpen, setDrawerOpen ] = useState<boolean>(false);
   
    const router = useRouter()

    const toggleDrawer =
        (openParam: boolean) =>
            (event: KeyboardEvent | MouseEvent) => {
                if (
                    event.type === 'keydown' &&
                    ((event as KeyboardEvent).key === 'Tab' ||
                    (event as KeyboardEvent).key === 'Shift')
                ) {
                    return;
                }

                setDrawerOpen(openParam)
            };  

    const list = (): ReactNode => (
        <Box
            display='flex'
            flexDirection='column'
            justifyContent='space-between'
            py={1.5}
            bgcolor={theme.palette.mode === 'dark' ? '#1a2234' : '#f8fafc'}
            width='280px'
            role="presentation"
            height='100%'
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
            sx={{
                position: 'relative',
                '&:before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 4,
                    height: '100%',
                    background: theme.palette.primary.main,
                    opacity: 0.9
                }
            }}
        >
            <Box>
                {/* Logo ou título do app */}
                <Box 
                    sx={{ 
                        px: 2.5, 
                        py: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        mb: 1 
                    }}
                >
                    <Typography variant="h6" fontWeight={600} color="primary.main">
                        MagitechRPG
                    </Typography>
                    <Tooltip title={themeMode === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}>
                        <IconButton
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleTheme();
                            }}
                            sx={{
                                color: theme.palette.primary.main,
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.15)
                                },
                                transition: 'all 0.2s ease-in-out',
                                borderRadius: 1.5
                            }}
                            size="small"
                        >
                            {themeMode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                </Box>
                <List sx={{ px: 1 }}>
                    <ListItem disablePadding onClick={() => { router.push('/app') }}>
                        <ListItemButton
                            sx={{
                                borderRadius: 2,
                                mb: 0.5,
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.08)
                                }
                            }}
                        >
                            <ListItemIcon>
                                <Home />
                            </ListItemIcon>
                            <ListItemText primary='Home' />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding onClick={() => { router.push('/') }}>
                        <ListItemButton
                            sx={{
                                borderRadius: 2,
                                mb: 0.5,
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.08)
                                }
                            }}
                        >
                            <ListItemIcon>
                                <Start />
                            </ListItemIcon>
                            <ListItemText primary='Início' />
                        </ListItemButton>
                    </ListItem>
                </List>
                <Divider sx={{ my: 1.5, opacity: 0.4 }} />
                <List sx={{ px: 1 }}>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => { router.push('/app/campaign') }}>
                            <ListItemIcon>
                                <AutoStories />
                            </ListItemIcon>
                            <ListItemText primary='Campanha' />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => { router.push('/app/charsheet/create') }}>
                            <ListItemIcon>
                                <Article />
                            </ListItemIcon>
                            <ListItemText primary='Criar Ficha' />
                        </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemButton onClick={() => { signOut({ callbackUrl: '/' }) }}>
                            <ListItemIcon>
                                <Logout />
                            </ListItemIcon>
                            <ListItemText primary='Logout' />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>
            <Box 
                sx={{
                    display: 'flex', 
                    p: 2, 
                    alignItems: 'center', 
                    gap: 2,
                    borderTop: '1px solid',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    mt: 1,
                    mx: 1.5,
                    pt: 2
                }}
            >
                <Avatar 
                    sx={{ 
                        height: '2.5rem', 
                        width: '2.5rem', 
                        color: 'white', 
                        bgcolor: theme.palette.primary.main,
                        boxShadow: 1
                    }}
                >
                    {
                        (session?.user?.image !== 'undefined') && session?.user?.image ? (
                            <Image
                                height={250}
                                width={250}
                                style={{ height: '100%', width: '100%' }} 
                                src={session?.user?.image ?? 'undefined'} 
                                alt={session?.user?.name ?? 'User Avatar'} 
                            />
                        ) : session?.user?.name?.charAt(0).toUpperCase()
                    }
                </Avatar>
                <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {session?.user?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {session?.user?.email}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box>
            <CustomIconButton 
                onClick={toggleDrawer(true)}
                sx={{
                    color: theme.palette.primary.main,
                    '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.1)
                    }
                }}
            >
                <Menu />
            </CustomIconButton>
            <Drawer
                anchor='left'
                open={drawerOpen}
                onClose={toggleDrawer(false)}
                PaperProps={{
                    sx: {
                        borderRight: 'none',
                        boxShadow: theme.palette.mode === 'dark' 
                            ? '0 8px 16px rgba(0,0,0,0.5)'
                            : '0 8px 16px rgba(0,0,0,0.1)'
                    }
                }}
            >
                {list()}
            </Drawer>
        </Box>
    );
}