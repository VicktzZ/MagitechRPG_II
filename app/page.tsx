/* eslint-disable @typescript-eslint/no-use-before-define */
'use client'

import { Footer, LandingPageHeader } from '@layout'
import { Avatar, Box, Button, Card, Container, type SxProps, Typography, useMediaQuery } from '@mui/material'
import { useState, type ReactElement, useEffect, useRef } from 'react'
import { Animate, AnimateOnScroll, Parallax } from '@components/misc'
import { intro, landingPageGrimoire, landingPageSynopse, BLOB_API } from '@constants'
import { useTheme } from '@mui/material'
import { useRouter } from 'next/navigation'
import magitechCapa from '@public/assets/magitech_capa.png'
import magitechCapaGrimorio from '@public/assets/magitech_capa_grimorio.png'
import profilePhoto from '@public/assets/profile_photo.jpg'
import Image from 'next/image'
import {  } from 'next-auth/react'

export default function LandingPage(): ReactElement | null {
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))
    const [ bgIndex ] = useState(1)
    const [ deferredPrompt, setDeferredPrompt ] = useState<any>(null)
    const [ showButton, setShowButton ] = useState(false)
    const [ isClient, setIsClient ] = useState(false)
    const [ isGlitching, setIsGlitching ] = useState(false)
    const [ isBgGlitching, setIsBgGlitching ] = useState(false)
    const glitchRef = useRef<HTMLDivElement>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const bgTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const router = useRouter()

    const triggerGlitch = () => {
        const waitTime = Math.random() * 7000 + 3000;
        
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
            setIsGlitching(true);
            
            setTimeout(() => {
                setIsGlitching(false);
                
                triggerGlitch();
            }, 800);
        }, waitTime);
    };

    const triggerBgGlitch = () => {
        const waitTime = Math.random() * 15000 + 8000; // Mais raro que o título
        
        if (bgTimeoutRef.current) {
            clearTimeout(bgTimeoutRef.current);
        }
        
        bgTimeoutRef.current = setTimeout(() => {
            setIsBgGlitching(true);
            
            setTimeout(() => {
                setIsBgGlitching(false);
                
                triggerBgGlitch();
            }, 500); // Duração mais curta para o fundo
        }, waitTime);
    };

    useEffect(() => {
        triggerGlitch();
        triggerBgGlitch();
        
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (bgTimeoutRef.current) {
                clearTimeout(bgTimeoutRef.current);
            }
        };
    }, []);

    const handleInstallClick = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt()
            deferredPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('Usuário aceitou a instalação da PWA')
                } else {
                    console.log('Usuário não aceitou a instalação da PWA')
                }
                setShowButton(false)
                setDeferredPrompt(null)
            })
        }
    }

    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        const handleBeforeInstallPrompt = (event: any) => {
            event.preventDefault()
            setDeferredPrompt(event)
            setShowButton(true)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
    }, [])

    if (!isClient) {
        return null
    }

    return (
        <>
            <LandingPageHeader />
            <Animate style={{ userSelect: 'none' }} isVisible animationIn="fadeIn">
                <div id="inicio" />
                <Parallax
                    style={{ 
                        overflow: 'hidden', 
                        userSelect: 'none',
                        willChange: 'transform',
                        backfaceVisibility: 'hidden',
                        position: 'relative'
                    }}
                    bgImage={`/assets/background/background_parallax_${bgIndex}.jpg`}
                    strength={100}
                    blur={{ min: -1, max: 1 }}
                    bgImageStyle={{ 
                        objectFit: 'cover',
                        transform: 'translateZ(0)',
                        backfaceVisibility: 'hidden'
                    }}
                >
                    {/* Efeito de glitch para o background - só renderizado quando ativo */}
                    {isBgGlitching && (
                        <>
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: '-5px',
                                    width: 'calc(100% + 10px)',
                                    height: '100%',
                                    backgroundImage: `url(/assets/background/background_parallax_${bgIndex}.jpg)`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    opacity: 0.3,
                                    filter: 'url(#redfilter)',
                                    clipPath: 'polygon(0 15%, 100% 15%, 100% 40%, 0 40%)',
                                    animation: 'bg-glitch-1 0.2s steps(1) infinite',
                                    zIndex: 1,
                                    mixBlendMode: 'lighten',
                                    transform: 'translateZ(0)',
                                    '@keyframes bg-glitch-1': {
                                        '0%, 100%': { transform: 'translateX(-5px) translateZ(0)' },
                                        '50%': { transform: 'translateX(-8px) translateZ(0)' }
                                    }
                                }}
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: '5px',
                                    width: 'calc(100% + 10px)',
                                    height: '100%',
                                    backgroundImage: `url(/assets/background/background_parallax_${bgIndex}.jpg)`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    opacity: 0.3,
                                    filter: 'url(#cyanfilter)',
                                    clipPath: 'polygon(0 65%, 100% 65%, 100% 80%, 0 80%)',
                                    animation: 'bg-glitch-2 0.3s steps(1) infinite',
                                    zIndex: 1,
                                    mixBlendMode: 'lighten',
                                    transform: 'translateZ(0)',
                                    '@keyframes bg-glitch-2': {
                                        '0%, 100%': { transform: 'translateX(5px) translateZ(0)' },
                                        '50%': { transform: 'translateX(8px) translateZ(0)' }
                                    }
                                }}
                            />
                            {/* SVG filters para efeitos de cor */}
                            <Box sx={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
                                <svg>
                                    <defs>
                                        <filter id="redfilter">
                                            <feColorMatrix
                                                type="matrix"
                                                values="1 0 0 0 0
                                                        0 0 0 0 0
                                                        0 0 0 0 0
                                                        0 0 0 1 0"
                                            />
                                        </filter>
                                        <filter id="cyanfilter">
                                            <feColorMatrix
                                                type="matrix"
                                                values="0 0 0 0 0
                                                        0 1 0 0 0
                                                        0 0 1 0 0
                                                        0 0 0 1 0"
                                            />
                                        </filter>
                                    </defs>
                                </svg>
                            </Box>
                        </>
                    )}
                    
                    {/* Ruído estático leve - Simplificado */}
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundImage: 'url(/assets/noise.png)',
                            backgroundSize: 'cover',
                            opacity: isBgGlitching ? 0.15 : 0.03,
                            mixBlendMode: 'overlay',
                            pointerEvents: 'none',
                            zIndex: 1,
                            transform: 'translateZ(0)'
                        }}
                    />
                    
                    {/* Linhas digitais ocasionais - só renderizadas quando ativas */}
                    {isBgGlitching && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255, 255, 255, 0.1) 1px, rgba(255, 255, 255, 0.1) 2px)',
                                backgroundSize: '100% 2px',
                                opacity: 0.2,
                                pointerEvents: 'none',
                                zIndex: 1,
                                transform: 'translateZ(0)'
                            }}
                        />
                    )}

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '95vh',
                            position: 'relative',
                            transform: 'translate3d(0,0,0)',
                            backfaceVisibility: 'hidden',
                            zIndex: 2
                        }}
                    >
                        <Box 
                            sx={{ 
                                userSelect: 'none',
                                position: 'relative',
                                width: '100%',
                                maxWidth: '90%',
                                textAlign: 'center',
                                zIndex: 5
                            }}
                        >
                            <Animate
                                isVisible={true}
                                animationIn="fadeInDown"
                                animationInDelay={500}
                                animationInDuration={1500}
                            >
                                <Box
                                    sx={{ 
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Box 
                                        sx={{ 
                                            position: 'relative',
                                            zIndex: 2,
                                            textAlign: 'center',
                                            width: '100%'
                                        }}
                                    >
                                        <Typography
                                            fontSize={!matches ? '11rem' : '7rem'}
                                            fontFamily="Apocalypse"
                                            sx={{
                                                position: 'relative',
                                                lineHeight: 0.9,
                                                textAlign: 'center',
                                                marginX: 'auto',
                                                color: 'white',
                                                letterSpacing: '4px',
                                                textShadow: '0 5px 15px rgba(0, 0, 0, 0.8)',
                                                animation: 'none'
                                            }}
                                        >
                                            <Box 
                                                component="span" 
                                                ref={glitchRef}
                                                sx={{ 
                                                    display: 'block',
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    '&::before, &::after': {
                                                        content: '"MAGITECH"',
                                                        position: 'absolute',
                                                        top: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        left: 0,
                                                        opacity: isGlitching ? 1 : 0
                                                    },
                                                    '&::before': {
                                                        color: 'rgba(255, 0, 0, 0.8)',
                                                        zIndex: -1,
                                                        clipPath: 'polygon(0 0, 100% 0, 100% 45%, 0 45%)',
                                                        transform: 'translate3d(-10px, 0, 0)',
                                                        animation: isGlitching ? 'glitch-anim-1 0.3s steps(1) infinite' : 'none'
                                                    },
                                                    '&::after': {
                                                        color: 'rgba(0, 255, 255, 0.8)',
                                                        zIndex: -2,
                                                        clipPath: 'polygon(0 55%, 100% 55%, 100% 100%, 0 100%)',
                                                        transform: 'translate3d(10px, 0, 0)',
                                                        animation: isGlitching ? 'glitch-anim-2 0.2s steps(1) infinite' : 'none'
                                                    },
                                                    '@keyframes glitch-anim-1': {
                                                        '0%, 100%': {
                                                            clipPath: 'inset(20% 0 50% 0)',
                                                            transform: 'translate3d(-10px, 0, 0)'
                                                        },
                                                        '20%': {
                                                            clipPath: 'inset(30% 0 40% 0)',
                                                            transform: 'translate3d(10px, 0, 0)'
                                                        },
                                                        '40%': {
                                                            clipPath: 'inset(10% 0 60% 0)',
                                                            transform: 'translate3d(-15px, 0, 0)'
                                                        },
                                                        '60%': {
                                                            clipPath: 'inset(60% 0 10% 0)',
                                                            transform: 'translate3d(15px, 0, 0)'
                                                        },
                                                        '80%': {
                                                            clipPath: 'inset(80% 0 5% 0)',
                                                            transform: 'translate3d(-8px, 0, 0)'
                                                        }
                                                    },
                                                    '@keyframes glitch-anim-2': {
                                                        '0%, 100%': {
                                                            clipPath: 'inset(40% 0 30% 0)',
                                                            transform: 'translate3d(14px, 0, 0)'
                                                        },
                                                        '20%': {
                                                            clipPath: 'inset(60% 0 20% 0)',
                                                            transform: 'translate3d(-14px, 0, 0)'
                                                        },
                                                        '40%': {
                                                            clipPath: 'inset(10% 0 70% 0)',
                                                            transform: 'translate3d(10px, 0, 0)'
                                                        },
                                                        '60%': {
                                                            clipPath: 'inset(30% 0 50% 0)',
                                                            transform: 'translate3d(-10px, 0, 0)'
                                                        },
                                                        '80%': {
                                                            clipPath: 'inset(10% 0 80% 0)',
                                                            transform: 'translate3d(15px, 0, 0)'
                                                        }
                                                    }
                                                }}
                                            >
                                                MAGITECH
                                            </Box>
                                            
                                            <Box 
                                                component="span" 
                                                sx={{ 
                                                    display: 'none' 
                                                }}
                                            >
                                                APOCALYPSE
                                            </Box>
                                        </Typography>
                                    </Box>
                                </Box>
                                
                                <Box
                                    sx={{
                                        position: 'relative',
                                        zIndex: 4,
                                        mt: 8,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        px: 2,
                                        maxWidth: '800px',
                                        marginX: 'auto'
                                    }}
                                >
                                    <Typography
                                        color="#eee"
                                        fontSize="1.5rem"
                                        fontFamily="Inter"
                                        sx={{ 
                                            textShadow: '0 2px 10px rgba(0, 0, 0, 0.9)',
                                            textAlign: 'center',
                                            position: 'relative',
                                            animation: 'fadeInUp 1s ease-out',
                                            '@keyframes fadeInUp': {
                                                from: {
                                                    opacity: 0,
                                                    transform: 'translateY(20px)'
                                                },
                                                to: {
                                                    opacity: 1,
                                                    transform: 'translateY(0)'
                                                }
                                            }
                                        }}
                                    >
                                        Um RPG de mesa mágico e futurista que prioriza a diversão, estética, automação e
                                        criatividade! Se junte a esta incrível jornada!
                                    </Typography>
                                    
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        size="large"
                                        onClick={() => {
                                            router.push('/api/auth/signin')
                                        }}
                                        sx={{ 
                                            mt: 4,
                                            zIndex: 999,
                                            padding: '0.8rem 2.5rem',
                                            borderRadius: '30px',
                                            fontSize: '1.1rem',
                                            fontWeight: 'bold',
                                            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-3px)',
                                                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)'
                                            },
                                            '&::after': {
                                                content: '""',
                                                position: 'absolute',
                                                top: 0,
                                                left: '-100%',
                                                width: '100%',
                                                height: '100%',
                                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                                transition: 'all 0.5s'
                                            },
                                            '&:hover::after': {
                                                left: '100%'
                                            },
                                            animation: 'pulse-button 2s infinite',
                                            '@keyframes pulse-button': {
                                                '0%': {
                                                    boxShadow: '0 0 0 0 rgba(156, 39, 176, 0.7)'
                                                },
                                                '70%': {
                                                    boxShadow: '0 0 0 10px rgba(156, 39, 176, 0)'
                                                },
                                                '100%': {
                                                    boxShadow: '0 0 0 0 rgba(156, 39, 176, 0)'
                                                }
                                            }
                                        }}
                                    >
                                        Comece Já!
                                    </Button>
                                </Box>
                            </Animate>
                        </Box>
                        
                        {/* Partículas de efeito */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                zIndex: 1,
                                overflow: 'hidden',
                                pointerEvents: 'none'
                            }}
                        >
                            {Array.from({ length: 20 }).map((_, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        position: 'absolute',
                                        width: Math.random() * 6 + 2 + 'px',
                                        height: Math.random() * 6 + 2 + 'px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                        borderRadius: '50%',
                                        top: Math.random() * 100 + '%',
                                        left: Math.random() * 100 + '%',
                                        boxShadow: '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.5)',
                                        animation: `float-particle ${Math.random() * 10 + 10}s linear infinite`,
                                        opacity: Math.random() * 0.5 + 0.3,
                                        '@keyframes float-particle': {
                                            '0%': {
                                                transform: 'translateY(0) rotate(0deg)',
                                                opacity: 0
                                            },
                                            '10%': {
                                                opacity: Math.random() * 0.5 + 0.3
                                            },
                                            '100%': {
                                                transform: `translateY(-${Math.random() * 500 + 200}px) rotate(${Math.random() * 360}deg)`,
                                                opacity: 0
                                            }
                                        }
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                </Parallax>
            </Animate>
            <Box position="relative">
                <BgTopPatternLayer />
                <Box
                    position="absolute"
                    bottom="100%"
                    height="100px"
                    width="100%"
                    left={0}
                    sx={{ background: 'linear-gradient(to top, #0d0e1b, transparent)' }}
                />
                <Box height="8rem" />
                <Container sx={{ p: 5, gap: 3 }}>
                    <Box id="sobre" mb={!matches ? 30 : 20}>
                        <Typography variant="h3" fontFamily="WBZ" textAlign="center" p={5} width="100%">
                            Sobre
                        </Typography>
                        <AnimateOnScroll animateOnce animation={!matches ? 'fadeInDown' : 'fadeInLeft'}>
                            <Box
                                display="flex"
                                justifyContent="center"
                                flexDirection={!matches ? 'row' : 'column'}
                                alignItems="center"
                                width="100%"
                                gap={4}
                                p={3}
                            >
                                <Card
                                    sx={{
                                        height: '25rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        bgcolor: 'background.paper',
                                        width: !matches ? '33%' : '100%',
                                        borderRadius: 4,
                                        p: 3,
                                        gap: 2
                                    }}
                                    elevation={12}
                                >
                                    <Typography variant="h5" fontWeight={900} textAlign="center">
                                        O que é?
                                    </Typography>
                                    <Typography>
                                        Magitech RPG é um sistema de RPG de mesa feito por Vitor Hugo Rodrigues dos
                                        Santos inspirado em D&D, Tormenta, Order & Chaos, Ordem Paranormal, entre outros
                                        sistemas de RPG. Para quem não sabe, RPG (abreviação de Role Playing Game), é um
                                        jogo de interpretação de papéis, onde aqueles que participam são divididos entre
                                        o Mestre e os Jogadores.
                                    </Typography>
                                </Card>
                                <Card
                                    sx={{
                                        height: '25rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        bgcolor: 'background.paper',
                                        width: !matches ? '33%' : '100%',
                                        borderRadius: 4,
                                        p: 3,
                                        gap: 2
                                    }}
                                    elevation={12}
                                >
                                    <Typography variant="h5" fontWeight={900} textAlign="center">
                                        Porquê?
                                    </Typography>
                                    <Typography>
                                        Para quem joga RPG de mesa, sabe o quão trabalho e burocrático é jogar uma
                                        sessão, principalmente se você for o Mestre. É necessário criar e anotar fichas,
                                        programar sessoes, anotar detalhes em combate ou no mapa e muito mais. Tendo em
                                        vista este problema, o Magitech foi desenvolvido para auxiliar não só Mestre,
                                        mas também para os jogadores no que for preciso.
                                    </Typography>
                                </Card>
                                <Card
                                    sx={{
                                        height: '25rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        bgcolor: 'background.paper',
                                        width: !matches ? '33%' : '100%',
                                        borderRadius: 4,
                                        p: 3,
                                        gap: 2
                                    }}
                                    elevation={12}
                                >
                                    <Typography variant="h5" fontWeight={900} textAlign="center">
                                        Como funciona?
                                    </Typography>
                                    <Typography>
                                        Este site é uma aplicação web para auxílio na jogatina de Magitech RPG.
                                        Basicamente, é um sistema que integra fichas e sessões da mesa de RPG e
                                        automatiza o que antes precisava ser feito no papel. As regras do RPG estão
                                        descritas no Guia que está disponível para download logo abaixo.
                                    </Typography>
                                </Card>
                            </Box>
                        </AnimateOnScroll>
                    </Box>

                    <Box id="quem-somos" mb={!matches ? 30 : 20}>
                        <Box>
                            <Box width="100%">
                                <Typography variant="h3" fontFamily="WBZ" textAlign="center" p={5} width="100%">
                                    Quem somos
                                </Typography>
                            </Box>
                        </Box>
                        <AnimateOnScroll animateOnce animation="fadeInDown">
                            <Box
                                display="flex"
                                flexDirection="column"
                                justifyContent="center"
                                alignItems="center"
                                width="100%"
                            >
                                <Avatar sx={{ width: 200, height: 200 }}>
                                    <Image
                                        src={profilePhoto}
                                        alt="Profile Photo"
                                        width={200}
                                        style={{
                                            backgroundSize: 'cover',
                                            backgroundRepeat: 'no-repeat'
                                        }}
                                    />
                                </Avatar>
                                <Typography
                                    color="secondary"
                                    fontWeight={900}
                                    fontSize="1.25rem"
                                    mt={3}
                                    textAlign="center"
                                >
                                    VITOR HUGO RODRIGUES DOS SANTOS
                                </Typography>
                                <Typography color="secondary" mt={3} textAlign="center" width="25%">
                                    Desenvolvedor Web & Técnico em Desenvolvimento de Sistemas
                                </Typography>
                                <Typography mt={3} textAlign="center" width="50%">
                                    Apenas eu mesmo, Vitor santos. Jovem sonhador que está ingressando no mercado de
                                    trabalho de TI fazendo novos projetos como este.
                                </Typography>
                            </Box>
                        </AnimateOnScroll>
                    </Box>

                    <Box id="guia" mb={!matches ? 30 : 20}>
                        <Box p={5} width="100%">
                            <Typography variant="h3" fontFamily="WBZ" textAlign="center">
                                Obtenha o Guia de Regras
                            </Typography>
                        </Box>
                        <AnimateOnScroll animateOnce animation="fadeInLeft">
                            <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexDirection={!matches ? 'row' : 'column'}
                                width="100%"
                                border={`1px solid ${theme.palette.primary.light}`}
                                borderRadius={2}
                                p={!matches ? 10 : 3}
                                gap={5}
                            >
                                <Box
                                    width={!matches ? '50%' : '100%'}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Image
                                        src={magitechCapa}
                                        alt="Magitech Capa"
                                        onClick={() => {
                                            window.open(BLOB_API.GUIA)
                                        }}
                                        onMouseOver={e => {
                                            e.currentTarget.style.transform = 'scale(1.1)'
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = 'scale(1)'
                                        }}
                                        style={{
                                            height: '100%',
                                            width: !matches ? '50%' : '100%',
                                            boxShadow: theme.shadows[10],
                                            cursor: 'pointer',
                                            transition: 'ease-in-out .3s'
                                        }}
                                    />
                                </Box>
                                <Box display="flex" gap={1} height="100%" width={!matches ? '50%' : '100%'}>
                                    <Typography position="relative" bottom="1.5rem" fontSize="4rem" fontFamily="WBZ">
                                        E
                                    </Typography>
                                    <Box display="flex" gap={5} flexDirection="column" justifyContent="space-between">
                                        <Typography>{landingPageSynopse}</Typography>
                                        <Box>
                                            <Button
                                                sx={{ width: '33%' }}
                                                variant="contained"
                                                color={'terciary' as any}
                                                onClick={() => {
                                                    window.open(BLOB_API.GUIA)
                                                }}
                                            >
                                                Baixe agora
                                            </Button>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </AnimateOnScroll>
                    </Box>
                </Container>

                <Box mb={!matches ? 30 : 0} position="relative">
                    <BgBottomPatternLayer sx={{ top: 0, width: '100vw' }} />
                    <Parallax
                        style={{
                            overflow: 'hidden',
                            userSelect: 'none',
                            height: !matches ? '35rem' : '50rem',
                            position: 'relative',
                            width: '100vw'
                        }}
                        bgImage="/assets/background/background_parallax_3.jpg"
                        strength={!matches ? 300 : 0}
                        blur={{ min: -6, max: 6 }}
                    >
                        <Box
                            sx={{
                                userSelect: 'none',
                                display: 'flex',
                                width: '100%',
                                height: '100%',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Typography
                                fontFamily="Apocalypse"
                                variant={!matches ? 'h1' : 'h2'}
                                position="relative"
                                top={!matches ? '15rem' : '9rem'}
                                textAlign="center"
                                sx={{ textShadow: '0px 0px 10px #000000' }}
                            >
                                Trilhe o caminho da magia
                            </Typography>
                        </Box>
                    </Parallax>
                    <BgTopPatternLayer sx={{ top: !matches ? '31rem' : '14rem', width: '100vw' }} />
                </Box>

                <Container sx={{ p: 5, gap: 3 }}>
                    <Box mb={!matches ? 30 : 20}>
                        <Box p={5} width="100%">
                            <Typography variant="h3" fontFamily="WBZ" textAlign="center">
                                Obtenha o Grimorio
                            </Typography>
                        </Box>
                        <AnimateOnScroll animateOnce animation="fadeInRight">
                            <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexDirection={!matches ? 'row' : 'column-reverse'}
                                width="100%"
                                border={`1px solid ${theme.palette.primary.light}`}
                                borderRadius={2}
                                p={!matches ? 10 : 3}
                                gap={5}
                            >
                                <Box display="flex" gap={1} height="100%" width={!matches ? '50%' : '100%'}>
                                    <Typography position="relative" bottom="1.5rem" fontSize="4rem" fontFamily="WBZ">
                                        M
                                    </Typography>
                                    <Box display="flex" gap={5} flexDirection="column" justifyContent="space-between">
                                        <Typography>{landingPageGrimoire}</Typography>
                                        <Box>
                                            <Button
                                                sx={{ width: '33%' }}
                                                variant="contained"
                                                color={'terciary' as any}
                                                onClick={() => {
                                                    window.open(BLOB_API.GRIMORIO)
                                                }}
                                            >
                                                Baixe agora
                                            </Button>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box
                                    width={!matches ? '50%' : '100%'}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Image
                                        src={magitechCapaGrimorio}
                                        alt="Magitech Capa Grimório"
                                        onClick={() => {
                                            window.open(BLOB_API.GRIMORIO)
                                        }}
                                        onMouseOver={e => {
                                            e.currentTarget.style.transform = 'scale(1.1)'
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = 'scale(1)'
                                        }}
                                        style={{
                                            height: '100%',
                                            width: !matches ? '50%' : '100%',
                                            boxShadow: theme.shadows[10],
                                            cursor: 'pointer',
                                            transition: 'ease-in-out .3s'
                                        }}
                                    />
                                </Box>
                            </Box>
                        </AnimateOnScroll>
                    </Box>
                </Container>

                <Box mb={!matches ? 30 : 20} position="relative">
                    <BgBottomPatternLayer sx={{ top: 0 }} />
                    <Box
                        width="100vw"
                        display="flex"
                        flexDirection="column"
                        justifyContent="center"
                        bgcolor="background.paper4"
                    >
                        <Box p={10} width="100%">
                            <Typography variant="h3" fontFamily="WBZ" textAlign="center">
                                Sinopse
                            </Typography>
                        </Box>
                        <AnimateOnScroll animateOnce animation="fadeInUp">
                            <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                width="100%"
                                p={!matches ? 10 : 3}
                                gap={5}
                            >
                                <Box display="flex" gap={1}>
                                    <Typography position="relative" bottom="1.5rem" fontSize="4rem" fontFamily="WBZ">
                                        M
                                    </Typography>
                                    <Typography whiteSpace="pre-wrap">{intro}</Typography>
                                </Box>
                            </Box>
                        </AnimateOnScroll>
                    </Box>
                    <BgTopPatternLayer sx={{ bottom: 0, top: !matches ? '93vh' : '132rem' }} />
                </Box>
                <Footer />
            </Box>
            {showButton && (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleInstallClick}
                    sx={{
                        position: 'fixed',
                        bottom: 20,
                        right: 20,
                        borderRadius: '50px',
                        padding: '10px 20px',
                        boxShadow: 3,
                        zIndex: 999
                    }}
                >
                    Instalar App
                </Button>
            )}
        </>
    )
}

function BgTopPatternLayer({ sx }: { sx?: SxProps }) {
    return (
        <Box
            sx={{
                content: '""',
                position: 'absolute',
                left: 0,
                top: -73,
                width: '100%',
                height: 74,
                background: 'url(/assets/background/pattern-1.png) center bottom repeat-x',
                zIndex: 2,
                ...sx
            }}
        />
    )
}

function BgBottomPatternLayer({ sx }: { sx?: SxProps }) {
    return (
        <Box
            sx={{
                content: '""',
                position: 'absolute',
                left: 0,
                bottom: -73,
                width: '100%',
                height: 74,
                background: 'url(/assets/background/pattern-2.png) center top repeat-x',
                zIndex: 2,
                ...sx
            }}
        />
    )
}
