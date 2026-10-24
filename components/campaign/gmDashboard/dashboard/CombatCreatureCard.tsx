import type { Expertise } from '@models';
import { combatantVitals } from '@utils/combatantVitals';
import { OpenInNew, Pets } from '@mui/icons-material';
import { Avatar, Box, Chip, IconButton, Paper, Stack, Tooltip, Typography, alpha } from '@mui/material';
import type { ReactElement } from 'react';
import type { CombatCreatureEntry } from './useCombatCreatures';
import CreatureExpertiseButton from './CreatureExpertiseButton';

interface CombatCreatureCardProps extends CombatCreatureEntry {
    /** Último card da lista: sem margem inferior */
    isLast: boolean;
    /** Abre a criatura numa janela flutuante do mestre */
    onOpenWindow: () => void;
    onRollExpertise: (expertiseName: string, expertise: Expertise) => Promise<void>;
}

/** Cartão de uma criatura em combate: nome, LP/MP atuais e as perícias, com destaque quando é a vez dela */
export default function CombatCreatureCard({ combatant, creature, isCurrentTurn, isLast, onOpenWindow, onRollExpertise }: CombatCreatureCardProps): ReactElement {
    const expertisesEntries: Array<[ string, Expertise ]> = Object.entries(creature.expertises || {});
    const { lp: currentLp, maxLp, mp: currentMp, maxMp } = combatantVitals(combatant, creature);

    return (
        <Paper
            sx={{
                p: 2,
                mb: !isLast ? 2 : 0,
                border: isCurrentTurn ? '3px solid' : '1px solid',
                borderColor: isCurrentTurn ? 'warning.main' : 'divider',
                borderRadius: 2,
                bgcolor: isCurrentTurn 
                    ? (theme) => alpha(theme.palette.warning.main, 0.12)
                    : 'background.raised',
                position: 'relative',
                '&::before': isCurrentTurn ? {
                    content: '"Vez desta criatura"',
                    position: 'absolute',
                    top: -12,
                    left: 16,
                    bgcolor: 'warning.main',
                    color: 'warning.contrastText',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    zIndex: 1
                } : {}
            }}
        >
            <Stack spacing={2}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ 
                        bgcolor: (theme) => alpha(theme.palette.warning.main, isCurrentTurn ? 0.28 : 0.14), 
                        color: 'warning.main',
                        border: isCurrentTurn ? '2px solid' : 'none',
                        borderColor: 'warning.main'
                    }}>
                        <Pets />
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                            {combatant?.name || creature.name}
                            {isCurrentTurn && (
                                <Chip 
                                    label="EM TURNO" 
                                    size="small" 
                                    sx={{ 
                                        ml: 1, 
                                        bgcolor: 'warning.main', 
                                        color: 'warning.contrastText',
                                        fontWeight: 700,
                                        fontSize: '0.75rem'
                                    }} 
                                />
                            )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Nível {creature.level} • LP {currentLp}/{maxLp} • MP {currentMp}/{maxMp}
                        </Typography>
                    </Box>
                    <Tooltip title="Abrir em janela">
                        <IconButton size="small" aria-label={`Abrir ${combatant?.name || creature.name} em janela`} onClick={onOpenWindow}>
                            <OpenInNew fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Lista de Perícias da Criatura */}
                {expertisesEntries.length === 0 ? (
                    <Paper 
                        sx={{ 
                            p: 2, 
                            textAlign: 'center',
                            border: '2px dashed',
                            borderColor: 'divider',
                            bgcolor: 'transparent'
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Esta criatura não possui perícias configuradas.
                        </Typography>
                    </Paper>
                ) : (
                    <Box 
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: 'repeat(2, 1fr)',
                                sm: 'repeat(3, 1fr)',
                                md: 'repeat(4, 1fr)'
                            },
                            gap: 1.5
                        }}
                    >
                        {expertisesEntries.map(([ nome, expertise ]) => (
                            <CreatureExpertiseButton
                                key={`${combatant.id}-${nome}`}
                                name={nome}
                                expertise={expertise}
                                onRoll={async () => await onRollExpertise(nome, expertise)}
                            />
                        ))}
                    </Box>
                )}
            </Stack>
        </Paper>
    );
}
