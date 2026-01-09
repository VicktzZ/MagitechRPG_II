/* eslint-disable @typescript-eslint/no-unsafe-argument */
'use client';

import { CustomMenu } from '@layout';
import CloseIcon from '@mui/icons-material/Close';
import GamepadIcon from '@mui/icons-material/Gamepad';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import {
    AppBar,
    Avatar,
    Box,
    Button,
    Container,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemText,
    MenuItem,
    Toolbar,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { getProviders, signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactElement } from 'react';

import magitechIcon from '@public/assets/magitech_logo.png';
import discordIcon from '@public/icons/discord_icon.svg';
import googleIcon from '@public/icons/google_icon.svg';
import Image from 'next/image';
import { PlanBadge } from '@components/subscription';
import { useFirestoreRealtime } from '@hooks/useFirestoreRealtime';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import type { User } from '@models/entities';
import { useMemo } from 'react';

export default function LandingPageHeader(): ReactElement {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const { data: session } = useSession();
    const [ providers, setProviders ] = useState<any>(null);
    const [ anchorEl, setAnchorEl ] = useState<EventTarget & HTMLButtonElement | null>(null);
    const [ open, setOpen ] = useState<boolean>(false);
    const [ mobileOpen, setMobileOpen ] = useState<boolean>(false);
    const [ scrolled, setScrolled ] = useState<boolean>(false);
    
    // Buscar todos os usuários e encontrar o atual
    const { data: allUsers } = useFirestoreRealtime('user');
    const currentUser = useMemo(() => {
        if (!session?.user?.id || !allUsers) return null;
        return allUsers.find((u: User) => u.id === session.user.id) as User || null;
    }, [session?.user?.id, allUsers]);

    const handleClose = (): void => { setOpen(false) };
    const handleMobileMenuToggle = () => setMobileOpen(!mobileOpen);

    const router = useRouter();

    const providersIcons: Record<string, any> = {
        google: googleIcon,
        discord: discordIcon,
        credentials: magitechIcon
    };

    // Função para fazer scroll suave até uma seção da página
    const scrollToSection = (sectionId: string) => {
        if (sectionId === 'inicio') {
            // Para o início, vamos rolar para o topo da página
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
            return;
        }
        
        const section = document.getElementById(sectionId);
        if (section) {
            window.scrollTo({
                top: section.offsetTop - 80, // Subtrai a altura aproximada da navbar
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [ scrolled ]);

    useEffect(() => {
        (async () => {
            const response = await getProviders()
            setProviders(response)
        })()
    }, [ session ]);

    const navItems = [
        { label: 'Início', icon: <HomeIcon />, action: () => scrollToSection('inicio') },
        { label: 'Sobre', icon: <InfoIcon />, action: () => scrollToSection('sobre') },
        { label: 'Quem Somos', icon: <PersonIcon />, action: () => scrollToSection('quem-somos') },
        { label: 'Guia', icon: <MenuBookIcon />, action: () => scrollToSection('guia') },
        { label: 'Planos', icon: <WorkspacePremiumIcon />, action: () => scrollToSection('planos') },
        { label: 'Doação', icon: <VolunteerActivismIcon />, action: () => scrollToSection('doacao') }
    ];

    const renderMobileMenu = (
        <Drawer
            anchor="right"
            open={mobileOpen}
            onClose={handleMobileMenuToggle}
            PaperProps={{
                sx: {
                    width: 280,
                    backgroundColor: 'background.paper',
                    backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9))',
                    color: 'white'
                }
            }}
        >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton color="inherit" onClick={handleMobileMenuToggle}>
                    <CloseIcon />
                </IconButton>
            </Box>
            
            <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
            
            <List>
                {navItems.map((item) => (
                    <ListItem 
                        button 
                        key={item.label} 
                        onClick={() => {
                            item.action();
                            handleMobileMenuToggle();
                        }}
                        sx={{ py: 1.5 }}
                    >
                        <Box sx={{ mr: 2 }}>{item.icon}</Box>
                        <ListItemText primary={item.label} />
                    </ListItem>
                ))}
                
                <Divider sx={{ my: 2, backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
                
                {!session ? (
                    <>
                        <Typography variant="subtitle2" sx={{ px: 2, py: 1, opacity: 0.7 }}>
                            FAZER LOGIN COM
                        </Typography>
                        {providers && Object.values(providers).map((provider: any) => (
                            <ListItem 
                                button 
                                key={provider.name}
                                onClick={async () => await signIn(provider.id, { callbackUrl: '/app' })}
                                sx={{ py: 1.5 }}
                            >
                                <Image style={{ width: '1.5rem', height: '1.5rem', marginRight: '16px' }} src={providersIcons[provider.id]} alt={provider.name} />
                                <ListItemText primary={provider.name} />
                            </ListItem>
                        ))}
                    </>
                ) : (
                    <>
                        <ListItem sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Avatar sx={{ mr: 2 }}>
                                        <Image
                                            height={40}
                                            width={40}
                                            style={{ height: '100%', width: '100%' }} 
                                            src={session.user?.image ?? ''}
                                            alt={session.user?.name ?? 'User Avatar'}
                                        />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="subtitle1" noWrap>
                                            {session.user?.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ opacity: 0.7 }} noWrap>
                                            {session.user?.email}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0.5 }}>
                                    <PlanBadge user={user} size="small" showIcon />
                                </Box>
                            </Box>
                        </ListItem>
                        <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
                        <ListItem 
                            button 
                            onClick={() => {
                                router.push('/app');
                                handleMobileMenuToggle();
                            }}
                            sx={{ py: 1.5 }}
                        >
                            <Box sx={{ mr: 2 }}><GamepadIcon /></Box>
                            <ListItemText primary="Acessar Plataforma" />
                        </ListItem>
                        <ListItem 
                            button 
                            onClick={() => {
                                signOut({ callbackUrl: '/' });
                                handleMobileMenuToggle();
                            }}
                            sx={{ py: 1.5 }}
                        >
                            <Box sx={{ mr: 2 }}><LogoutIcon /></Box>
                            <ListItemText primary="Sair" />
                        </ListItem>
                    </>
                )}
            </List>
        </Drawer>
    );

    return (
        <AppBar 
            position="fixed" 
            color="transparent" 
            elevation={0}
            sx={{
                transition: 'all 0.3s ease',
                background: scrolled ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(10px)',
                boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.4)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(255, 255, 255, 0.15)' : 'none'
            }}
        >
            <Container maxWidth="xl">
                <Toolbar sx={{ py: 1, px: { xs: 1, md: 2 } }}>
                    {/* Logo */}
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <Image 
                            src={magitechIcon} 
                            alt="MagitechRPG" 
                            width={40} 
                            height={40} 
                            style={{ marginRight: '0.5rem' }} 
                        />
                        <Typography 
                            variant="h6" 
                            component="div" 
                            sx={{ 
                                fontWeight: 700, 
                                display: { xs: 'none', sm: 'block' },
                                background: 'linear-gradient(90deg, #64B5F6 0%, #9575CD 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            MagitechRPG
                        </Typography>
                    </Box>

                    {/* Desktop Navigation */}
                    {!isMobile && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            {navItems.map((item) => (
                                <Button 
                                    key={item.label} 
                                    color="inherit" 
                                    onClick={item.action}
                                    startIcon={item.icon}
                                    sx={{ 
                                        opacity: 0.9,
                                        '&:hover': { opacity: 1 },
                                        textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
                                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                        borderRadius: '8px',
                                        px: 2
                                    }}
                                >
                                    {item.label}
                                </Button>
                            ))}
                            
                            <Box sx={{ ml: 2, height: '24px', width: '1px', backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />
                            
                            {!session && providers ? (
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {Object.values(providers).map((provider: any) => (
                                        <Button
                                            key={provider.id}
                                            variant="outlined"
                                            onClick={() => { signIn(provider.id, { callbackUrl: '/app' }) }}
                                            startIcon={
                                                <Image 
                                                    style={{ width: '1.2rem', height: '1.2rem' }} 
                                                    src={providersIcons[provider.id]} 
                                                    alt={provider.name} 
                                                />
                                            }
                                            sx={{ 
                                                borderRadius: '8px',
                                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                                px: 2,
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    borderColor: 'rgba(255, 255, 255, 0.8)',
                                                    background: 'rgba(255, 255, 255, 0.1)'
                                                }
                                            }}
                                        >
                                            {provider.name}
                                        </Button>
                                    ))}
                                </Box>
                            ) : session ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    {currentUser && currentUser.subscription && (
                                        <PlanBadge user={currentUser} size="small" showIcon variant="outlined" />
                                    )}
                                    
                                    <Button
                                        variant="contained"
                                        onClick={() => router.push('/app')}
                                        startIcon={<GamepadIcon />}
                                        sx={{ 
                                            backgroundColor: theme.palette.primary.main,
                                            borderRadius: '8px'
                                        }}
                                    >
                                        Acessar Plataforma
                                    </Button>
                                    
                                    <Tooltip title="Perfil">
                                        <IconButton 
                                            onClick={(e) => {
                                                setAnchorEl(e.currentTarget);
                                                setOpen(true);
                                            }}
                                            sx={{ 
                                                p: 0.5, 
                                                border: '2px solid rgba(255, 255, 255, 0.2)',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    border: '2px solid rgba(255, 255, 255, 0.5)'
                                                }
                                            }}
                                        >
                                            <Avatar sx={{ height: '2.5rem', width: '2.5rem' }}>
                                                <Image
                                                    height={50}
                                                    width={50}
                                                    style={{ height: '100%', width: '100%' }} 
                                                    src={session.user?.image ?? ''}
                                                    alt={session.user?.name ?? 'User Avatar'} 
                                                />
                                            </Avatar>
                                        </IconButton>
                                    </Tooltip>
                                    
                                    <CustomMenu
                                        anchorEl={anchorEl}
                                        open={open}
                                        onClose={handleClose}
                                    >
                                        <Box sx={{ px: 2, py: 1 }}>
                                            <Typography variant="subtitle1">{session.user?.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {session.user?.email}
                                            </Typography>
                                        </Box>
                                        {currentUser && currentUser.subscription && (
                                            <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'center' }}>
                                                <PlanBadge user={currentUser} size="small" showIcon />
                                            </Box>
                                        )}
                                        <Divider />
                                        <MenuItem onClick={() => { router.push('/app'); handleClose(); }}>
                                            <GamepadIcon fontSize="small" sx={{ mr: 1 }} />
                                            Acessar Plataforma
                                        </MenuItem>
                                        <MenuItem onClick={() => { router.push('/app/subscription/plans'); handleClose(); }}>
                                            <WorkspacePremiumIcon fontSize="small" sx={{ mr: 1 }} />
                                            Ver Planos
                                        </MenuItem>
                                        <MenuItem onClick={() => { signOut({ callbackUrl: '/' }); handleClose(); }}>
                                            <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                                            Sair
                                        </MenuItem>
                                    </CustomMenu>
                                </Box>
                            ) : null}
                        </Box>
                    )}

                    {/* Mobile Menu Button */}
                    {isMobile && (
                        <IconButton 
                            edge="end" 
                            color="inherit" 
                            onClick={handleMobileMenuToggle}
                            sx={{ 
                                ml: 1,
                                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.25)'
                                }
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                </Toolbar>
            </Container>
            
            {/* Mobile Menu */}
            {renderMobileMenu}
        </AppBar>
    );
}