'use client';

import { useCampaignContext, useCampaignCurrentCharsheetContext } from '@contexts';
import {
    AutoAwesome,
    ExpandLess,
    ExpandMore
} from '@mui/icons-material';
import {
    Badge,
    Box,
    Chip,
    Collapse,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material';
import { useMemo, useState } from 'react';

const rarityColors: Record<string, string> = {
    'Comum': '#9e9e9e',
    'Incomum': '#4caf50',
    'Raro': '#2196f3',
    'Épico': '#9c27b0',
    'Lendário': '#ff9800',
    'Único': '#f44336',
    'Mágico': '#00bcd4',
    'Amaldiçoado': '#880e4f',
    'Especial': '#ffd700'
};

const perkTypeLabels: Record<string, string> = {
    'WEAPON': 'Arma',
    'ARMOR': 'Armadura',
    'ITEM': 'Item',
    'SKILL': 'Habilidade',
    'SPELL': 'Magia',
    'BONUS': 'Bônus',
    'EXPERTISE': 'Perícia'
};

export default function AcquiredPerks() {
    const { campaign } = useCampaignContext();
    const { charsheet } = useCampaignCurrentCharsheetContext();
    const theme = useTheme();
    const [expanded, setExpanded] = useState(false);

    const perks = useMemo(() => {
        if (!charsheet?.session || !campaign?.campaignCode) return [];
        
        const sessionData = charsheet.session.find(
            (s: any) => s.campaignCode === campaign.campaignCode
        );

        console.log(sessionData)
        
        return sessionData?.perks || [];
    }, [charsheet?.session, campaign?.campaignCode]);

    // Não mostrar se não for Roguelite ou não houver perks
    if (campaign?.mode !== 'Roguelite') return null;

    return (
        <Paper
            elevation={3}
            sx={{
                position: 'fixed',
                bottom: 16,
                left: 16,
                zIndex: 1000,
                borderRadius: 2,
                overflow: 'hidden',
                minWidth: expanded ? 280 : 'auto',
                maxWidth: 320,
                maxHeight: expanded ? '60vh' : 'auto',
                bgcolor: theme.palette.mode === 'dark' 
                    ? 'rgba(30, 30, 40, 0.95)' 
                    : 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid',
                borderColor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease'
            }}
        >
            {/* Header */}
            <Box
                onClick={() => setExpanded(!expanded)}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1.5,
                    cursor: 'pointer',
                    '&:hover': {
                        bgcolor: 'action.hover'
                    }
                }}
            >
                <Badge 
                    badgeContent={perks.length} 
                    color="primary"
                    max={99}
                >
                    <AutoAwesome 
                        sx={{ 
                            color: 'primary.main',
                            fontSize: '1.3rem'
                        }} 
                    />
                </Badge>
                <Typography 
                    variant="subtitle2" 
                    sx={{ 
                        fontWeight: 600,
                        flex: 1,
                        ml: 0.5
                    }}
                >
                    Vantagens
                </Typography>
                <IconButton size="small" sx={{ p: 0 }}>
                    {expanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
            </Box>

            {/* Lista de Perks */}
            <Collapse in={expanded}>
                <Box
                    sx={{
                        maxHeight: 'calc(60vh - 50px)',
                        overflow: 'auto',
                        px: 1.5,
                        pb: 1.5
                    }}
                >
                    {perks.length === 0 ? (
                        <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ py: 2, textAlign: 'center' }}
                        >
                            Nenhuma vantagem adquirida
                        </Typography>
                    ) : (
                        <Stack spacing={1}>
                            {perks.map((perk: any, index: number) => (
                                <Tooltip 
                                    key={perk.id || index}
                                    title={perk.description || 'Sem descrição'}
                                    placement="right"
                                    arrow
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            p: 1,
                                            borderRadius: 1,
                                            bgcolor: theme.palette.mode === 'dark'
                                                ? 'rgba(255, 255, 255, 0.05)'
                                                : 'rgba(0, 0, 0, 0.03)',
                                            borderLeft: '3px solid',
                                            borderColor: rarityColors[perk.rarity] || rarityColors['Comum'],
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                bgcolor: theme.palette.mode === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.1)'
                                                    : 'rgba(0, 0, 0, 0.06)',
                                                transform: 'translateX(2px)'
                                            }
                                        }}
                                    >
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    fontWeight: 500,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis'
                                                }}
                                            >
                                                {perk.name}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={perkTypeLabels[perk.perkType] || perk.perkType}
                                            size="small"
                                            sx={{
                                                height: 20,
                                                fontSize: '0.65rem',
                                                bgcolor: `${rarityColors[perk.rarity] || rarityColors['Comum']}20`,
                                                color: rarityColors[perk.rarity] || rarityColors['Comum'],
                                                border: '1px solid',
                                                borderColor: `${rarityColors[perk.rarity] || rarityColors['Comum']}40`
                                            }}
                                        />
                                    </Box>
                                </Tooltip>
                            ))}
                        </Stack>
                    )}
                </Box>
            </Collapse>
        </Paper>
    );
}
