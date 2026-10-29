'use client'
// TODO: !IMPORTANTE - Ampliar segurança da API (autenticação, cors)
// TODO: !IMPORTANTE - Colocar autenticação em Firebase

import { BookCover, ElementStrip, HeroShowcase, SectionHeader } from '@components/landing'
import { PricingCard } from '@components/subscription'
import { BLOB_API, intro, landingPageGrimoire, landingPageSynopse } from '@constants'
import { SubscriptionPlan } from '@enums/subscriptionEnum'
import { Footer, LandingPageHeader } from '@layout'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import SettingsIcon from '@mui/icons-material/Settings'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import { Box, Button, Container, Grid, Typography, type SxProps } from '@mui/material'
import profilePhoto from '@public/assets/profile_photo.jpg'
import { font } from '@themes/tokens'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type ReactElement, type ReactNode } from 'react'

const sectionSx: SxProps = {
    py: { xs: 8, md: 12 },
    borderTop: '1px solid',
    borderColor: 'divider',
    scrollMarginTop: '80px'
}

/** Primeira letra grande em Chakra Petch, como num livro de regras */
const dropCapSx: SxProps = {
    '&::first-letter': {
        float: 'left',
        mr: 0.75,
        mt: 0.5,
        fontFamily: font.display,
        fontWeight: 600,
        fontSize: '3.6em',
        lineHeight: 0.8,
        color: 'primary.main'
    }
}

/** Grade de cruzes (a cada 24px) atrás do hero: as junções do circuito do logo */
function CrossGrid(): ReactElement {
    return (
        <Box
            component="svg"
            aria-hidden
            focusable="false"
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', color: 'divider', opacity: 0.6, pointerEvents: 'none' }}
        >
            <defs>
                <pattern id="landing-cross-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                    <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" fill="none" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#landing-cross-grid)" />
        </Box>
    )
}

function AboutCard({ icon, title, children }: { icon: ReactNode, title: string, children: ReactNode }): ReactElement {
    return (
        <Box
            sx={{
                height: '100%',
                p: 3,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.paper'
            }}
        >
            <Box sx={{ mb: 2, color: 'primary.main', display: 'flex' }}>{icon}</Box>
            <Typography variant="h5" component="h3" sx={{ mb: 1.5 }}>{title}</Typography>
            <Typography sx={{ color: 'text.secondary', lineHeight: 1.7 }}>{children}</Typography>
        </Box>
    )
}

function BookSection({
    id,
    eyebrow,
    title,
    text,
    cover,
    onDownload,
    reverse = false
}: {
    id: string
    eyebrow?: string
    title: string
    text: string
    cover: ReactNode
    onDownload: () => void
    reverse?: boolean
}): ReactElement {
    return (
        <Box component="section" id={id} sx={sectionSx}>
            <Container maxWidth="lg">
                <Grid container spacing={{ xs: 5, md: 8 }} alignItems="center" direction={{ xs: 'column', md: reverse ? 'row-reverse' : 'row' }}>
                    <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'center', md: reverse ? 'flex-end' : 'flex-start' }, width: '100%' }}>
                        {cover}
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <SectionHeader eyebrow={eyebrow} title={title} dense />
                        <Typography sx={{ ...dropCapSx, color: 'text.secondary', lineHeight: 1.8, maxWidth: '68ch' }}>{text}</Typography>
                        <Button variant="contained" size="large" onClick={onDownload} sx={{ mt: 4 }}>
                            Baixe agora
                        </Button>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    )
}

export default function LandingPage(): ReactElement {
    const { data: session } = useSession()
    const router = useRouter()
    const [ deferredPrompt, setDeferredPrompt ] = useState<any>(null)
    const [ showButton, setShowButton ] = useState(false)

    // Planos: sem login vai para a autenticação; com login, para a página de planos
    const handlePlanClick = () => {
        router.push(session ? '/app/subscription/plans' : '/api/auth/signin')
    }

    const handleInstallClick = () => {
        if (deferredPrompt) {
            deferredPrompt.prompt()
            deferredPrompt.userChoice.then(() => {
                setShowButton(false)
                setDeferredPrompt(null)
            })
        }
    }

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

    return (
        <>
            <LandingPageHeader />

            <Box component="section" id="inicio" sx={{ position: 'relative', overflow: 'hidden', pt: { xs: 14, md: 20 }, pb: { xs: 8, md: 12 }, scrollMarginTop: '80px' }}>
                <CrossGrid />
                <Container maxWidth="lg" sx={{ position: 'relative' }}>
                    <Grid container spacing={{ xs: 6, md: 8 }} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography
                                component="p"
                                sx={{ mb: 2, color: 'primary.main', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}
                            >
                                RPG de mesa · magia artificial
                            </Typography>
                            <Typography variant="h1" sx={{ fontFamily: font.display, fontSize: { xs: '2.75rem', md: '4rem' }, lineHeight: 1.05 }}>
                                Magitech RPG
                            </Typography>
                            <Typography sx={{ mt: 3, fontSize: { xs: '1.125rem', md: '1.375rem' }, lineHeight: 1.4 }}>
                                O sistema de RPG que mistura magia e tecnologia.
                            </Typography>
                            <Typography sx={{ mt: 2, color: 'text.secondary', lineHeight: 1.7, maxWidth: '52ch' }}>
                                Um RPG de mesa mágico e futurista que prioriza a diversão, a estética, a automação e a criatividade.
                                Junte-se a esta jornada.
                            </Typography>
                            <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Button variant="contained" size="large" onClick={() => { router.push('/api/auth/signin') }}>
                                    Comece já
                                </Button>
                                <Button variant="outlined" color="secondary" size="large" component="a" href="#guia">
                                    Ler o guia de regras
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <HeroShowcase />
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            <Box component="section" sx={{ ...sectionSx, scrollMarginTop: '80px' }}>
                <Container maxWidth="lg">
                    <SectionHeader
                        eyebrow="Elementos"
                        title="Treze elementos de magia"
                        description="Cada elemento tem o próprio glifo e a própria cor, para você reconhecer a magia de relance na ficha e na mesa."
                    />
                    <ElementStrip />
                </Container>
            </Box>

            <Box component="section" id="sobre" sx={sectionSx}>
                <Container maxWidth="lg">
                    <SectionHeader eyebrow="Sobre" title="O Magitech RPG" />
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <AboutCard icon={<AutoStoriesIcon fontSize="large" />} title="O que é?">
                                Magitech RPG é um sistema de RPG de mesa feito por Vitor Hugo Rodrigues dos Santos inspirado em D&D,
                                Tormenta, Order & Chaos, Ordem Paranormal, entre outros sistemas de RPG. Para quem não sabe, RPG
                                (abreviação de Role Playing Game), é um jogo de interpretação de papéis, onde aqueles que participam são
                                divididos entre o Mestre e os Jogadores.
                            </AboutCard>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <AboutCard icon={<HelpOutlineIcon fontSize="large" />} title="Por quê?">
                                Para quem joga RPG de mesa, sabe o quão trabalhoso e burocrático é jogar uma sessão, principalmente se
                                você for o Mestre. É necessário criar e anotar fichas, programar sessões, anotar detalhes em combate ou
                                no mapa e muito mais. Tendo em vista este problema, o Magitech foi desenvolvido para auxiliar não só o
                                Mestre, mas também os jogadores no que for preciso.
                            </AboutCard>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <AboutCard icon={<SettingsIcon fontSize="large" />} title="Como funciona?">
                                Este site é uma aplicação web para auxílio na jogatina de Magitech RPG. Basicamente, é um sistema que
                                integra fichas e sessões da mesa de RPG e automatiza o que antes precisava ser feito no papel. As regras
                                do RPG estão descritas no Guia que está disponível para download logo abaixo.
                            </AboutCard>
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            <Box component="section" id="quem-somos" sx={sectionSx}>
                <Container maxWidth="lg">
                    <SectionHeader eyebrow="Quem somos" title="Quem faz o Magitech" />
                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexDirection: { xs: 'column', sm: 'row' }, textAlign: { xs: 'center', sm: 'left' } }}>
                        <Image
                            src={profilePhoto}
                            alt="Foto de Vitor Hugo Rodrigues dos Santos"
                            width={120}
                            height={120}
                            style={{ borderRadius: '50%', objectFit: 'cover', flex: 'none' }}
                        />
                        <Box>
                            <Typography variant="h5" component="h3">Vitor Hugo Rodrigues dos Santos</Typography>
                            <Typography sx={{ mt: 0.5, color: 'primary.main', fontWeight: 500 }}>
                                Desenvolvedor Web & Técnico em Desenvolvimento de Sistemas
                            </Typography>
                            <Typography sx={{ mt: 1.5, color: 'text.secondary', lineHeight: 1.7, maxWidth: '60ch' }}>
                                Apenas eu mesmo, Vitor Santos. Jovem sonhador que está ingressando no mercado de trabalho de TI fazendo
                                novos projetos como este.
                            </Typography>
                        </Box>
                    </Box>
                </Container>
            </Box>

            <BookSection
                id="guia"
                title="Obtenha o Guia de Regras"
                text={landingPageSynopse}
                onDownload={() => { window.open(BLOB_API.GUIA) }}
                cover={<BookCover variant="guia" title={[ 'Livro', 'de Regras' ]} label="Baixar o Livro de Regras (PDF)" onClick={() => { window.open(BLOB_API.GUIA) }} />}
            />

            <BookSection
                id="grimorio"
                eyebrow="Trilhe o caminho da magia"
                title="Obtenha o Grimório"
                text={landingPageGrimoire}
                reverse
                onDownload={() => { window.open(BLOB_API.GRIMORIO) }}
                cover={<BookCover variant="grimorio" title={[ 'Grimório' ]} label="Baixar o Grimório (PDF)" onClick={() => { window.open(BLOB_API.GRIMORIO) }} />}
            />

            <Box component="section" id="planos" sx={sectionSx}>
                <Container maxWidth="lg">
                    <SectionHeader
                        align="center"
                        eyebrow="Planos"
                        title="Planos e Assinaturas"
                        description="Escolha o plano perfeito para sua aventura no MagitechRPG"
                    />
                    <Grid container spacing={3}>
                        {[ SubscriptionPlan.FREEMIUM, SubscriptionPlan.PREMIUM, SubscriptionPlan.PREMIUM_PLUS ].map(plan => (
                            <Grid item xs={12} md={4} key={plan}>
                                <PricingCard plan={plan} onSelect={handlePlanClick} />
                            </Grid>
                        ))}
                    </Grid>
                    <Box
                        sx={{
                            mt: 6,
                            p: { xs: 3, md: 5 },
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 3,
                            bgcolor: 'background.paper',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                            textAlign: 'center'
                        }}
                    >
                        <WorkspacePremiumIcon sx={{ fontSize: '2.5rem', color: 'primary.main' }} />
                        <Typography variant="h5" component="h3">Desbloqueie todo o potencial do MagitechRPG</Typography>
                        <Typography sx={{ color: 'text.secondary', maxWidth: '64ch', lineHeight: 1.7 }}>
                            Com os planos Premium e Premium+, você tem acesso a recursos exclusivos como campanhas colaborativas,
                            sistemas de RPG customizados, acesso ao Discord exclusivo e muito mais.
                        </Typography>
                        <Button variant="contained" size="large" startIcon={<WorkspacePremiumIcon />} onClick={handlePlanClick} sx={{ mt: 1 }}>
                            {session ? 'Ver todos os planos' : 'Fazer login para ver planos'}
                        </Button>
                    </Box>
                </Container>
            </Box>

            <Box component="section" id="doacao" sx={sectionSx}>
                <Container maxWidth="lg">
                    <SectionHeader align="center" eyebrow="Doação" title="Apoie o Projeto" />
                    <Box
                        sx={{
                            mx: 'auto',
                            maxWidth: 760,
                            p: { xs: 3, md: 5 },
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 3,
                            bgcolor: 'background.paper',
                            textAlign: 'center'
                        }}
                    >
                        <Typography variant="h5" component="h3" sx={{ mb: 2 }}>Contribua com o MagitechRPG</Typography>
                        <Typography sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 2 }}>
                            O MagitechRPG é um projeto desenvolvido com paixão e dedicação, totalmente gratuito para todos os jogadores.
                            Sua contribuição nos ajuda a manter os servidores online, desenvolver novas funcionalidades e melhorar a
                            experiência do jogo para toda a comunidade.
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 4 }}>
                            Qualquer valor é bem-vindo. Além de apoiar financeiramente, você também pode contribuir com o projeto
                            divulgando para seus amigos, participando da comunidade ou até mesmo sugerindo melhorias.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => window.open('https://www.paypal.com/donate/?hosted_buttonid=ABCDEFGH12345', '_blank')}
                            >
                                Doar com PayPal
                            </Button>
                            <Button
                                variant="outlined"
                                color="secondary"
                                size="large"
                                onClick={() => window.open('https://www.patreon.com/magitechrpg', '_blank')}
                            >
                                Apoiar no Patreon
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>

            <Box component="section" id="sinopse" sx={sectionSx}>
                <Container maxWidth="md">
                    <SectionHeader eyebrow="Universo" title="Sinopse" />
                    <Typography sx={{ ...dropCapSx, color: 'text.secondary', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{intro}</Typography>
                </Container>
            </Box>

            <Footer />

            {showButton && (
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleInstallClick}
                    sx={{ position: 'fixed', bottom: 20, right: 20, borderRadius: 999, px: 3, py: 1.25, zIndex: 999 }}
                >
                    Instalar App
                </Button>
            )}
        </>
    )
}
