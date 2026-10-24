'use client';

import type { Combatant, Creature, Expertise } from '@models';
import { Pets } from '@mui/icons-material';
import { Avatar, Box, Button, Chip, Stack, Typography, alpha } from '@mui/material';
import { color, font } from '@themes/tokens';
import type { ReactElement, ReactNode } from 'react';
import CreatureExpertiseButton from '../../dashboard/CreatureExpertiseButton';
import StatMeter from '../../StatMeter';

function Heading({ children }: { children: ReactNode }): ReactElement {
    return (
        <Typography component="h3" sx={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.secondary', mb: 1 }}>
            {children}
        </Typography>
    );
}

interface CombatantViewProps {
    combatant: Combatant;
    /** A criatura personalizada que o combatente representa; sem ela (foi excluída) só dá para ver o estado no combate */
    creature: Creature | null;
    inTurn: boolean;
    onRollExpertise: (name: string, expertise: Expertise) => Promise<void>;
    /** Abre a ficha da criatura (a janela "Criatura") */
    onOpenCreature?: () => void;
}

/**
 * Uma criatura que está no combate agora: de quem é a vez, vida e mana atuais e as perícias, que o mestre rola pela
 * criatura (resultado no chat). Os valores vêm do combatente, que é onde o combate guarda o que mudou durante a luta.
 */
export function CombatantView({ combatant, creature, inTurn, onRollExpertise, onOpenCreature }: CombatantViewProps): ReactElement {
    const expertises: Array<[ string, Expertise ]> = Object.entries(creature?.expertises ?? {});
    const lp = combatant.currentLp ?? creature?.stats?.lp ?? 0;
    const maxLp = combatant.maxLp ?? creature?.stats?.maxLp ?? creature?.stats?.lp ?? 0;
    const mp = combatant.currentMp ?? creature?.stats?.mp ?? 0;
    const maxMp = combatant.maxMp ?? creature?.stats?.maxMp ?? creature?.stats?.mp ?? 0;
    const name = combatant.name || creature?.name || 'Criatura';

    return (
        <Stack spacing={2.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                    src={creature?.imageUrl || undefined}
                    alt=""
                    sx={{ width: 48, height: 48, bgcolor: theme => alpha(theme.palette.warning.main, inTurn ? 0.28 : 0.14), color: 'warning.main' }}
                >
                    <Pets />
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                        <Typography component="p" sx={{ fontFamily: font.display, fontSize: 18, fontWeight: 600 }}>
                            {name}
                        </Typography>
                        {inTurn && <Chip label="Em turno" size="small" color="primary" />}
                    </Stack>
                    {creature && (
                        <Typography variant="body2" color="text.secondary">
                            Nv. {creature.level}{creature.type ? ` • ${creature.type}` : ''}
                        </Typography>
                    )}
                </Box>
            </Box>

            <Stack spacing={1.25}>
                <StatMeter label="LP" ariaLabel={`Vida de ${name}`} value={lp} max={maxLp} barColor={color.lp} />
                {maxMp > 0 && <StatMeter label="MP" ariaLabel={`Mana de ${name}`} value={mp} max={maxMp} barColor={color.mp} />}
            </Stack>

            <Box>
                <Heading>Perícias</Heading>
                {!creature ? (
                    <Typography variant="body2" color="text.secondary">
                        A criatura que deu origem a este combatente não está mais na campanha, então não há perícias para rolar.
                    </Typography>
                ) : expertises.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">Esta criatura não possui perícias configuradas.</Typography>
                ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 1.5 }}>
                        {expertises.map(([ expertiseName, expertise ]) => (
                            <CreatureExpertiseButton
                                key={`${combatant.id}-${expertiseName}`}
                                name={expertiseName}
                                expertise={expertise}
                                onRoll={async () => await onRollExpertise(expertiseName, expertise)}
                            />
                        ))}
                    </Box>
                )}
            </Box>

            {creature && onOpenCreature && (
                <Box>
                    <Button variant="outlined" size="small" onClick={onOpenCreature}>Ver ficha da criatura</Button>
                </Box>
            )}
        </Stack>
    );
}
