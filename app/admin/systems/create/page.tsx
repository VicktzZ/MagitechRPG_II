'use client'

import { Suspense, useEffect, useState } from 'react'
import { SystemBuilder } from '@components/admin/systems/SystemBuilder'
import { Box, Typography, Button, Paper, Grid, CircularProgress, Container, Alert } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import type { RPGSystem } from '@models/entities'
import { defaultMagitechSystem } from '@constants/defaultMagitechSystem'
import { SYSTEM_BUILDER_SEED_KEY } from '@utils/systemExportImport'
import { useCustomSystemsAccess } from '@hooks/useSubscription'
import { isAdminEmail } from '@utils/adminCheck'

function CreateSystemContent() {
    const searchParams = useSearchParams()
    const hasSeed = searchParams.get('seed') === '1'

    // null = ainda escolhendo; objeto = builder com seed; undefined dentro do objeto = em branco
    const [ initialData, setInitialData ] = useState<Partial<RPGSystem> | undefined>(undefined)
    const [ started, setStarted ] = useState(false)
    const [ loadingSeed, setLoadingSeed ] = useState(hasSeed)

    useEffect(() => {
        if (!hasSeed) return
        try {
            const raw = sessionStorage.getItem(SYSTEM_BUILDER_SEED_KEY)
            sessionStorage.removeItem(SYSTEM_BUILDER_SEED_KEY)
            if (raw) {
                setInitialData(JSON.parse(raw) as Partial<RPGSystem>)
                setStarted(true)
            }
        } catch {
            // seed inválido — segue para a escolha em branco/template
        } finally {
            setLoadingSeed(false)
        }
    }, [ hasSeed ])

    const startBlank = () => {
        setInitialData(undefined)
        setStarted(true)
    }

    const startFromMagitech = () => {
        setInitialData({ ...defaultMagitechSystem, name: '', isPublic: false })
        setStarted(true)
    }

    if (loadingSeed) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
            </Box>
        )
    }

    if (!started) {
        return (
            <Grid container spacing={3} sx={{ maxWidth: 800, mx: 'auto' }}>
                <Grid item xs={12} sm={6}>
                    <Paper
                        sx={{
                            p: 4,
                            textAlign: 'center',
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: 'divider',
                            transition: 'all 0.2s ease',
                            '&:hover': { borderColor: 'primary.main', boxShadow: 3 }
                        }}
                        onClick={startBlank}
                    >
                        <NoteAddIcon sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>Em Branco</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Comece do zero e configure cada aspecto do seu sistema manualmente.
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Paper
                        sx={{
                            p: 4,
                            textAlign: 'center',
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: 'divider',
                            transition: 'all 0.2s ease',
                            '&:hover': { borderColor: 'secondary.main', boxShadow: 3 }
                        }}
                        onClick={startFromMagitech}
                    >
                        <AutoFixHighIcon sx={{ fontSize: 56, color: 'secondary.main', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>Baseado no Magitech</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Comece com todos os atributos, perícias, classes, raças e traços do Magitech RPG e personalize a partir daí.
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        )
    }

    return <SystemBuilder initialData={initialData} />
}

export default function CreateSystemPage() {
    const router = useRouter()
    const { data: session } = useSession()
    const { canCreate: canAccessCustomSystems } = useCustomSystemsAccess()
    const hasAccess = canAccessCustomSystems || isAdminEmail(session?.user?.email)

    if (!hasAccess) {
        return (
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Alert severity="error">
                    <Typography variant="h6" gutterBottom>🔒 Acesso Negado</Typography>
                    <Typography variant="body2">
                        Você não tem permissões para acessar esta página. A criação de sistemas customizados é exclusiva para assinantes do plano Premium+.
                    </Typography>
                </Alert>
            </Container>
        )
    }

    return (
        <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push('/admin/systems')}
                >
                    Voltar
                </Button>
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        ✨ Criar Novo Sistema
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Configure todos os aspectos do seu sistema de RPG customizado
                    </Typography>
                </Box>
            </Box>

            <Suspense fallback={<CircularProgress />}>
                <CreateSystemContent />
            </Suspense>
        </Box>
    )
}
