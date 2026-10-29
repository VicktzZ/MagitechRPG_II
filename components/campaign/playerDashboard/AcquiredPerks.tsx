'use client';

import { useCampaignContext, useCampaignCurrentCharsheetContext } from '@contexts';
import { ExpandLess, ExpandMore, Star } from '@mui/icons-material';
import {
    Badge,
    Box,
    Chip,
    Collapse,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import { useMemo, useState } from 'react';
import { rarityColor } from '@constants';

const rarityColors: Record<string, string> = rarityColor;

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
    const [ expanded, setExpanded ] = useState(false);

    const perks = useMemo(() => {
        if (!charsheet?.session || !campaign?.campaignCode) return [];

        const sessionData = charsheet.session.find(
            s => s.campaignCode === campaign.campaignCode
        );

        return sessionData?.perks || [];
    }, [ charsheet?.session, campaign?.campaignCode ]);

    // Vantagens podem ser oferecidas em qualquer modo. No Roguelite o painel fica
    // sempre visível; nos demais modos só aparece quando há vantagens recebidas.
    if (campaign?.mode !== 'Roguelite' && perks.length === 0) return null;

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
                bgcolor: 'background.overlay',
                border: '1px solid',
                borderColor: 'divider',
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
                    <Star 
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
                            {perks.map((perk, index) => (
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
                                            bgcolor: 'background.raised',
                                            borderLeft: '3px solid',
                                            borderColor: rarityColors[perk.rarity] || rarityColors['Comum'],
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                bgcolor: 'action.hover'
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
                                                fontSize: '0.75rem',
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
