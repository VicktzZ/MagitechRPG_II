'use client';

import { useCampaignCurrentCharsheetContext } from '@contexts';
import type { Combat } from '@models';
import type { SpellDTO } from '@models/dtos';
import { reactionEntriesFor } from '@utils/combat/reactions';
import { normalizeToArray } from '@utils/normalizeToArray';
import { useEffect, useMemo, useRef, type ReactElement } from 'react';
import { SHOW_REACTION_TILES_EVENT } from './events';
import ReactionOffersPanel from './ReactionOffersPanel';
import { useReactions } from './useReactions';

/**
 * As ofertas de reação do personagem do jogador (ver `ReactionOffersPanel`). `onFresh` avisa uma vez por oferta nova, para o card de combate abrir e dar o aviso
 * (a reação acontece no turno dos outros, então o card pode estar recolhido).
 */
export default function ReactionOffers({ combat, combatantId, onFresh }: { combat: Combat; combatantId: string; onFresh?: (text: string) => void }): ReactElement | null {
    const { charsheet } = useCampaignCurrentCharsheetContext();
    const { dismiss } = useReactions();
    const spells = useMemo(() => normalizeToArray<SpellDTO>(charsheet?.spells).filter(spell => typeof spell === 'object' && spell !== null), [ charsheet?.spells ]);
    const entries = reactionEntriesFor(combat.reactions, combatantId, spells);

    const notified = useRef<Set<string>>(new Set());
    const ids = entries.map(entry => entry.offer.id).join(',');
    useEffect(() => {
        const fresh = entries.filter(entry => !notified.current.has(entry.offer.id));
        if (fresh.length === 0) return;
        fresh.forEach(entry => notified.current.add(entry.offer.id));
        onFresh?.(fresh[0]!.offer.text);
        // entries muda de identidade a cada render; o que interessa são os ids
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ ids ]);

    return (
        <ReactionOffersPanel
            entries={entries}
            onReact={() => { window.dispatchEvent(new CustomEvent(SHOW_REACTION_TILES_EVENT)); }}
            onDismiss={(id) => { void dismiss(id); }}
        />
    );
}
