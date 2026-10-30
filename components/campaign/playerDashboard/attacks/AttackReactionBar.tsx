'use client';

import { Bolt } from '@mui/icons-material';
import { Box, Button, Chip, Tooltip, Typography } from '@mui/material';
import { describeReaction, type ReactionOption } from '@utils/combat/attackReactions';
import type { PendingAttackData } from '@utils/combat/pendingAttacks';
import type { PassiveDef } from '@utils/combat/passives';
import type { ReactElement } from 'react';

interface AttackReactionBarProps {
    attack: PendingAttackData;
    options: readonly ReactionOption[];
    /** Chave (`ataque:habilidade`) da reação em andamento */
    busyKey: string | null;
    onReact: (attack: PendingAttackData, ability: PassiveDef) => void;
}

/**
 * "Reagir": as habilidades de reação do personagem contra esse ataque, antes de o mestre resolver. Quem já reagiu mostra o que a reação faz; as que não se aplicam ficam
 * desabilitadas com o motivo. Sem nenhuma habilidade de reação na ficha e sem reação declarada, não desenha nada.
 */
export default function AttackReactionBar({ attack, options, busyKey, onReact }: AttackReactionBarProps): ReactElement | null {
    const declared = attack.reactions ?? [];
    if (options.length === 0 && declared.length === 0) return null;

    return (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mt: 1 }} data-testid={`reaction-bar-${attack.id}`}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Reagir:</Typography>
            {declared.map(reaction => (
                <Chip key={reaction.id} size="small" color="success" variant="outlined" label={describeReaction(reaction)} data-testid={`declared-reaction-${reaction.key}`} />
            ))}
            {options.filter(option => !option.reacted).map(option => {
                const busy = busyKey === `${attack.id}:${option.def.key}`;
                return (
                    <Tooltip key={option.def.key} title={option.plan.ok ? option.hint : (option.plan.reason ?? option.hint)}>
                        <span>
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<Bolt fontSize="small" />}
                                disabled={!option.plan.ok || busyKey !== null}
                                onClick={() => { onReact(attack, option.def); }}
                                sx={{ textTransform: 'none' }}
                                data-testid={`react-${option.def.key}`}
                                aria-busy={busy}
                            >
                                {busy ? 'Reagindo...' : option.def.name}
                            </Button>
                        </span>
                    </Tooltip>
                );
            })}
        </Box>
    );
}
