'use client';

import React, { useEffect, useState } from 'react';
import {
    Container,
    Box,
    Typography,
    Button,
    Paper,
    CircularProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Alert
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Stars as StarsIcon
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSubscription } from '@hooks';

export default function SubscriptionSuccessPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const {   planMetadata } = useSubscription();
    const [ loading, setLoading ] = useState(true);

    const sessionId = searchParams?.get('session_id');

    useEffect(() => {
    // Aguardar alguns segundos para o webhook processar
        const timer = setTimeout(() => {
            setLoading(false);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Paper
                    elevation={3}
                    sx={{
                        p: 6,
                        textAlign: 'center'
                    }}
                >
                    <CircularProgress size={80} sx={{ mb: 3 }} />
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Processando seu pagamento...
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
            Aguarde enquanto confirmamos sua assinatura
                    </Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Paper
                elevation={3}
                sx={{
                    p: 6,
                    textAlign: 'center',
                    background: (theme) =>
                        `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.success.main}15 100%)`,
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Efeito de confete/celebração */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        fontSize: '3rem',
                        opacity: 0.3
                    }}
                >
          🎉
                </Box>
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 20,
                        left: 20,
                        fontSize: '3rem',
                        opacity: 0.3
                    }}
                >
          🎊
                </Box>

                <CheckCircleIcon
                    sx={{
                        fontSize: 120,
                        color: 'success.main',
                        mb: 3,
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                            '0%': { transform: 'scale(1)' },
                            '50%': { transform: 'scale(1.05)' },
                            '100%': { transform: 'scale(1)' }
                        }
                    }}
                />
        
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
          🎉 Pagamento Confirmado!
                </Typography>
        
                <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 4 }}>
          Bem-vindo ao plano {planMetadata?.displayName || 'Premium'}! 
          Sua assinatura foi ativada com sucesso.
                </Typography>

                {sessionId && (
                    <Alert severity="success" sx={{ mb: 4 }}>
                        <Typography variant="body2">
              ID da Sessão: {sessionId.slice(0, 20)}...
                        </Typography>
                    </Alert>
                )}

                <Divider sx={{ my: 4 }} />

                {/* Recursos Liberados */}
                {planMetadata && (
                    <Box sx={{ mb: 4, textAlign: 'left' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                            <StarsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Recursos Desbloqueados
                        </Typography>
                        <List>
                            {planMetadata.features.slice(0, 5).map((feature, index) => (
                                <ListItem key={index}>
                                    <ListItemIcon>
                                        <CheckCircleIcon sx={{ color: 'success.main' }} />
                                    </ListItemIcon>
                                    <ListItemText primary={feature} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}

                <Divider sx={{ my: 4 }} />

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => router.push('/app')}
                        sx={{ px: 4 }}
                    >
            Começar Agora
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={() => router.push('/app/subscription/manage')}
                        sx={{ px: 4 }}
                    >
            Gerenciar Assinatura
                    </Button>
                </Box>

                <Box sx={{ mt: 4, p: 3, backgroundColor: 'background.paper', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary">
            ✉️ Um e-mail de confirmação foi enviado pelo Stripe com os detalhes da sua assinatura.
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}
