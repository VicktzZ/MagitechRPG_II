'use client';

import { AddCircleOutline } from '@mui/icons-material';
import { Box, ButtonBase, IconButton, Tooltip, Typography } from '@mui/material';
import { ACTION_SLOTS, type ActionBudget, type ActionSlot } from '@utils/combat/engine/actionBudget';
import { describePerRound, SLOT_LABEL } from '@utils/combat/actionBudgets';

interface ActionPipsProps {
    budget: ActionBudget;
    /** Clique num espaço; recebe se havia ação disponível. Sem isso, os marcadores são só de leitura */
    onSelect?: (slot: ActionSlot, available: boolean) => void;
    /** Espaço gasto não é clicável (o jogador só gasta; o mestre também devolve) */
    disableSpent?: boolean;
    /** Esperando o servidor: nada é clicável */
    busy?: boolean;
    /** Quantas ações de cada tipo ele recupera por rodada; quando difere do padrão (1 de cada) uma linha embaixo diz */
    perRound?: ActionBudget;
    /** O mestre dá ou tira ações (abre o diálogo "Dar ações"); sem isso não há o botão */
    onGrant?: () => void;
    /** De quem são as ações, para o rótulo acessível do botão de dar ações */
    ownerName?: string;
}

/** Quatro marcadores por rodada: Padrão, Bônus, Movimento e Reação. Cheio = disponível; vazado = gasto; mais de uma ação mostra a quantidade */
export default function ActionPips({ budget, onSelect, disableSpent = false, busy = false, perRound, onGrant, ownerName }: ActionPipsProps) {
    const perRoundText = perRound ? describePerRound(perRound) : '';

    return (
        <Box role="group" aria-label="Ações da rodada" sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {ACTION_SLOTS.map(slot => {
                const count = budget[slot];
                const available = count > 0;
                const label = SLOT_LABEL[slot];
                const interactive = Boolean(onSelect) && !busy && !(disableSpent && !available);
                const state = available ? (count > 1 ? `disponível, ${count}` : 'disponível') : 'gasta';

                return (
                    <ButtonBase
                        key={slot}
                        data-testid={`action-pip-${slot}`}
                        aria-label={`${label}: ${state}`}
                        aria-pressed={onSelect ? available : undefined}
                        disabled={!interactive}
                        onClick={() => onSelect?.(slot, available)}
                        sx={{
                            px: 1,
                            py: 0.25,
                            gap: 0.5,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: available ? 'success.main' : 'divider',
                            bgcolor: available ? 'background.overlay' : 'transparent',
                            color: available ? 'text.primary' : 'text.secondary',
                            textDecoration: available ? 'none' : 'line-through',
                            '&.Mui-disabled': { opacity: available ? 1 : 0.7 },
                            '&:hover': interactive ? { borderColor: 'success.light' } : undefined
                        }}
                    >
                        <Box
                            aria-hidden
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: available ? 'success.main' : 'transparent',
                                border: '1px solid',
                                borderColor: available ? 'success.main' : 'text.secondary'
                            }}
                        />
                        <Typography variant="caption" sx={{ fontSize: 12, fontWeight: 600, lineHeight: 1.5 }}>
                            {label}
                            {count > 1 ? ` ×${count}` : ''}
                        </Typography>
                    </ButtonBase>
                );
            })}
            {onGrant && (
                <Tooltip title="Dar ou tirar ações">
                    <span>
                        <IconButton
                            size="small"
                            onClick={onGrant}
                            disabled={busy}
                            aria-label={ownerName ? `Dar ou tirar ações de ${ownerName}` : 'Dar ou tirar ações'}
                            data-testid="action-pips-grant"
                        >
                            <AddCircleOutline fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            )}
            {perRoundText && (
                <Typography data-testid="action-pips-per-round" sx={{ flexBasis: '100%', fontSize: 12, color: 'text.secondary' }}>
                    Por rodada: <Box component="span" sx={{ color: 'text.primary' }}>{perRoundText}</Box>
                </Typography>
            )}
        </Box>
    );
}
