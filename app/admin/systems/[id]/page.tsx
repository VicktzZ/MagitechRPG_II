'use client'

import { useState, useEffect } from 'react'
import { SystemBuilder } from '@components/admin/systems/SystemBuilder'
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useRouter } from 'next/navigation'
import type { RPGSystem } from '@models/entities'

export default function EditSystemPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [ system, setSystem ] = useState<RPGSystem | null>(null)
    const [ loading, setLoading ] = useState(true)
    const [ error, setError ] = useState<string | null>(null)

    useEffect(() => {
        const fetchSystem = async () => {
            try {
                const response = await fetch(`/api/rpg-system/${params.id}`)
                if (!response.ok) {
                    throw new Error('Sistema não encontrado')
                }
                const data = await response.json()
                setSystem(data)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchSystem()
    }, [ params.id ])

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
            </Box>
        )
    }

    if (error || !system) {
        return (
            <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error || 'Sistema não encontrado'}
                </Alert>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push('/admin/systems')}
                >
                    Voltar para lista
                </Button>
            </Box>
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
                        ✏️ Editar Sistema: {system.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Modifique os aspectos do seu sistema de RPG
                    </Typography>
                </Box>
            </Box>

            <SystemBuilder initialData={system} />
        </Box>
    )
}
