'use client';

import { useCampaignContext } from '@contexts';
import { usePlayerAwareness } from '@hooks/usePlayerAwareness';
import { Typography } from '@mui/material';
import { HIDDEN_CAUSE_LABEL } from '@utils/combat/awareness';
import type { HiddenNotice } from '@utils/combat/awarenessSecrets';
import type { ReactElement } from 'react';

/** O aviso, já com os dados: quem se esconde sabe de quem está fora da vista, e só ele */
export function HiddenFromNoticeView({ notices }: { notices: readonly HiddenNotice[] }): ReactElement | null {
    if (notices.length === 0) return null;

    const causes = [ ...new Set(notices.map(notice => HIDDEN_CAUSE_LABEL[notice.cause].toLowerCase())) ].join(', ');

    return (
        <Typography variant="caption" component="div" sx={{ color: 'text.secondary', mb: 1.5 }} data-testid="hidden-from-notice">
            Você está fora da vista de {notices.map(notice => notice.observerName).join(', ')} ({causes}). Quem não vê você fica sem esquiva contra os seus ataques.
        </Typography>
    );
}

/**
 * Para quem se esconde: "Você está fora da vista de Orc, Goblin (furtivo)". O mestre é quem marca (a matriz de percepção, `utils/combat/awareness.ts`), e ela é **segredo dele**: não mora
 * no documento da campanha. O servidor deixa para o jogador escondido só o recorte dele (`campaigns/{id}/playerData/{userId}`, `usePlayerAwareness`). Quem **não** vê o personagem não
 * recebe aviso nenhum: nem sabe que está sendo enganado.
 */
export default function HiddenFromNotice({ combatantId }: { combatantId: string }): ReactElement | null {
    const { campaign } = useCampaignContext();
    const notices = usePlayerAwareness({ campaignId: campaign?.id, enabled: Boolean(campaign?.session?.combat?.isActive) });

    return <HiddenFromNoticeView notices={notices.filter(notice => notice.hiderId === combatantId)} />;
}
