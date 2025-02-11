/* eslint-disable @typescript-eslint/no-use-before-define */
'use client';

import { Footer, LandingPageHeader } from '@layout';
import { Avatar, Box, Button, Card, Container, type SxProps, Typography, useMediaQuery } from '@mui/material';
import { useState, type ReactElement, useEffect } from 'react';
import { Animate, AnimateOnScroll, Parallax } from '@components/misc';
import { intro, landingPageGrimoire, landingPageSynopse, BLOB_API } from '@constants';
import { useTheme } from '@mui/material';
import { useRouter } from 'next/navigation';
import logo from '@public/assets/magitech_logo.png'
import magitechCapa from '@public/assets/magitech_capa.png'
import magitechCapaGrimorio from '@public/assets/magitech_capa_grimorio.png'
import profilePhoto from '@public/assets/profile_photo.jpg'
import Image from 'next/image';

export default function LandingPage(): ReactElement | null {
    const theme = useTheme()
    const matches = useMediaQuery(theme.breakpoints.down('md'))
    const [ bgIndex ] = useState(1)

    const router = useRouter()

    const [ isClient, setIsClient ] = useState(false)
    
    useEffect(() => {
        setIsClient(true)
    }, [])

    if (!isClient) {
        return null 
    }

    return (
        <>
            <LandingPageHeader />
            <Animate style={{ userSelect: 'none' }} isVisible animationIn='fadeIn'>
                <Parallax
                    style={{ overflow: 'hidden', userSelect: 'none' }}
                    bgImage={`/assets/background/background_parallax_${bgIndex}.jpg`}
                    strength={300}
                    blur={{ min: -6, max: 6 }}
                >
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: !matches ? '100%' : '50%',
                        height: '95vh'
                    }}>
                        <Box
                            display='flex'
                            p='5rem'
                            sx={{ userSelect: 'none' }}
                        >
                            <Animate isVisible={true} animationIn='fadeInDown' animationInDelay={500} animationInDuration={1500}>
                                <Box
                                    display='flex'
                                    flexDirection={!matches ? 'row' : 'column'}
                                    alignItems='center'
                                    ml={-10}
                                >
                                    {!matches && (
                                        <Image
                                            src={logo}
                                            alt="Magitech Logo"
                                            height={350}
                                            style={{ filter: 'drop-shadow( 3px 3px 2px rgba(0, 0, 0, .7))' }}
                                        />
                                    )}
                                    <Typography
                                        fontSize={!matches ? '10rem' : '6.5rem'}
                                        fontFamily='Apocalypse'
                                        textAlign={!matches ? 'initial' : 'center'}
                                        ml={-5}
                                    >
                                        <Box sx={{ mb: -10, textShadow: '3px 3px 2px rgba(0, 0, 0, .7)' }}>
                                            Magitech:
                                        </Box>
                                        <Box sx={{ mt: !matches ? -10 : 5, ml: 10, textShadow: '3px 3px 2px rgba(0, 0, 0, .7)' }}>
                                            Apocalypse
                                        </Box>
                                    </Typography>
                                </Box>
                                <Typography
                                    width={!matches ? '65%' : '100%'}
                                    mt={!matches ? 0 : 5}
                                    color='#eee'
                                    fontSize='1.5rem'
                                    fontFamily='Inter'
                                >
                                    Um RPG de mesa mágico e futurista que prioriza a diversão, estética, automação e criatividade! Se junte a esta incrível jornada!
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    sx={{ mt: '2rem', zIndex: 999 }}
                                    onClick={() => { router.push('/api/auth/signin') }}
                                >
                                    Comece Já!
                                </Button>
                            </Animate>
                        </Box>
                    </Box>
                </Parallax>
            </Animate>
            <Box position='relative'>
                <BgTopPatternLayer />
                <Box
                    position='absolute'
                    bottom='100%'
                    height='100px'
                    width='100%'
                    left={0}
                    sx={{ background: 'linear-gradient(to top, #0d0e1b, transparent)' }}
                />
                <Box height='8rem' />
                <Container sx={{ p: 5, gap: 3 }}>
                    <Box mb={!matches ? 30 : 20}>
                        <Typography variant='h3' fontFamily='WBZ' textAlign='center' p={5} width='100%'>
                            Sobre
                        </Typography>
                        <AnimateOnScroll animateOnce animation={!matches ? 'fadeInDown' : 'fadeInLeft'}>
                            <Box
                                display='flex'
                                justifyContent='center'
                                flexDirection={!matches ? 'row' : 'column'}
                                alignItems='center'
                                width='100%'
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
                                    <Typography
                                        variant='h5'
                                        fontWeight={900}
                                        textAlign='center'>O que é?</Typography>
                                    <Typography>
                                        Magitech RPG é um sistema de RPG de mesa feito por Vitor Hugo Rodrigues dos Santos inspirado em D&D, Tormenta, Order & Chaos,
                                        Ordem Paranormal, entre outros sistemas de RPG. Para quem não sabe, RPG (abreviação de Role Playing Game),
                                        é um jogo de interpretação de papéis, onde aqueles que participam são divididos entre o Mestre e os Jogadores.</Typography>
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
                                    <Typography
                                        variant='h5'
                                        fontWeight={900}
                                        textAlign='center'>Porquê?</Typography>
                                    <Typography>
                                        Para quem joga RPG de mesa, sabe o quão trabalho e burocrático é jogar uma sessão, principalmente se você for o Mestre.
                                        É necessário criar e anotar fichas, programar sessoes, anotar detalhes em combate ou no mapa e muito mais.
                                        Tendo em vista este problema, o Magitech foi desenvolvido para auxiliar não só Mestre, mas também para os jogadores no que for preciso.
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
                                    <Typography
                                        variant='h5'
                                        fontWeight={900}
                                        textAlign='center'>Como funciona?</Typography>
                                    <Typography>
                                        Este site é uma aplicação web para auxílio na jogatina de Magitech RPG.
                                        Basicamente, é um sistema que integra fichas e sessões da mesa de RPG e automatiza o que antes precisava ser feito no papel.
                                        As regras do RPG estão descritas no Guia que está disponível para download logo abaixo.
                                    </Typography>
                                </Card>
                            </Box>
                        </AnimateOnScroll>
                    </Box>

                    <Box mb={!matches ? 30 : 20}>
                        <Box>
                            <Box width='100%'>
                                <Typography variant='h3' fontFamily='WBZ' textAlign='center' p={5} width='100%'>
                                    Quem somos
                                </Typography>
                            </Box>
                        </Box>
                        <AnimateOnScroll animateOnce animation='fadeInDown'>
                            <Box
                                display='flex'
                                flexDirection='column'
                                justifyContent='center'
                                alignItems='center'
                                width='100%'
                            >
                                <Avatar sx={{ width: 200, height: 200 }}>
                                    <Image
                                        src={profilePhoto}
                                        alt='Profile Photo'
                                        width={200}
                                        style={{
                                            backgroundSize: 'cover',
                                            backgroundRepeat: 'no-repeat'
                                        }}
                                    />
                                </Avatar>
                                <Typography
                                    color='secondary'
                                    fontWeight={900}
                                    fontSize='1.25rem'
                                    mt={3}
                                    textAlign='center'
                                >VITOR HUGO RODRIGUES DOS SANTOS</Typography>
                                <Typography
                                    color='secondary'
                                    mt={3}
                                    textAlign='center'
                                    width='25%'
                                >Desenvolvedor Web & Técnico em Desenvolvimento de Sistemas</Typography>
                                <Typography
                                    mt={3}
                                    textAlign='center'
                                    width='50%'
                                >Apenas eu mesmo, Vitor santos. Jovem sonhador que está ingressando no mercado de trabalho de TI fazendo novos projetos como este.</Typography>
                            </Box>
                        </AnimateOnScroll>
                    </Box>

                    <Box mb={!matches ? 30 : 20}>
                        <Box p={5} width='100%'>
                            <Typography variant='h3' fontFamily='WBZ' textAlign='center'>Obtenha o Guia de Regras</Typography>
                        </Box>
                        <AnimateOnScroll animateOnce animation='fadeInLeft'>
                            <Box
                                display='flex'
                                alignItems='center'
                                justifyContent='center'
                                flexDirection={!matches ? 'row' : 'column'}
                                width='100%'
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
                                <Box display='flex' gap={1} height='100%' width={!matches ? '50%' : '100%'}>
                                    <Typography position='relative' bottom='1.5rem' fontSize='4rem' fontFamily='WBZ'>E</Typography>
                                    <Box display='flex' gap={5} flexDirection='column' justifyContent='space-between'>
                                        <Typography>{landingPageSynopse}</Typography>
                                        <Box>
                                            <Button
                                                sx={{ width: '33%' }}
                                                variant='contained'
                                                color={'terciary' as any}
                                                onClick={() => { window.open(BLOB_API.GUIA) }}
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

                <Box mb={!matches ? 30 : 0} position='relative'>
                    <BgBottomPatternLayer sx={{ top: 0, width: '100vw' }} />
                    <Parallax
                        style={{ overflow: 'hidden', userSelect: 'none', height: !matches ? '35rem' : '50rem', position: 'relative', width: '100vw' }}
                        bgImage='/assets/background/background_parallax_3.jpg'
                        strength={!matches ? 300 : 0}
                        blur={{ min: -6, max: 6 }}
                    >
                        <Box sx={{
                            userSelect: 'none',
                            display: 'flex',
                            width: '100%',
                            height: '100%',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Typography
                                fontFamily='Apocalypse'
                                variant={!matches ? 'h1' : 'h2'}
                                position='relative'
                                top={!matches ? '15rem' : '9rem'}
                                textAlign='center'
                                sx={{ textShadow: '0px 0px 10px #000000' }}
                            >
                                O mundo precisa de um herói
                            </Typography>
                        </Box>
                    </Parallax>
                    <BgTopPatternLayer sx={{ top: !matches ? '31rem' : '14rem', width: '100vw' }} />
                </Box>

                <Container sx={{ p: 5, gap: 3 }}>
                    <Box mb={!matches ? 30 : 20}>
                        <Box p={5} width='100%'>
                            <Typography variant='h3' fontFamily='WBZ' textAlign='center'>Obtenha o Grimorio</Typography>
                        </Box>
                        <AnimateOnScroll animateOnce animation='fadeInRight'>

                            <Box
                                display='flex'
                                alignItems='center'
                                justifyContent='center'
                                flexDirection={!matches ? 'row' : 'column-reverse'}
                                width='100%'
                                border={`1px solid ${theme.palette.primary.light}`}
                                borderRadius={2}
                                p={!matches ? 10 : 3}
                                gap={5}
                            >
                                <Box
                                    display='flex' gap={1}
                                    height='100%'
                                    width={!matches ? '50%' : '100%'}
                                >
                                    <Typography position='relative' bottom='1.5rem' fontSize='4rem' fontFamily='WBZ'>M</Typography>
                                    <Box display='flex' gap={5} flexDirection='column' justifyContent='space-between'>
                                        <Typography>{landingPageGrimoire}</Typography>
                                        <Box>
                                            <Button
                                                sx={{ width: '33%' }}
                                                variant='contained'
                                                color={'terciary' as any}
                                                onClick={() => { window.open(BLOB_API.GRIMORIO) }}
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
                                        onClick={() => { window.open(BLOB_API.GRIMORIO) }}
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

                <Box mb={!matches ? 30 : 20} position='relative'>
                    <BgBottomPatternLayer sx={{ top: 0 }} />
                    <Box width='100vw' display='flex' flexDirection='column' justifyContent='center' bgcolor='background.paper4'>
                        <Box p={10} width='100%'>
                            <Typography variant='h3' fontFamily='WBZ' textAlign='center'>Sinopse</Typography>
                        </Box>
                        <AnimateOnScroll animateOnce animation='fadeInUp'>
                            <Box
                                display='flex'
                                alignItems='center'
                                justifyContent='center'
                                width='100%'
                                p={!matches ? 10 : 3}
                                gap={5}
                            >
                                <Box display='flex' gap={1}>
                                    <Typography position='relative' bottom='1.5rem' fontSize='4rem' fontFamily='WBZ'>M</Typography>
                                    <Typography whiteSpace='pre-wrap'>
                                        {intro}
                                    </Typography>
                                </Box>
                            </Box>
                        </AnimateOnScroll>
                    </Box>
                    <BgTopPatternLayer sx={{ bottom: 0, top: !matches ? '93vh' : '132rem' }} />
                </Box>
                <Footer />
            </Box>
        </>
    )
}

function BgTopPatternLayer({ sx }: { sx?: SxProps }) {
    return (
        <Box sx={{
            content: '""',
            position: 'absolute',
            left: 0,
            top: -73,
            width: '100%',
            height: 74,
            background: 'url(/assets/background/pattern-1.png) center bottom repeat-x',
            zIndex: 2,
            ...sx
        }} />
    )
}

function BgBottomPatternLayer({ sx }: { sx?: SxProps }) {
    return (
        <Box sx={{
            content: '""',
            position: 'absolute',
            left: 0,
            bottom: -73,
            width: '100%',
            height: 74,
            background: 'url(/assets/background/pattern-2.png) center top repeat-x',
            zIndex: 2,
            ...sx
        }} />
    )
}