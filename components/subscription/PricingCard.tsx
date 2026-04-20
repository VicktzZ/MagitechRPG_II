'use client';

import React from 'react';
import {
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip,
    Divider,
    alpha
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Stars as StarsIcon
} from '@mui/icons-material';
import { SubscriptionPlan, SubscriptionPlanMetadata } from '@enums/subscriptionEnum';

interface PricingCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan?: boolean;
  onSelect?: (plan: SubscriptionPlan) => void;
  disabled?: boolean;
  loading?: boolean;
}

export function PricingCard({
    plan,
    isCurrentPlan = false,
    onSelect,
    disabled = false,
    loading = false
}: PricingCardProps) {
    const metadata = SubscriptionPlanMetadata[plan];
    const isPopular = metadata.popular;

    const handleSelect = () => {
        if (onSelect && !disabled && !isCurrentPlan) {
            onSelect(plan);
        }
    };

    return (
        <Card
            sx={{
                position: 'relative',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: isPopular ? 3 : 1,
                borderColor: isPopular ? 'primary.main' : 'divider',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                    transform: !disabled ? 'translateY(-8px)' : 'none',
                    boxShadow: !disabled ? 8 : 1
                },
                background: isCurrentPlan 
                    ? (theme) => alpha(theme.palette.primary.main, 0.05)
                    : 'background.paper'
            }}
        >
            {/* Badge */}
            {(isPopular || isCurrentPlan) && (
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
                        icon={isPopular ? <StarsIcon /> : undefined}
                        label={isCurrentPlan ? 'PLANO ATUAL' : metadata.badge}
                        color={isCurrentPlan ? 'success' : 'primary'}
                        size="small"
                        sx={{
                            fontWeight: 'bold',
                            fontSize: '0.75rem',
                            px: 1
                        }}
                    />
                </Box>
            )}

            <CardContent sx={{ flexGrow: 1, pt: isPopular || isCurrentPlan ? 4 : 2 }}>
                {/* Ícone e Nome do Plano */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography
                        variant="h2"
                        sx={{ fontSize: '3rem', mb: 1 }}
                    >
                        {metadata.icon}
                    </Typography>
                    <Typography
                        variant="h5"
                        component="h2"
                        gutterBottom
                        sx={{
                            fontWeight: 'bold',
                            color: metadata.color
                        }}
                    >
                        {metadata.displayName}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                    >
                        {metadata.description}
                    </Typography>
                </Box>

                {/* Preço */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography
                        variant="h3"
                        component="div"
                        sx={{
                            fontWeight: 'bold',
                            color: metadata.color,
                            display: 'flex',
                            alignItems: 'baseline',
                            justifyContent: 'center',
                            gap: 0.5
                        }}
                    >
                        {metadata.priceFormatted}
                        {metadata.billingPeriod && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                component="span"
                            >
                /{metadata.billingPeriod}
                            </Typography>
                        )}
                    </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Recursos */}
                <List dense>
                    {metadata.features.map((feature, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                                <CheckCircleIcon
                                    sx={{ color: 'success.main', fontSize: '1.25rem' }}
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

                {/* Limitações */}
                {metadata.limitations && metadata.limitations.length > 0 && (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <List dense>
                            {metadata.limitations.map((limitation, index) => (
                                <ListItem key={index} sx={{ px: 0 }}>
                                    <ListItemIcon sx={{ minWidth: 36 }}>
                                        <CancelIcon
                                            sx={{ color: 'text.disabled', fontSize: '1.25rem' }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={limitation}
                                        primaryTypographyProps={{
                                            variant: 'body2',
                                            color: 'text.secondary',
                                            sx: { fontWeight: 400 }
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </>
                )}
            </CardContent>

            {/* Ações */}
            <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                    fullWidth
                    variant={isCurrentPlan ? 'outlined' : 'contained'}
                    size="large"
                    onClick={handleSelect}
                    disabled={disabled || isCurrentPlan}
                    sx={{
                        py: 1.5,
                        fontWeight: 'bold',
                        backgroundColor: !isCurrentPlan ? metadata.color : undefined,
                        '&:hover': {
                            backgroundColor: !isCurrentPlan ? metadata.color : undefined,
                            filter: 'brightness(0.9)'
                        }
                    }}
                >
                    {loading
                        ? 'Processando...'
                        : isCurrentPlan
                            ? 'Plano Atual'
                            : plan === SubscriptionPlan.FREEMIUM
                                ? 'Começar Grátis'
                                : 'Assinar Agora'}
                </Button>
            </CardActions>
        </Card>
    );
}
