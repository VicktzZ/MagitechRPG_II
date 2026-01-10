'use client';

import type { ReactNode } from 'react';
import React from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Container,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    alpha,
    Chip
} from '@mui/material';
import {
    Lock as LockIcon,
    CheckCircle as CheckCircleIcon,
    ArrowForward as ArrowForwardIcon,
    Stars as StarsIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import type { Permission } from '@enums/subscriptionEnum';
import { SubscriptionPlanMetadata } from '@enums/subscriptionEnum';
import { usePermission, useSubscription } from '@hooks';

interface SubscriptionGuardProps {
  children: ReactNode;
  permission: Permission;
  fallback?: ReactNode;
  redirectToPlans?: boolean;
  showComparison?: boolean;
}

/**
 * Componente para proteger conteúdo baseado em permissões
 * Exibe card do plano necessário quando o usuário não tem acesso
 */
export function SubscriptionGuard({
    children,
    permission,
    fallback
    ,
    showComparison = true
}: SubscriptionGuardProps) {
    const router = useRouter();
    const permissionCheck = usePermission(permission);
    const { currentPlan } = useSubscription();

    const handleUpgrade = () => {
        router.push('/app/subscription/plans');
    };

    if (permissionCheck.hasPermission) {
        return <>{children}</>;
    }

    if (fallback) {
        return <>{fallback}</>;
    }

    const requiredPlan = permissionCheck.requiredPlan;
    const requiredPlanMetadata = requiredPlan ? SubscriptionPlanMetadata[requiredPlan] : null;
    const currentPlanMetadata = SubscriptionPlanMetadata[currentPlan];

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            {/* Header com Ícone de Bloqueio */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Box
                    sx={{
                        display: 'inline-flex',
                        p: 3,
                        borderRadius: '50%',
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                        mb: 3
                    }}
                >
                    <LockIcon
                        sx={{
                            fontSize: 80,
                            color: 'primary.main'
                        }}
                    />
                </Box>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
          Conteúdo Exclusivo
                </Typography>
                <Typography variant="h6" color="text.secondary" paragraph>
                    {permissionCheck.message}
                </Typography>
            </Box>

            {requiredPlanMetadata && showComparison && (
                <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' }, mb: 4 }}>
                    {/* Card do Plano Atual */}
                    <Card
                        sx={{
                            flex: 1,
                            position: 'relative',
                            border: 2,
                            borderColor: 'divider',
                            opacity: 0.7
                        }}
                    >
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <Typography variant="h2" sx={{ mb: 1 }}>
                                    {currentPlanMetadata.icon}
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: currentPlanMetadata.color }}>
                  Seu Plano Atual
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 2 }}>
                                    {currentPlanMetadata.displayName}
                                </Typography>
                                <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                                    {currentPlanMetadata.priceFormatted}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
                Recursos Atuais:
                            </Typography>
                            <List dense>
                                {currentPlanMetadata.features.slice(0, 4).map((feature, index) => (
                                    <ListItem key={index} sx={{ px: 0 }}>
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <CheckCircleIcon sx={{ color: 'success.main', fontSize: '1.25rem' }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={feature}
                                            primaryTypographyProps={{ variant: 'body2' }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>

                    {/* Seta Indicativa */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transform: { xs: 'rotate(90deg)', md: 'none' }
                        }}
                    >
                        <ArrowForwardIcon sx={{ fontSize: 48, color: 'primary.main' }} />
                    </Box>

                    {/* Card do Plano Necessário */}
                    <Card
                        sx={{
                            flex: 1,
                            position: 'relative',
                            border: 3,
                            borderColor: requiredPlanMetadata.color,
                            boxShadow: 8,
                            background: (theme) =>
                                `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(requiredPlanMetadata.color, 0.1)} 100%)`
                        }}
                    >
                        {/* Badge "Necessário" */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: -12,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 1
                            }}
                        >
                            <Chip
                                icon={<StarsIcon />}
                                label="NECESSÁRIO"
                                sx={{
                                    bgcolor: requiredPlanMetadata.color,
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '0.75rem',
                                    px: 1
                                }}
                            />
                        </Box>

                        <CardContent sx={{ p: 4, pt: 5 }}>
                            <Box sx={{ textAlign: 'center', mb: 3 }}>
                                <Typography variant="h2" sx={{ mb: 1 }}>
                                    {requiredPlanMetadata.icon}
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: requiredPlanMetadata.color }}>
                  Plano Necessário
                                </Typography>
                                <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 2 }}>
                                    {requiredPlanMetadata.displayName}
                                </Typography>
                                <Typography variant="h6" sx={{ color: requiredPlanMetadata.color, mt: 1, fontWeight: 'bold' }}>
                                    {requiredPlanMetadata.priceFormatted}
                                    {requiredPlanMetadata.billingPeriod && (
                                        <Typography component="span" variant="body2" color="text.secondary">
                      /{requiredPlanMetadata.billingPeriod}
                                        </Typography>
                                    )}
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: requiredPlanMetadata.color }}>
                O que você ganha:
                            </Typography>
                            <List dense>
                                {requiredPlanMetadata.features.slice(0, 6).map((feature, index) => (
                                    <ListItem key={index} sx={{ px: 0 }}>
                                        <ListItemIcon sx={{ minWidth: 36 }}>
                                            <CheckCircleIcon
                                                sx={{ color: requiredPlanMetadata.color, fontSize: '1.25rem' }}
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={feature}
                                            primaryTypographyProps={{
                                                variant: 'body2',
                                                sx: { fontWeight: 500 }
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>

                            <Box sx={{ mt: 4 }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    onClick={handleUpgrade}
                                    endIcon={<ArrowForwardIcon />}
                                    sx={{
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        fontWeight: 'bold',
                                        bgcolor: requiredPlanMetadata.color,
                                        '&:hover': {
                                            bgcolor: requiredPlanMetadata.color,
                                            filter: 'brightness(0.9)'
                                        }
                                    }}
                                >
                  Fazer Upgrade para {requiredPlanMetadata.name}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            )}

            {/* Informações Adicionais */}
            <Paper
                sx={{
                    p: 4,
                    mt: 4,
                    textAlign: 'center',
                    bgcolor: (theme) => alpha(theme.palette.info.main, 0.05),
                    border: 1,
                    borderColor: 'info.main'
                }}
            >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
          💡 Por que fazer upgrade?
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                    {requiredPlanMetadata?.description || 'Desbloqueie recursos exclusivos e tenha acesso completo a todas as funcionalidades da plataforma.'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mt: 3 }}>
                    <Button
                        variant="outlined"
                        onClick={() => router.push('/app/subscription/plans')}
                    >
            Ver Todos os Planos
                    </Button>
                    <Button
                        variant="text"
                        onClick={() => router.push('/app/subscription/manage')}
                    >
            Gerenciar Assinatura
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
}
