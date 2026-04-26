'use client';

import React from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Check as CheckIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { SubscriptionPlan, SubscriptionPlanMetadata } from '@enums/subscriptionEnum';

interface ComparisonFeature {
  name: string;
  description?: string;
  freemium: boolean | string;
  premium: boolean | string;
  premiumPlus: boolean | string;
}

const comparisonFeatures: ComparisonFeature[] = [
    {
        name: 'Criação de Personagens',
        description: 'Fichas de personagem ilimitadas',
        freemium: 'Ilimitado',
        premium: 'Ilimitado',
        premiumPlus: 'Ilimitado'
    },
    {
        name: 'Classes e Raças',
        description: 'Acesso a todas as classes e raças padrão',
        freemium: true,
        premium: true,
        premiumPlus: true
    },
    {
        name: 'Sistema de Progressão',
        description: 'Sistema completo de níveis e experiência',
        freemium: true,
        premium: true,
        premiumPlus: true
    },
    {
        name: 'Gerenciamento de Inventário',
        description: 'Controle completo de itens e equipamentos',
        freemium: true,
        premium: true,
        premiumPlus: true
    },
    {
        name: 'Acesso a Campanhas',
        description: 'Criar e participar de campanhas colaborativas',
        freemium: false,
        premium: true,
        premiumPlus: true
    },
    {
        name: 'Chat em Tempo Real',
        description: 'Comunicação durante as sessões',
        freemium: false,
        premium: true,
        premiumPlus: true
    },
    {
        name: 'Gerenciamento de Sessões',
        description: 'Organização de sessões de jogo',
        freemium: false,
        premium: true,
        premiumPlus: true
    },
    {
        name: 'Discord Exclusivo',
        description: 'Acesso à comunidade no Discord',
        freemium: false,
        premium: 'Acesso Padrão',
        premiumPlus: 'Cargo VIP'
    },
    {
        name: 'Sistemas Customizados',
        description: 'Criação de regras e sistemas personalizados',
        freemium: false,
        premium: false,
        premiumPlus: true
    },
    {
        name: 'Classes Personalizadas',
        description: 'Criar suas próprias classes',
        freemium: false,
        premium: false,
        premiumPlus: true
    },
    {
        name: 'Raças Personalizadas',
        description: 'Criar suas próprias raças',
        freemium: false,
        premium: false,
        premiumPlus: true
    },
    {
        name: 'Armazenamento',
        description: 'Espaço para dados e arquivos',
        freemium: '1 GB',
        premium: '5 GB',
        premiumPlus: '20 GB'
    },
    {
        name: 'Suporte',
        description: 'Nível de suporte técnico',
        freemium: 'Comunidade',
        premium: 'Prioritário',
        premiumPlus: 'Premium'
    },
    {
        name: 'Acesso Antecipado',
        description: 'Novos recursos antes do lançamento oficial',
        freemium: false,
        premium: false,
        premiumPlus: true
    },
    {
        name: 'Backup Automático',
        description: 'Backup automático de todos os dados',
        freemium: false,
        premium: false,
        premiumPlus: true
    }
];

export function PlanComparison() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const renderCell = (value: boolean | string) => {
        if (typeof value === 'boolean') {
            return value ? (
                <CheckIcon sx={{ color: 'success.main' }} />
            ) : (
                <CloseIcon sx={{ color: 'text.disabled' }} />
            );
        }
        return (
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {value}
            </Typography>
        );
    };

    if (isMobile) {
        return (
            <Box sx={{ width: '100%' }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
          Comparação Detalhada de Planos
                </Typography>
                {Object.values(SubscriptionPlan).map((plan) => {
                    const metadata = SubscriptionPlanMetadata[plan];
                    return (
                        <Paper key={plan} sx={{ mb: 3, p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Typography variant="h4">{metadata.icon}</Typography>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: metadata.color }}>
                                        {metadata.displayName}
                                    </Typography>
                                    <Typography variant="h6" sx={{ color: metadata.color }}>
                                        {metadata.priceFormatted}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box>
                                {comparisonFeatures.map((feature, index) => {
                                    const value = plan === SubscriptionPlan.FREEMIUM
                                        ? feature.freemium
                                        : plan === SubscriptionPlan.PREMIUM
                                            ? feature.premium
                                            : feature.premiumPlus;

                                    return (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                py: 1,
                                                borderBottom: index < comparisonFeatures.length - 1 ? 1 : 0,
                                                borderColor: 'divider'
                                            }}
                                        >
                                            <Typography variant="body2">{feature.name}</Typography>
                                            {renderCell(value)}
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Paper>
                    );
                })}
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
        Comparação Detalhada de Planos
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', minWidth: 200 }}>
                Recursos
                            </TableCell>
                            {Object.values(SubscriptionPlan).map((plan) => {
                                const metadata = SubscriptionPlanMetadata[plan];
                                return (
                                    <TableCell
                                        key={plan}
                                        align="center"
                                        sx={{
                                            fontWeight: 'bold',
                                            backgroundColor: metadata.color,
                                            color: 'white',
                                            minWidth: 150
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="h4">{metadata.icon}</Typography>
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                                {metadata.displayName}
                                            </Typography>
                                            <Typography variant="h6">
                                                {metadata.priceFormatted}
                                            </Typography>
                                            {metadata.badge && (
                                                <Chip
                                                    label={metadata.badge}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: 'rgba(255,255,255,0.2)',
                                                        color: 'white',
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {comparisonFeatures.map((feature, index) => (
                            <TableRow
                                key={index}
                                sx={{
                                    '&:nth-of-type(odd)': {
                                        backgroundColor: theme.palette.action.hover
                                    }
                                }}
                            >
                                <TableCell>
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {feature.name}
                                        </Typography>
                                        {feature.description && (
                                            <Typography variant="caption" color="text.secondary">
                                                {feature.description}
                                            </Typography>
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell align="center">
                                    {renderCell(feature.freemium)}
                                </TableCell>
                                <TableCell align="center">
                                    {renderCell(feature.premium)}
                                </TableCell>
                                <TableCell align="center">
                                    {renderCell(feature.premiumPlus)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
