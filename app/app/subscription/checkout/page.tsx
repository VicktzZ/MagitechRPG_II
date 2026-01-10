'use client';

import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    Divider,
    Alert,
    CircularProgress,
    Card,
    CardContent
} from '@mui/material';

import { useRouter, useSearchParams } from 'next/navigation';
import { SubscriptionPlan, SubscriptionPlanMetadata } from '@enums/subscriptionEnum';
import { useSubscription } from '@hooks';

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useSubscription();
  
    const planParam = searchParams?.get('plan') as SubscriptionPlan;
    const [ selectedPlan ] = useState<SubscriptionPlan>(
        planParam || SubscriptionPlan.PREMIUM
    );
    
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState<string | null>(null);

    const planMetadata = SubscriptionPlanMetadata[selectedPlan];

    useEffect(() => {
        if (!user) {
            router.push('/api/auth/signin');
        }
    }, [ user, router ]);

    // Redirecionar se o plano for Freemium
    useEffect(() => {
        if (selectedPlan === SubscriptionPlan.FREEMIUM) {
            router.push('/app/subscription/plans');
        }
    }, [ selectedPlan, router ]);

    if (!user) {
        return (
            <Container maxWidth="md" sx={{ py: 8 }}>
                <CircularProgress />
            </Container>
        );
    }

    const handleCheckout = async () => {
        setLoading(true);
        setError(null);

        try {
            // Criar sessão de checkout no Stripe
            const response = await fetch('/api/stripe/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    plan: selectedPlan
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao criar sessão de checkout');
            }

            // Redirecionar para o Stripe Checkout
            const stripe = await getStripe();
            if (!stripe) {
                throw new Error('Stripe não inicializado');
            }

            const { error: stripeError } = await stripe.redirectToCheckout({
                sessionId: data.sessionId
            });

            if (stripeError) {
                throw new Error(stripeError.message);
            }

        } catch (err) {
            console.error('Erro no checkout:', err);
            setError(err instanceof Error ? err.message : 'Erro ao processar pagamento');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Finalizar Assinatura
            </Typography>

            <Grid container spacing={4}>
                {/* Informações do Checkout */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 4 }}>
                        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              Checkout Seguro com Stripe
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
              Você será redirecionado para a página segura do Stripe para completar o pagamento.
                        </Typography>

                        <Divider sx={{ my: 3 }} />

                        {/* Benefícios do Plano */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: planMetadata.color }}>
                Recursos Incluídos
                            </Typography>
                            <List>
                                {planMetadata.features.slice(0, 8).map((feature, index) => (
                                    <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <CheckCircleIcon sx={{ color: planMetadata.color, fontSize: '1.25rem' }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={feature}
                                            primaryTypographyProps={{ variant: 'body2' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        {/* Segurança */}
                        <Box sx={{ mb: 4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <SecurityIcon color="success" />
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Pagamento 100% Seguro
                                </Typography>
                            </Box>
                            <List dense>
                                <ListItem sx={{ px: 0 }}>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <LockIcon sx={{ color: 'success.main', fontSize: '1rem' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Processado pelo Stripe (padrão mundial)"
                                        primaryTypographyProps={{ variant: 'body2' }}
                                    />
                                </ListItem>
                                <ListItem sx={{ px: 0 }}>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <LockIcon sx={{ color: 'success.main', fontSize: '1rem' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Seus dados de cartão são criptografados"
                                        primaryTypographyProps={{ variant: 'body2' }}
                                    />
                                </ListItem>
                                <ListItem sx={{ px: 0 }}>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <LockIcon sx={{ color: 'success.main', fontSize: '1rem' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Cancele a qualquer momento sem multas"
                                        primaryTypographyProps={{ variant: 'body2' }}
                                    />
                                </ListItem>
                            </List>
                        </Box>

                        {/* Erro */}
                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        {/* Botão de Checkout com Stripe */}
                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            onClick={handleCheckout}
                            disabled={loading}
                            sx={{
                                py: 2,
                                fontSize: '1.1rem',
                                fontWeight: 'bold',
                                bgcolor: planMetadata.color,
                                '&:hover': {
                                    bgcolor: planMetadata.color,
                                    filter: 'brightness(0.9)'
                                }
                            }}
                        >
                            {loading ? (
                                <>
                                    <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                  Redirecionando para o Stripe...
                                </>
                            ) : (
                                'Prosseguir para Pagamento Seguro'
                            )}
                        </Button>

                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
              Ao clicar, você será redirecionado para a página segura do Stripe
                        </Typography>
                    </Paper>
                </Grid>

                {/* Resumo do Pedido */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Resumo do Pedido
                            </Typography>

                            <Box sx={{ my: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Typography variant="h2">{planMetadata.icon}</Typography>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            {planMetadata.displayName}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                      Cobrança {planMetadata.billingPeriod}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ mb: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2">Valor Mensal:</Typography>
                                    <Typography variant="body2">
                                        {planMetadata.price.toLocaleString('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL'
                                        })}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Total Mensal:
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: planMetadata.color }}>
                                    {planMetadata.price.toLocaleString('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                    })}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Cobrança recorrente mensal. Cancele a qualquer momento.
                            </Typography>

                            <Alert severity="info" icon={<SecurityIcon />}>
                                <Typography variant="caption">
                  Pagamento processado de forma segura pelo <strong>Stripe</strong>
                                </Typography>
                            </Alert>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}
