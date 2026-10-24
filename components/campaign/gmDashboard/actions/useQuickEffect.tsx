'use client';

import { useState, type ReactElement } from 'react';
import ApplyEffectDialog from './ApplyEffectDialog';

export interface QuickEffectTarget {
    /** Id do combatente (a ficha, para jogador; o id da criatura no combate, para criatura) */
    id: string;
    name: string;
}

interface QuickEffect {
    /** Abre o diálogo de efeitos já com o alvo escolhido, sem passar pelo diálogo de combate */
    openEffectFor: (target: QuickEffectTarget) => void;
    /** Quem usa o hook precisa renderizar isto */
    effectDialog: ReactElement;
}

/** Aplicar um efeito de combate direto de um cartão ou janela do mestre (antes só pelo diálogo de combate) */
export function useQuickEffect(campaignId: string): QuickEffect {
    const [ target, setTarget ] = useState<QuickEffectTarget | null>(null);

    return {
        openEffectFor: setTarget,
        effectDialog: (
            <ApplyEffectDialog
                open={Boolean(target)}
                onClose={() => { setTarget(null); }}
                campaignId={campaignId}
                target={target}
                appliedByName="GM"
            />
        )
    };
}
