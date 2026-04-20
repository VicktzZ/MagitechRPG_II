'use client';

import React from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
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
import type { Permission, SubscriptionPlan } from '@enums/subscriptionEnum';
import { SubscriptionPlanMetadata } from '@enums/subscriptionEnum';

interface UpgradePromptProps {
  requiredPlan: SubscriptionPlan;
  permission?: Permission;
  title?: string;
  description?: string;
  variant?: 'full' | 'compact' | 'inline';
}

/**
 * Componente para exibir prompt de upgrade
 * Uso: Quando o usuário tenta acessar uma funcionalidade bloqueada
 */
export function UpgradePrompt({
    requiredPlan
    ,
    title = 'Recurso Premium',
    description,
    variant = 'full'
}: UpgradePromptProps) {
    const router = useRouter();
    const planMetadata = SubscriptionPlanMetadata[requiredPlan];

    const handleUpgrade = () => {
        router.push(`/app/subscription/checkout?plan=${requiredPlan}`);
    };

    const handleViewPlans = () => {
        router.push('/app/subscription/plans');
    };

    // Variante Inline (para botões)
    if (variant === 'inline') {
        return (
            <Box
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: () => alpha(planMetadata.color, 0.1),
                    border: 1,
                    borderColor: () => alpha(planMetadata.color, 0.3),
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                        bgcolor: () => alpha(planMetadata.color, 0.15),
                        transform: 'translateY(-2px)'
                    }
                }}
                onClick={handleUpgrade}
            >
                <LockIcon sx={{ fontSize: '1.2rem', color: planMetadata.color }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: planMetadata.color }}>
          Requer {planMetadata.name}
                </Typography>
            </Box>
        );
    }

    // Variante Compact (para modais/tooltips)
    if (variant === 'compact') {
        return (
            <Card
                sx={{
                    border: 2,
                    borderColor: planMetadata.color,
                    bgcolor: () => alpha(planMetadata.color, 0.05)
                }}
            >
                <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <LockIcon sx={{ fontSize: 40, color: planMetadata.color }} />
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                {title}
                            </Typography>
                            <Chip
                                label={planMetadata.displayName}
                                size="small"
                                sx={{
                                    bgcolor: planMetadata.color,
                                    color: 'white',
                                    fontWeight: 'bold',
                                    mt: 0.5
                                }}
                            />
                        </Box>
                    </Box>
          
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {description || planMetadata.description}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleUpgrade}
                            fullWidth
                            sx={{
                                bgcolor: planMetadata.color,
                                '&:hover': {
                                    bgcolor: planMetadata.color,
                                    filter: 'brightness(0.9)'
                                }
                            }}
                        >
              Assinar {planMetadata.priceFormatted}
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleViewPlans}
                        >
              Ver Planos
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    // Variante Full (padrão)
    return (
        <Card
            sx={{
                position: 'relative',
                border: 3,
                borderColor: planMetadata.color,
                boxShadow: 8,
                background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(planMetadata.color, 0.1)} 100%)`
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
                    label="UPGRADE NECESSÁRIO"
                    sx={{
                        bgcolor: planMetadata.color,
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        px: 2
                    }}
                />
            </Box>

            <CardContent sx={{ p: 5, pt: 6 }}>
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h2" sx={{ mb: 2 }}>
                        {planMetadata.icon}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: planMetadata.color, mb: 1 }}>
                        {title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {description || `Esta funcionalidade requer o plano ${planMetadata.displayName}`}
                    </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Plano Info */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            {planMetadata.displayName}
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: planMetadata.color, mt: 1 }}>
                            {planMetadata.priceFormatted}
                            {planMetadata.billingPeriod && (
                                <Typography component="span" variant="h6" color="text.secondary">
                  /{planMetadata.billingPeriod}
                                </Typography>
                            )}
                        </Typography>
                    </Box>

                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2, color: planMetadata.color }}>
            O que você ganha com este plano:
                    </Typography>
                    <List>
                        {planMetadata.features.slice(0, 6).map((feature, index) => (
                            <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <CheckCircleIcon
                                        sx={{ color: planMetadata.color, fontSize: '1.25rem' }}
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
                </Box>

                {/* Ações */}
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleUpgrade}
                        endIcon={<ArrowForwardIcon />}
                        fullWidth
                        sx={{
                            py: 1.5,
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            bgcolor: planMetadata.color,
                            '&:hover': {
                                bgcolor: planMetadata.color,
                                filter: 'brightness(0.9)'
                            }
                        }}
                    >
            Assinar {planMetadata.name} - {planMetadata.priceFormatted}
                    </Button>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={handleViewPlans}
                        sx={{
                            py: 1.5,
                            borderColor: planMetadata.color,
                            color: planMetadata.color,
                            '&:hover': {
                                borderColor: planMetadata.color,
                                bgcolor: () => alpha(planMetadata.color, 0.05)
                            }
                        }}
                    >
            Comparar Planos
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}
