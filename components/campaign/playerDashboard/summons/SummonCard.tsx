'use client';

import { Casino, SportsKabaddi } from '@mui/icons-material';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import type { Combatant, Creature } from '@models';
import { color, font } from '@themes/tokens';
import { combatantBudget, combatantPerRound } from '@utils/combat/actionBudgets';
import type { ActionSlot } from '@utils/combat/engine/actionBudget';
import { describeCreatureDice, type CreatureDice } from '@utils/combat/creatureDice';
import { combatantVitals } from '@utils/combatantVitals';
import type { ReactElement } from 'react';
import ActionPips from '../../ActionPips';
import StatMeter from '../../gmDashboard/StatMeter';

interface SummonCardProps {
    summon: Combatant;
    creature?: Creature;
    /** O invocador, para dizer "invocado por X" */
    summonerName?: string;
    /** É a vez dele */
    current: boolean;
    /** O combate está na fase de ação (antes disso não há o que fazer) */
    acting: boolean;
    busyKey: string | null;
    onSpend: (slot: ActionSlot, available: boolean) => void;
    onPassTurn: () => void;
    onRollDice: (dice: CreatureDice) => void;
    onAttack: () => void;
}

/** Um invocado do jogador: vida e mana, ações da rodada, os dados dele para rolar, "Atacar" e "Passar o turno" quando é a vez dele */
export default function SummonCard({ summon, creature, summonerName, current, acting, busyKey, onSpend, onPassTurn, onRollDice, onAttack }: SummonCardProps): ReactElement {
    const vitals = combatantVitals(summon, creature);
    const dices = creature?.dices ?? [];
    const busy = busyKey !== null && busyKey.startsWith(`${summon.id}:`);

    return (
        <Box
            component="li"
            data-testid={`summon-card-${summon.id}`}
            data-current={current ? 'true' : undefined}
            sx={{
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
                p: 1.5,
                border: '1px solid',
                borderColor: current ? 'primary.main' : 'divider',
                borderLeftWidth: current ? 3 : 1,
                borderRadius: 2,
                bgcolor: current ? color.amberSubtle : 'background.raised'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography sx={{ fontWeight: 700 }}>{summon.name}</Typography>
                <Chip size="small" variant="outlined" label={summonerName ? `Invocado por ${summonerName}` : 'Invocado'} sx={{ height: 20, fontSize: 12 }} />
                {current && <Chip size="small" label="Sua vez" sx={{ height: 20, fontSize: 12, fontWeight: 700, bgcolor: 'primary.main', color: color.onAmber }} />}
                <Typography sx={{ fontSize: 12, fontFamily: font.mono, color: 'text.secondary', ml: 'auto' }}>Init {summon.initiativeTotal}</Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: { xs: 1.5, sm: 2 }, maxWidth: 520 }}>
                <StatMeter label="LP" ariaLabel={`Vida de ${summon.name}`} value={vitals.lp} max={vitals.maxLp} barColor={color.lp} />
                <StatMeter label="MP" ariaLabel={`Mana de ${summon.name}`} value={vitals.mp} max={vitals.maxMp} barColor={color.mp} />
            </Box>

            {acting && (
                <ActionPips
                    budget={combatantBudget(summon)}
                    perRound={combatantPerRound(summon)}
                    busy={busy}
                    disableSpent
                    onSelect={onSpend}
                    ownerName={summon.name}
                />
            )}

            {dices.length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap data-testid={`summon-dice-${summon.id}`}>
                    {dices.map(dice => (
                        <Button
                            key={dice.id}
                            size="small"
                            variant="outlined"
                            color="secondary"
                            startIcon={<Casino fontSize="small" />}
                            disabled={busy}
                            onClick={() => { onRollDice(dice); }}
                            aria-label={`Rolar ${dice.name} de ${summon.name}`}
                            sx={{ textTransform: 'none' }}
                        >
                            {`${dice.name} (${describeCreatureDice(dice)})`}
                        </Button>
                    ))}
                </Stack>
            )}

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                    size="small"
                    variant="contained"
                    startIcon={<SportsKabaddi fontSize="small" />}
                    disabled={!acting || busy}
                    onClick={onAttack}
                    aria-label={`Atacar com ${summon.name}`}
                    sx={{ textTransform: 'none' }}
                >
                    Atacar
                </Button>
                {current && (
                    <Button size="small" variant="outlined" disabled={busy} onClick={onPassTurn} aria-label={`Passar o turno de ${summon.name}`} sx={{ textTransform: 'none' }}>
                        Passar o turno
                    </Button>
                )}
            </Box>
        </Box>
    );
}
