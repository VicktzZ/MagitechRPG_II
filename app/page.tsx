'use client';

import { LandingPageHeader } from '@layout';
import { Box, Button, Container, Typography } from '@mui/material';
import { type ReactElement } from 'react';
import logo from '@public/magitech_logo.png'
import Image from 'next/image';
import { Animate, AnimateOnScroll, Parallax } from '@components/misc';
import { intro, about } from '@constants';
import { landingPageBg as bg } from '@constants';

export default function LandingPage(): ReactElement {
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
                    <AnimateOnScroll animateOnce animation='fadeInLeft'>
                        <Box>
                            <Box>
                                <Typography
                                    sx={{ p: 5 }}
                                    fontSize='3rem'
                                    fontFamily='WBZ'
                                >
                                    Intro
                                </Typography>
                            </Box>
                            <Box display='flex' flexDirection='column' gap={5}>
                                <Typography fontFamily='Inter'>{intro}</Typography>
                            </Box>
                        </Box>
                    </AnimateOnScroll>
                    <AnimateOnScroll animateOnce animation='fadeInLeft'>
                        <Box>
                            <Box>
                                <Typography
                                    sx={{ p: 5 }}
                                    fontSize='3rem'
                                    fontFamily='WBZ'
                                >
                                    Sobre
                                </Typography>
                            </Box>
                            <Box display='flex' flexDirection='column' gap={5}>
                                <Typography fontFamily='Inter'>{about}</Typography>
                            </Box>
                        </Box>
                    </AnimateOnScroll>
                </Container>
            </Box>
        </>
    )
}
