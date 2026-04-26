'use client';

import React, { useState } from 'react';
import {
    Container,
    Box,
    Typography,
    Grid,
    Button,
    Paper,
    Tab,
    Tabs,
    Divider,
    Alert,
    Snackbar
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { PricingCard, PlanComparison } from '@components/subscription';
import { SubscriptionPlan } from '@enums/subscriptionEnum';
import { useSubscription } from '@hooks';
import { subscriptionService } from '@services';

export default function SubscriptionPlansPage() {
    const router = useRouter();
    const { currentPlan, user } = useSubscription();
    const [ activeTab, setActiveTab ] = useState(0);
    const [ loading, setLoading ] = useState<SubscriptionPlan | null>(null);
    const [ snackbar, setSnackbar ] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
      open: false,
      message: '',
      severity: 'info'
  });

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleSelectPlan = async (plan: SubscriptionPlan) => {
        if (!user) {
            setSnackbar({
                open: true,
                message: 'Você precisa estar logado para assinar um plano',
                severity: 'error'
            });
            router.push('/auth/signin');
            return;
        }

        if (plan === currentPlan) {
            return;
        }

        setLoading(plan);

        try {
            if (plan === SubscriptionPlan.FREEMIUM) {
                // Downgrade para Freemium (cancelamento)
                await subscriptionService.cancelSubscription(user.id);
                setSnackbar({
                    open: true,
                    message: 'Sua assinatura foi cancelada. Você voltou ao plano Freemium.',
                    severity: 'info'
                });
            } else {
                // Upgrade ou mudança de plano
                router.push(`/subscription/checkout?plan=${plan}`);
                return; // Não mostra mensagem aqui pois vai redirecionar
            }

            // Recarrega a página para atualizar os dados
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (error) {
            console.error('Erro ao processar mudança de plano:', error);
            setSnackbar({
                open: true,
                message: 'Erro ao processar sua solicitação. Tente novamente.',
                severity: 'error'
            });
        } finally {
            setLoading(null);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Container maxWidth="xl" sx={{ py: 8 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography
                    variant="h2"
                    component="h1"
                    gutterBottom
                    sx={{
                        fontWeight: 'bold',
                        background: (theme) =>
                            `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}
                >
          Escolha o Plano Perfeito para Você
                </Typography>
                <Typography variant="h6" color="text.secondary" paragraph>
          Desbloqueie todo o potencial do MagitechRPG com recursos exclusivos
                </Typography>
            </Box>

            {/* Alert do Plano Atual */}
            {currentPlan && (
                <Alert
                    severity="info"
                    sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}
                >
          Você está atualmente no plano <strong>{currentPlan}</strong>.
                    {currentPlan !== SubscriptionPlan.PREMIUM_PLUS &&
            ' Faça upgrade para desbloquear mais recursos!'}
                </Alert>
            )}

            {/* Tabs */}
            <Paper sx={{ mb: 4 }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    centered
                    variant="fullWidth"
                >
                    <Tab label="Planos Disponíveis" />
                    <Tab label="Comparação Detalhada" />
                </Tabs>
            </Paper>

            {/* Tab Content */}
            {activeTab === 0 && (
                <Box>
                    {/* Cards de Preços */}
                    <Grid container spacing={4} sx={{ mb: 6 }}>
                        {Object.values(SubscriptionPlan).map((plan) => (
                            <Grid item xs={12} md={4} key={plan}>
                                <PricingCard
                                    plan={plan}
                                    isCurrentPlan={currentPlan === plan}
                                    onSelect={handleSelectPlan}
                                    loading={loading === plan}
                                />
                            </Grid>
                        ))}
                    </Grid>

                    {/* FAQ Section */}
                    <Divider sx={{ my: 6 }} />
          
                    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
              Perguntas Frequentes
                        </Typography>
            
                        <Paper sx={{ p: 3, mb: 2 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Posso cancelar a qualquer momento?
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                Sim! Você pode cancelar sua assinatura a qualquer momento sem multas.
                Você continuará tendo acesso aos recursos premium até o fim do período pago.
                            </Typography>
                        </Paper>

                        <Paper sx={{ p: 3, mb: 2 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Como funciona o upgrade/downgrade?
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                Ao fazer upgrade, você paga proporcionalmente pelo tempo restante. 
                No downgrade, você mantém os benefícios até o fim do período já pago.
                            </Typography>
                        </Paper>

                        <Paper sx={{ p: 3, mb: 2 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Meus dados estão seguros?
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                Sim! Todos os seus dados são criptografados e armazenados com segurança.
                Fazemos backups regulares para garantir que nada seja perdido.
                            </Typography>
                        </Paper>

                        <Paper sx={{ p: 3, mb: 2 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Quais formas de pagamento são aceitas?
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                Aceitamos cartões de crédito, PIX e boleto bancário. 
                O pagamento é processado de forma segura através de nossos parceiros.
                            </Typography>
                        </Paper>
                    </Box>
                </Box>
            )}

            {activeTab === 1 && (
                <Box>
                    <PlanComparison />
                </Box>
            )}

            {/* CTA Final */}
            <Box sx={{ textAlign: 'center', mt: 8, mb: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Ainda tem dúvidas?
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
          Entre em contato com nosso suporte ou comece com o plano gratuito!
                </Typography>
                <Button
                    variant="outlined"
                    size="large"
                    href="mailto:suporte@magitechrpg.com"
                    sx={{ mr: 2 }}
                >
          Contatar Suporte
                </Button>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => router.push('/app')}
                >
          Começar Grátis
                </Button>
            </Box>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}
