/* eslint-disable @typescript-eslint/no-misused-promises */
import { Avatar, Box, Divider, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, useTheme, alpha, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, Grid, Pagination, Chip } from '@mui/material';

import { type KeyboardEvent, type MouseEvent, type ReactElement, type ReactNode, useState, useMemo } from 'react';
import { Article, AutoStories, Home, Logout, Menu, Start, LightMode, DarkMode, Person, Build, WorkspacePremium } from '@mui/icons-material';
import { useThemeContext } from '@contexts';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CustomIconButton from './CustomIconButton';
import Image from 'next/image';
import { useFirestoreRealtime } from '@hooks/useFirestoreRealtime';
import { PlanBadge } from '@components/subscription';
import type { User } from '@models/entities';

export default function AppDrawer(): ReactElement {
    const theme = useTheme();
    const { data: session, update } = useSession();
    const { themeMode, toggleTheme } = useThemeContext();
    
    const [ drawerOpen, setDrawerOpen ] = useState<boolean>(false);
    const [ usersModalOpen, setUsersModalOpen ] = useState(false);
    const [ page, setPage ] = useState(1);

    const router = useRouter()
    
    // Buscar todos os usuários do Firestore em tempo real
    const { data: allUsers } = useFirestoreRealtime('user');
    
    // Encontrar o usuário atual baseado na sessão
    const currentUser = useMemo(() => {
        if (!session?.user?.id || !allUsers) return null;
        return (allUsers as User[]).find((u: User) => u.id === session.user.id) || null;
    }, [session?.user?.id, allUsers]);

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

    const { data: users } = useFirestoreRealtime('user');

    function handleImpersonate(u: any) {
        try {
            localStorage.setItem('userId', u.id);
            update({ user: { ...(session?.user ?? {}), id: u.id } });
        } catch { }
        setUsersModalOpen(false);
        setDrawerOpen(false);
        router.push('/app');
    }

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
                        <ListItemButton onClick={() => { router.push('/app/subscription/plans') }}>
                            <ListItemIcon>
                                <WorkspacePremium />
                            </ListItemIcon>
                            <ListItemText primary='Planos' />
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
                {/* Seção Admin - apenas em DEV */}
                {process.env.NEXT_PUBLIC_NODE_ENV === 'development' && (
                    <>
                        <Divider sx={{ my: 1.5, opacity: 0.4 }} />
                        <Box sx={{ px: 2, mb: 1 }}>
                            <Chip
                                label="DEV"
                                size="small"
                                sx={{
                                    bgcolor: alpha(theme.palette.warning.main, 0.15),
                                    color: theme.palette.warning.main,
                                    fontWeight: 600,
                                    fontSize: '0.65rem'
                                }}
                            />
                        </Box>
                        <List sx={{ px: 1 }}>
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => { router.push('/admin/jobs') }}>
                                    <ListItemIcon>
                                        <Build sx={{ color: theme.palette.warning.main }} />
                                    </ListItemIcon>
                                    <ListItemText primary='Admin: Jobs' />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => { router.push('/admin/subscriptions') }}>
                                    <ListItemIcon>
                                        <WorkspacePremium sx={{ color: theme.palette.warning.main }} />
                                    </ListItemIcon>
                                    <ListItemText primary='Admin: Planos' />
                                </ListItemButton>
                            </ListItem>
                            <ListItem disablePadding>
                                <ListItemButton onClick={() => setUsersModalOpen(true)}>
                                    <ListItemIcon>
                                        <Person sx={{ color: theme.palette.warning.main }} />
                                    </ListItemIcon>
                                    <ListItemText primary='Simular conta' />
                                </ListItemButton>
                            </ListItem>
                        </List>
                    </>
                )}
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2,
                    gap: 1.5,
                    borderTop: '1px solid',
                    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    mt: 1,
                    mx: 1.5,
                    pt: 2
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ position: 'relative' }}>
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
                        {currentUser?.subscription && (
                            <Tooltip title={currentUser.subscription.plan}>
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: -2,
                                        right: -2,
                                        width: '1.1rem',
                                        height: '1.1rem',
                                        borderRadius: '50%',
                                        bgcolor: 'background.paper',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.7rem',
                                        boxShadow: 1,
                                        border: `2px solid ${theme.palette.background.paper}`
                                    }}
                                >
                                    {currentUser.subscription.plan === 'FREEMIUM' && '⚡'}
                                    {currentUser.subscription.plan === 'PREMIUM' && '👑'}
                                    {currentUser.subscription.plan === 'PREMIUM_PLUS' && '💎'}
                                </Box>
                            </Tooltip>
                        )}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {session?.user?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                            {session?.user?.email}
                        </Typography>
                    </Box>
                </Box>
                {currentUser && currentUser.subscription && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                        <PlanBadge user={currentUser} size="small" showIcon />
                    </Box>
                )}
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
            <Dialog open={usersModalOpen} onClose={() => setUsersModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Selecionar usuário</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {(users || []).slice((page - 1) * 10, page * 10).map((u: any) => (
                            <Grid item xs={12} sm={6} md={4} key={u.id}>
                                <ListItemButton onClick={() => handleImpersonate(u)} sx={{ borderRadius: 2, border: '1px solid', borderColor: alpha(theme.palette.divider, 0.5) }}>
                                    <ListItemIcon>
                                        <Avatar src={u.image || undefined}>
                                            {u.name?.charAt(0)?.toUpperCase()}
                                        </Avatar>
                                    </ListItemIcon>
                                    <ListItemText primary={u.name || 'Sem nome'} secondary={u.email || u.id} />
                                </ListItemButton>
                            </Grid>
                        ))}
                    </Grid>
                    <Box display="flex" justifyContent="center" mt={2}>
                        <Pagination count={Math.max(1, Math.ceil((users?.length || 0) / 10))} page={page} onChange={(_, p) => setPage(p)} />
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
}