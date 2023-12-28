'use client';

import { Footer, LandingPageHeader } from '@layout';
import { Avatar, Box, Button, Card, Container, Typography } from '@mui/material';
import { type ReactElement } from 'react';
import { Animate, AnimateOnScroll, Parallax } from '@components/misc';
import { intro, about, landingPageGrimoire, landingPageSynopse, BLOB_API_URL } from '@constants';
import { landingPageBg as bg } from '@constants';
import { useTheme } from '@mui/material';
import logo from '@public/magitech_logo.png'
import magitechCapa from '@public/magitech_capa.png'
import magitechCapaGrimorio from '@public/Magitech_capa_grimorio.png'
import profilePhoto from '@public/profile_photo.jpg'
import Image from 'next/image';

export default function LandingPage(): ReactElement {
    const theme = useTheme()

    return (
        <>
            <LandingPageHeader />
            <Animate style={{ userSelect: 'none' }} isVisible animationIn='fadeIn'>
                <Parallax bgImage={bg} strength={300} blur={{ min: -3, max: 3 }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        height: '90vh'
                    }}>
                        <Box  
                            p='5rem'
                            sx={{ userSelect: 'none' }}
                        >
                            <Animate isVisible={true} animationIn='fadeInDown' animationInDelay={500} animationInDuration={1500}>
                                <Box 
                                    display='flex'
                                    alignItems='center'
                                    gap={5}
                                >
                                    <Image 
                                        src={logo} 
                                        alt="Magitech Logo"
                                        height={150}
                                    /> 
                                    <Typography 
                                        fontSize='10rem' 
                                        fontFamily='WBZ'
                                    >
                                        Magitech II
                                    </Typography>
                                </Box>
                                <Typography 
                                    width='65%'
                                    color='#eee' 
                                    fontSize='1.5rem' 
                                    fontFamily='Inter'
                                >
                                    Um RPG de mesa mágico e futurista que prioriza a diversão, estética, automação e criatividade! Se junte a esta incrível jornada!
                                </Typography>
                                <Button 
                                    variant="contained"
                                    color="secondary"
                                    sx={{ mt: '2rem' }}
                                    onClick={() => { location.href = '/api/auth/signin' }}
                                >
                                    Comece Já!
                                </Button>
                            </Animate>
                        </Box>
                    </Box>
                </Parallax>
            </Animate>
            <Box position='relative'>
                <Box
                    position='absolute'
                    bottom='100%'
                    height='300px'
                    width='100%'
                    left={0}
                    sx={{ background: 'linear-gradient(to top, #101621, transparent)' }}
                />
                <Box height='8rem' />
                <Container sx={{ p: 5, gap: 3 }}>
                    <Box mb={30}>
                        <Typography variant='h3' fontFamily='WBZ' textAlign='center' p={5} width='100%'>
                            Sobre
                        </Typography>
                        <AnimateOnScroll animateOnce animation='fadeInDown'>
                            <Box 
                                display='flex'
                                justifyContent='center'
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
                                        bgcolor: 'background.paper2',
                                        width: '33%',
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
                                        bgcolor: 'background.paper2',
                                        width: '33%',
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
                                        bgcolor: 'background.paper2',
                                        width: '33%',
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

                    <Box mb={30}>
                        <Typography variant='h3' fontFamily='WBZ' textAlign='center' p={5} width='100%'>
                            Quem somos
                        </Typography>
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
                    
                    <Box mb={30}>
                        <Box p={5} width='100%'>  
                            <Typography variant='h3' fontFamily='WBZ' textAlign='center'>Obtenha o Guia de Regras</Typography>
                        </Box>
                        <AnimateOnScroll animateOnce animation='fadeInLeft'>
                            <Box
                                display='flex'
                                alignItems='center'
                                justifyContent='center'
                                width='100%' 
                                border={`1px solid ${theme.palette.primary.light}`}
                                borderRadius={2}
                                p={10}
                                gap={5}
                            >
                                <Box
                                    width='50%'
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Image
                                        src={magitechCapa}
                                        alt="Magitech Capa"
                                        onClick={() => {
                                            window.open(BLOB_API_URL + 'mlr.pdf')
                                        }}
                                        onMouseOver={e => {
                                            e.currentTarget.style.transform = 'scale(1.1)'
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = 'scale(1)'
                                        }}
                                        style={{
                                            height: '100%',
                                            width: '50%',
                                            boxShadow: theme.shadows[10],
                                            cursor: 'pointer',
                                            transition: 'ease-in-out .3s'
                                        }}
                                        
                                    />
                                </Box>
                                <Box display='flex' gap={1} height='100%' width='50%'>
                                    <Typography position='relative' bottom='1.5rem' fontSize='4rem' fontFamily='WBZ'>E</Typography>
                                    <Box display='flex' gap={5} flexDirection='column' justifyContent='space-between'>
                                        <Typography>{landingPageSynopse}</Typography>
                                        <Box>
                                            <Button 
                                                sx={{ width: '33%' }} 
                                                variant='contained' 
                                                color='terciary'
                                                onClick={() => { window.open(BLOB_API_URL + 'mlr.pdf') }}
                                            >
                                                Baixe agora
                                            </Button>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </AnimateOnScroll>
                    </Box>

                    <Box mb={30}>
                        <Box p={5} width='100%'>  
                            <Typography variant='h3' fontFamily='WBZ' textAlign='center'>Obtenha o Grimorio</Typography>
                        </Box>
                        <AnimateOnScroll animateOnce animation='fadeInRight'>
                            
                            <Box
                                display='flex'
                                alignItems='center'
                                justifyContent='center'
                                width='100%' 
                                border={`1px solid ${theme.palette.primary.light}`}
                                borderRadius={2}
                                p={10}
                                gap={5}
                            >
                                <Box display='flex' gap={1} height='100%' width='50%'>
                                    <Typography position='relative' bottom='1.5rem' fontSize='4rem' fontFamily='WBZ'>M</Typography>
                                    <Box display='flex' gap={5} flexDirection='column' justifyContent='space-between'>
                                        <Typography>{landingPageGrimoire}</Typography>
                                        <Box>
                                            <Button 
                                                sx={{ width: '33%' }} 
                                                variant='contained' 
                                                color='terciary'
                                                onClick={() => { window.open(BLOB_API_URL + 'mlr.pdf') }}
                                            >
                                                Baixe agora
                                            </Button>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box
                                    width='50%'
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Image
                                        src={magitechCapaGrimorio}
                                        alt="Magitech Capa Grimório"
                                        onClick={() => {
                                            window.open(BLOB_API_URL + 'mlr.pdf')

                                        }}
                                        onMouseOver={e => {
                                            e.currentTarget.style.transform = 'scale(1.1)'
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.transform = 'scale(1)'
                                        }}
                                        style={{
                                            height: '100%',
                                            width: '50%',
                                            boxShadow: theme.shadows[10],
                                            cursor: 'pointer',
                                            transition: 'ease-in-out .3s'
                                        }}
                                        
                                    />
                                </Box>
                            </Box>
                        </AnimateOnScroll>
                    </Box>

                    <Box mb={30}>
                        <Box p={5} width='100%'>  
                            <Typography variant='h3' fontFamily='WBZ' textAlign='center'>Sinopse</Typography>
                        </Box>
                        <AnimateOnScroll animateOnce animation='fadeInUp'>
                            
                            <Box
                                display='flex'
                                alignItems='center'
                                justifyContent='center'
                                width='100%' 
                                border={`1px solid ${theme.palette.primary.light}`}
                                borderRadius={2}
                                p={10}
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
                </Container>
                <Footer />
            </Box>
        </>
    )
}
