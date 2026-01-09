'use client'

import { SystemBuilder } from '@components/admin/systems/SystemBuilder'
import { Box, Typography, Button } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { useRouter } from 'next/navigation'

export default function CreateSystemPage() {
    const router = useRouter()

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

            <SystemBuilder />
        </Box>
    )
}
