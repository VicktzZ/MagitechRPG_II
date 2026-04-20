'use client';

import { Box, Container, Typography, Grid, Link, IconButton, useMediaQuery, Divider, alpha } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import React, { type ReactElement } from 'react'
import Logo from './Logo';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import DescriptionIcon from '@mui/icons-material/Description';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';

export default function Footer(): ReactElement {
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.down('md'));
    const currentYear = new Date().getFullYear();

    return (
        <Box 
            component="footer" 
            sx={{ 
                bgcolor: alpha(theme.palette.background.paper, 0.5), 
                pt: 6,
                pb: 3,
                backdropFilter: 'blur(10px)',
                borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={4} justifyContent="space-between">
                    {/* Logo e info da empresa */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: matches ? 'center' : 'flex-start', mb: 3 }}>
                            <Logo />
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    mt: 2, 
                                    maxWidth: '300px',
                                    textAlign: matches ? 'center' : 'left',
                                    color: alpha('#fff', 0.7)
                                }}>
                                O sistema de RPG Magitech II traz uma experiência única onde magia e tecnologia se fundem em um mundo de possibilidades fantásticas.
                            </Typography>
                            
                            <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                                <IconButton 
                                    aria-label="GitHub"
                                    size="small"
                                    sx={{ 
                                        color: '#fff',
                                        bgcolor: alpha('#000', 0.3),
                                        '&:hover': {
                                            bgcolor: theme.palette.primary.main
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={() => window.open('https://github.com/VicktzZ', '_blank')}
                                >
                                    <GitHubIcon fontSize="small" />
                                </IconButton>
                                
                                <IconButton 
                                    aria-label="LinkedIn"
                                    size="small"
                                    sx={{ 
                                        color: '#fff',
                                        bgcolor: alpha('#000', 0.3),
                                        '&:hover': {
                                            bgcolor: '#0077B5'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={() => window.open('https://linkedin.com/in/vitor-hugo-rodrigues-dos-santos', '_blank')}
                                >
                                    <LinkedInIcon fontSize="small" />
                                </IconButton>
                                
                                <IconButton 
                                    aria-label="Email"
                                    size="small"
                                    sx={{ 
                                        color: '#fff',
                                        bgcolor: alpha('#000', 0.3),
                                        '&:hover': {
                                            bgcolor: '#EA4335'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                    onClick={() => window.open('mailto:vitorhugo.rdossantos@gmail.com', '_blank')}
                                >
                                    <EmailIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>
                    </Grid>
                    
                    {/* Navegação Rápida */}
                    <Grid item xs={12} md={4}>
                        <Typography 
                            variant="h6" 
                            gutterBottom
                            sx={{ 
                                textAlign: matches ? 'center' : 'left',
                                fontWeight: 600,
                                position: 'relative',
                                display: 'inline-block',
                                mb: 3,
                                '&:after': {
                                    content: '""',
                                    position: 'absolute',
                                    width: '40px',
                                    height: '2px',
                                    bottom: '-6px',
                                    left: 0,
                                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                                }
                            }}
                        >
                            Navegação Rápida
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: matches ? 'center' : 'flex-start', gap: 1.5 }}>
                            <Link 
                                href="#home" 
                                underline="hover"
                                sx={{ 
                                    color: alpha('#fff', 0.7), 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    gap: 1,
                                    transition: 'color 0.2s ease',
                                    '&:hover': {
                                        color: theme.palette.primary.main
                                    }
                                }}
                            >
                                <HomeIcon fontSize="small" />
                                Início
                            </Link>
                            <Link 
                                href="#sobre" 
                                underline="hover"
                                sx={{ 
                                    color: alpha('#fff', 0.7), 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    gap: 1,
                                    transition: 'color 0.2s ease',
                                    '&:hover': {
                                        color: theme.palette.primary.main
                                    }
                                }}
                            >
                                <DescriptionIcon fontSize="small" />
                                Sobre
                            </Link>
                            <Link 
                                href="#quem-somos" 
                                underline="hover"
                                sx={{ 
                                    color: alpha('#fff', 0.7), 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    gap: 1,
                                    transition: 'color 0.2s ease',
                                    '&:hover': {
                                        color: theme.palette.primary.main
                                    }
                                }}
                            >
                                <GroupIcon fontSize="small" />
                                Quem Somos
                            </Link>
                            <Link 
                                href="#guia" 
                                underline="hover"
                                sx={{ 
                                    color: alpha('#fff', 0.7), 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    gap: 1,
                                    transition: 'color 0.2s ease',
                                    '&:hover': {
                                        color: theme.palette.primary.main
                                    }
                                }}
                            >
                                <MenuBookIcon fontSize="small" />
                                Guia de Regras
                            </Link>
                            <Link 
                                href="#doacao" 
                                underline="hover"
                                sx={{ 
                                    color: alpha('#fff', 0.7), 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    gap: 1,
                                    transition: 'color 0.2s ease',
                                    '&:hover': {
                                        color: theme.palette.primary.main
                                    }
                                }}
                            >
                                <VolunteerActivismIcon fontSize="small" />
                                Apoie o Projeto
                            </Link>
                        </Box>
                    </Grid>
                    
                    {/* Contato e Copyright */}
                    <Grid item xs={12} md={4}>
                        <Typography 
                            variant="h6" 
                            gutterBottom
                            sx={{ 
                                textAlign: matches ? 'center' : 'left',
                                fontWeight: 600,
                                position: 'relative',
                                display: 'inline-block',
                                mb: 3,
                                '&:after': {
                                    content: '""',
                                    position: 'absolute',
                                    width: '40px',
                                    height: '2px',
                                    bottom: '-6px',
                                    left: 0,
                                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                                }
                            }}
                        >
                            Contato
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: matches ? 'center' : 'flex-start', gap: 1.5 }}>
                            <Typography sx={{ color: alpha('#fff', 0.7) }}>
                                Email: vitorhugo.rdossantos@gmail.com
                            </Typography>
                            <Typography sx={{ color: alpha('#fff', 0.7) }}>
                                GitHub: github.com/VicktzZ
                            </Typography>
                            <Typography sx={{ color: alpha('#fff', 0.7) }}>
                                LinkedIn: vitor-hugo-rodrigues-dos-santos
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
                
                <Divider sx={{ mt: 5, mb: 3, borderColor: alpha('#fff', 0.1) }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexDirection: matches ? 'column' : 'row', alignItems: 'center', gap: 2 }}>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: alpha('#fff', 0.5),
                            textAlign: matches ? 'center' : 'left'
                        }}
                    >
                        Magitech II - Todos direitos reservados
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: alpha('#fff', 0.5),
                            textAlign: matches ? 'center' : 'right',
                            fontWeight: 500
                        }}
                    >
                        {currentYear} Magitech II
                    </Typography>
                </Box>
            </Container>
        </Box>
    )
}