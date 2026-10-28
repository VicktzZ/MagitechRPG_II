'use client';

import type { Combat } from '@models';
import { Typography } from '@mui/material';
import { hiddenFrom, HIDDEN_CAUSE_LABEL } from '@utils/combat/awareness';
import type { ReactElement } from 'react';

/**
 * Para quem se esconde: "Você está fora da vista de Orc, Goblin (furtivo)". O mestre é quem marca (a matriz de percepção, `utils/combat/awareness.ts`); aqui o jogador só
 * vê a própria situação. Quem **não** vê o personagem não recebe aviso nenhum: nem sabe que está sendo enganado.
 */
export default function HiddenFromNotice({ combat, combatantId }: { combat: Combat; combatantId: string }): ReactElement | null {
    const entries = hiddenFrom(combat.unseen, combatantId);
    if (entries.length === 0) return null;

    const causes = [ ...new Set(entries.map(entry => HIDDEN_CAUSE_LABEL[entry.cause].toLowerCase())) ].join(', ');

    return (
        <Typography variant="caption" component="div" sx={{ color: 'text.secondary', mb: 1.5 }} data-testid="hidden-from-notice">
            Você está fora da vista de {entries.map(entry => entry.observerName).join(', ')} ({causes}). Quem não vê você fica sem esquiva contra os seus ataques.
        </Typography>
    );
}
