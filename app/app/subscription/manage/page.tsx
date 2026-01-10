'use client';

import React, { useState } from 'react';
import {
    Container,
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    Chip,
    Divider,
    Card,
    CardContent,
    LinearProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import {
    Stars as StarsIcon,
    CalendarToday as CalendarIcon,
    CreditCard as CreditCardIcon,
    Storage as StorageIcon,
    TrendingUp as TrendingUpIcon,
    Cancel as CancelIcon,
    Upgrade as UpgradeIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useSubscription, usePlanLimits } from '@hooks';
import { SubscriptionStatus, SubscriptionPlan } from '@enums/subscriptionEnum';
import { subscriptionService } from '@services';

export default function ManageSubscriptionPage() {
    const router = useRouter();
    const { subscription, currentPlan, planMetadata , user } = useSubscription();
    const { limits, usage, hasReachedStorageLimit } = usePlanLimits();
    const [ cancelDialogOpen, setCancelDialogOpen ] = useState(false);
    const [ loading, setLoading ] = useState(false);

    if (!subscription || !user) {
        return (
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Alert severity="error">
          Você precisa estar logado para acessar esta página.
                </Alert>
            </Container>
        );
    }

    const handleCancelSubscription = async () => {
        setLoading(true);
        try {
            await subscriptionService.cancelSubscription(user.id);
            setCancelDialogOpen(false);
            window.location.reload();
        } catch (error) {
            console.error('Erro ao cancelar assinatura:', error);
            alert('Erro ao cancelar assinatura. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleManageWithStripe = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/stripe/create-portal-session', {
                method: 'POST'
            });
      
            const data = await response.json();
      
            if (response.ok && data.url) {
                window.location.href = data.url;
            } else {
                alert(data.error || 'Erro ao abrir portal do Stripe');
            }
        } catch (error) {
            console.error('Erro ao abrir portal:', error);
            alert('Erro ao abrir portal de gerenciamento');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    const storagePercentage = usage
        ? (usage.storageUsed / (limits.maxStorageGB * 1024 * 1024 * 1024)) * 100
        : 0;

    const getStatusColor = (status: SubscriptionStatus) => {
        switch (status) {
        case SubscriptionStatus.ACTIVE:
            return 'success';
        case SubscriptionStatus.CANCELLED:
            return 'warning';
        case SubscriptionStatus.EXPIRED:
            return 'error';
        default:
            return 'default';
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            {/* Header */}
            <Box sx={{ mb: 6 }}>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
          Gerenciar Assinatura
                </Typography>
                <Typography variant="body1" color="text.secondary">
          Gerencie seu plano, acompanhe o uso e atualize suas preferências
                </Typography>
            </Box>

            <Grid container spacing={4}>
                {/* Plano Atual */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 4, mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="h2">{planMetadata.icon}</Typography>
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: planMetadata.color }}>
                                        {planMetadata.displayName}
                                    </Typography>
                                    <Chip
                                        label={subscription.status}
                                        color={getStatusColor(subscription.status)}
                                        size="small"
                                        sx={{ mt: 1 }}
                                    />
                                </Box>
                            </Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: planMetadata.color }}>
                                {planMetadata.priceFormatted}
                                {planMetadata.billingPeriod && (
                                    <Typography variant="caption" color="text.secondary">
                    /{planMetadata.billingPeriod}
                                    </Typography>
                                )}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        {/* Informações da Assinatura */}
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <CalendarIcon color="action" />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                      Data de Início
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                            {formatDate(subscription.startDate)}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            {subscription.endDate && (
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <CalendarIcon color="action" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">
                                                {subscription.status === SubscriptionStatus.ACTIVE ? 'Próxima Renovação' : 'Data de Término'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {formatDate(subscription.endDate)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            )}
                            {subscription.autoRenew && (
                                <Grid item xs={12}>
                                    <Alert severity="info">
                    Renovação automática ativada. Seu plano será renovado automaticamente.
                                    </Alert>
                                </Grid>
                            )}
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        {/* Ações */}
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            {currentPlan !== SubscriptionPlan.PREMIUM_PLUS && (
                                <Button
                                    variant="contained"
                                    startIcon={<UpgradeIcon />}
                                    onClick={() => router.push('/app/subscription/plans')}
                                >
                  Fazer Upgrade
                                </Button>
                            )}
                            {currentPlan !== SubscriptionPlan.FREEMIUM && subscription.paymentMethod === 'stripe' && (
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<CreditCardIcon />}
                                    onClick={handleManageWithStripe}
                                    disabled={loading}
                                >
                  Gerenciar no Stripe
                                </Button>
                            )}
                            {currentPlan !== SubscriptionPlan.FREEMIUM && subscription.paymentMethod !== 'stripe' && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<CancelIcon />}
                                    onClick={() => setCancelDialogOpen(true)}
                                >
                  Cancelar Assinatura
                                </Button>
                            )}
                            <Button
                                variant="outlined"
                                onClick={() => router.push('/app/subscription/plans')}
                            >
                Ver Todos os Planos
                            </Button>
                        </Box>
                    </Paper>

                    {/* Recursos do Plano */}
                    <Paper sx={{ p: 4 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              Recursos Incluídos
                        </Typography>
                        <Grid container spacing={2}>
                            {planMetadata.features.map((feature, index) => (
                                <Grid item xs={12} key={index}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <StarsIcon sx={{ color: 'success.main', fontSize: '1.25rem' }} />
                                        <Typography variant="body2">{feature}</Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>

                {/* Uso e Estatísticas */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <StorageIcon color="primary" />
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Armazenamento
                                </Typography>
                            </Box>
                            <Box sx={{ mb: 1 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min(storagePercentage, 100)}
                                    sx={{ height: 8, borderRadius: 1 }}
                                    color={hasReachedStorageLimit ? 'error' : 'primary'}
                                />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                {usage ? (usage.storageUsed / (1024 * 1024)).toFixed(2) : 0} MB de{' '}
                                {limits.maxStorageGB} GB usados
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <TrendingUpIcon color="primary" />
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Estatísticas de Uso
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                    Fichas Criadas
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                        {usage?.charsheetsCreated || 0}
                                        {limits.maxCharsheets !== -1 && ` / ${limits.maxCharsheets}`}
                                    </Typography>
                                </Box>
                                <Divider />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                    Campanhas
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                        {usage?.campaignsCreated || 0}
                                        {limits.maxCampaigns !== -1 && ` / ${limits.maxCampaigns}`}
                                    </Typography>
                                </Box>
                                <Divider />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                    Sistemas Customizados
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                                        {usage?.customSystemsCreated || 0}
                                        {limits.maxCustomSystems !== -1 && ` / ${limits.maxCustomSystems}`}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <CreditCardIcon color="primary" />
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Suporte
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" paragraph>
                Nível de Suporte: <strong>{limits.supportLevel}</strong>
                            </Typography>
                            <Button
                                variant="outlined"
                                fullWidth
                                href="mailto:suporte@magitechrpg.com"
                            >
                Contatar Suporte
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Dialog de Cancelamento */}
            <Dialog
                open={cancelDialogOpen}
                onClose={() => !loading && setCancelDialogOpen(false)}
            >
                <DialogTitle>Cancelar Assinatura</DialogTitle>
                <DialogContent>
                    <DialogContentText>
            Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos recursos
            premium ao fim do período atual, mas seus dados serão mantidos.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelDialogOpen(false)} disabled={loading}>
            Voltar
                    </Button>
                    <Button
                        onClick={handleCancelSubscription}
                        color="error"
                        disabled={loading}
                        autoFocus
                    >
                        {loading ? 'Cancelando...' : 'Confirmar Cancelamento'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
