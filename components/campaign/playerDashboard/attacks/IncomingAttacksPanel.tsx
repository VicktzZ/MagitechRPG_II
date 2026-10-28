'use client';

import { Casino } from '@mui/icons-material';
import { Alert, Box, Button, Stack, Tooltip, Typography } from '@mui/material';
import { font } from '@themes/tokens';
import { DODGE_BLOCK_TEXT, dodgeEligibility, effectiveDamageKind, type DefenseChoice } from '@utils/combat/engine/defense';
import { defenseSkillFor, describeDefense, type PendingAttackData } from '@utils/combat/pendingAttacks';
import type { ReactElement } from 'react';

interface IncomingAttacksPanelProps {
    /** Ataques ao personagem que esperam a defesa dele */
    awaiting: readonly PendingAttackData[];
    /** Ataques que ele já respondeu e esperam o mestre */
    answered: readonly PendingAttackData[];
    /** O personagem ainda tem a Reação da rodada (a esquiva gasta) */
    hasReaction: boolean;
    /** O personagem não via quem atacou (matriz de percepção do mestre): ataque de surpresa não se esquiva */
    isSurprised?: (attack: PendingAttackData) => boolean;
    busyId: string | null;
    onDefend: (attack: PendingAttackData, choice: DefenseChoice) => void;
}

const attackLabel = (attack: PendingAttackData): string => `${attack.name}${attack.attackType ? ` · ${attack.attackType}` : ''}`;

/**
 * "Você foi atacado": o jogador alvo de um ataque assistido escolhe a defesa e rola na hora (esquiva, resistência ou nenhuma). Mostra só o que ele já viu no chat
 * (quem atacou, o ataque e o total): fraqueza e resistências são do mestre, então não há DT aqui. Quem decide o resultado é o mestre.
 */
export default function IncomingAttacksPanel({ awaiting, answered, hasReaction, isSurprised, busyId, onDefend }: IncomingAttacksPanelProps): ReactElement | null {
    if (awaiting.length === 0 && answered.length === 0) return null;

    return (
        <Stack spacing={1} sx={{ mb: 1.5 }} data-testid="incoming-attacks">
            {awaiting.map(attack => {
                const kind = effectiveDamageKind(attack.kind, attack.attackType);
                const dodge = dodgeEligibility({ kind, areaMeters: attack.areaMeters, hasReaction, surprised: isSurprised?.(attack) ?? false });
                const resistSkill = defenseSkillFor(attack, 'resist');
                const busy = busyId === attack.id;

                return (
                    <Alert key={attack.id} severity="warning" icon={false} sx={{ py: 0.5 }} data-testid={`incoming-attack-${attack.id}`}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {attack.attackerName} atacou você
                        </Typography>
                        <Typography variant="caption" component="div" sx={{ color: 'text.secondary', mb: 1 }}>
                            {attackLabel(attack)} · total <span style={{ fontFamily: font.mono }}>{attack.attackTotal}</span>
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Tooltip
                                title={dodge.allowed
                                    ? 'Reflexos maior que o total do ataque anula o dano e gasta a sua Reação'
                                    : `Esquiva indisponível: ${dodge.reason ? DODGE_BLOCK_TEXT[dodge.reason] : ''}`}
                            >
                                <span>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<Casino fontSize="small" />}
                                        disabled={busy || !dodge.allowed}
                                        onClick={() => { onDefend(attack, 'dodge'); }}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Esquivar (Reflexos)
                                    </Button>
                                </span>
                            </Tooltip>
                            <Tooltip title="Teste de resistência: passando, o dano cai">
                                <span>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<Casino fontSize="small" />}
                                        disabled={busy}
                                        onClick={() => { onDefend(attack, 'resist'); }}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        Resistir ({resistSkill})
                                    </Button>
                                </span>
                            </Tooltip>
                            <Button
                                size="small"
                                color="inherit"
                                disabled={busy}
                                onClick={() => { onDefend(attack, 'none'); }}
                                sx={{ textTransform: 'none' }}
                            >
                                Não me defender
                            </Button>
                        </Box>
                    </Alert>
                );
            })}

            {answered.map(attack => (
                <Typography key={attack.id} variant="caption" component="div" sx={{ color: 'text.secondary' }} data-testid={`answered-attack-${attack.id}`}>
                    {attack.attackerName} · {attackLabel(attack)}: sua defesa ({attack.defense ? describeDefense(attack.defense) : ''}), aguardando o mestre.
                </Typography>
            ))}
        </Stack>
    );
}
