import { ExpandMore } from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    Box,
    Chip,
    Tooltip,
    Typography,
    alpha
} from '@mui/material';
import type { ReactElement } from 'react';
import { getPerkTypeColor, getPerkTypeLabel } from './perkStyle';
import type { PlayerWithPerks } from './usePlayersWithPerks';

interface PerkPlayerAccordionProps {
    player: PlayerWithPerks;
    expanded: boolean;
    onChange: (isExpanded: boolean) => void;
}

/** Acordeão de um jogador: avatar, nome, contagem de vantagens e, ao abrir, um chip por vantagem recebida */
export default function PerkPlayerAccordion({ player, expanded, onChange }: PerkPlayerAccordionProps): ReactElement {
    return (
        <Accordion 
            expanded={expanded}
            onChange={(_, isExpanded) => onChange(isExpanded)}
            sx={{
                borderRadius: 2,
                '&:before': { display: 'none' },
                bgcolor: 'background.raised'
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMore />}
                sx={{ 
                    borderRadius: 2,
                    '&:hover': { bgcolor: 'action.hover' }
                }}
            >
                <Box display="flex" alignItems="center" gap={2} width="100%">
                    <Avatar 
                        src={player.userImage || undefined}
                        sx={{ 
                            width: 44, 
                            height: 44,
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14),
                            color: 'primary.main',
                            fontSize: '1rem',
                            fontWeight: 700,
                            border: '2px solid',
                            borderColor: (theme) => alpha(theme.palette.primary.main, 0.5)
                        }}
                    >
                        {!player.userImage && (player.charsheetName?.charAt(0)?.toUpperCase() || '?')}
                    </Avatar>
                    <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight={600}>
                            {player.charsheetName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Nível {player.level} • {player.userName}
                        </Typography>
                    </Box>
                    <Chip 
                        label={`${player.perks.length} ${player.perks.length === 1 ? 'vantagem' : 'vantagens'}`}
                        size="small"
                        sx={{ 
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14), 
                            color: 'primary.main',
                            fontWeight: 600
                        }}
                    />
                </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
                <Box 
                    sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 1,
                        p: 1,
                        bgcolor: 'background.paper',
                        borderRadius: 1
                    }}
                >
                    {player.perks.map((perk, index) => {
                        const typeColor = getPerkTypeColor(perk.perkType);
                        return (
                            <Tooltip 
                                key={index}
                                title={
                                    <Box>
                                        <Typography variant="subtitle2">{perk.name}</Typography>
                                        {perk.description && (
                                            <Typography variant="caption">{perk.description}</Typography>
                                        )}
                                    </Box>
                                }
                                arrow
                            >
                                <Chip
                                    label={
                                        <Box display="flex" alignItems="center" gap={0.5}>
                                            <Typography variant="caption" fontWeight={600}>
                                                {perk.name}
                                            </Typography>
                                            <Chip 
                                                label={getPerkTypeLabel(perk.perkType)}
                                                size="small"
                                                sx={{ 
                                                    height: 18,
                                                    fontSize: '0.75rem',
                                                    bgcolor: typeColor.bg,
                                                    color: typeColor.color
                                                }}
                                            />
                                            <Chip 
                                                label={getPerkTypeLabel(perk.rarity)}
                                                size="small"
                                                sx={{ 
                                                    height: 18,
                                                    fontSize: '0.75rem',
                                                    bgcolor: typeColor.bg,
                                                    color: typeColor.color
                                                }}
                                            />
                                        </Box>
                                    }
                                    size="medium"
                                    sx={{
                                        bgcolor: 'background.raised',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: 'background.overlay'
                                        }
                                    }}
                                />
                            </Tooltip>
                        );
                    })}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
}
