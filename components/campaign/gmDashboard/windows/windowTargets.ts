import type { Campaign } from '@models/entities';
import { creatureCombatants } from '@utils/combatCreatureLookup';
import { windowTargetOf, type WindowKind, type WindowTarget } from './windowKinds';

/** Texto para quando o alvo da janela já não existe (ficha removida, criatura excluída, combate encerrado) */
export const WINDOW_TARGET_UNAVAILABLE: Record<WindowTarget, string> = {
    sheet: 'ficha indisponível',
    creature: 'criatura indisponível',
    combatant: 'combatente indisponível'
};

interface WindowTargetSources {
    charsheets: Array<{ id: string; name: string }>;
    campaign: Pick<Campaign, 'custom' | 'session'> | null | undefined;
}

/** Nome do que a janela mostra (ficha, criatura personalizada ou combatente), para o título */
export function windowTargetName(kind: WindowKind, targetId: string, { charsheets, campaign }: WindowTargetSources): string {
    const target = windowTargetOf(kind);

    let name: string | undefined;
    if (target === 'sheet') name = charsheets.find(sheet => sheet.id === targetId)?.name;
    else if (target === 'creature') name = campaign?.custom?.creatures?.find(creature => creature.id === targetId)?.name;
    else name = campaign?.session?.combat?.combatants?.find(combatant => combatant.id === targetId)?.name;

    return name || WINDOW_TARGET_UNAVAILABLE[target];
}

/**
 * Alvos de janela de criatura que existem agora na campanha: as criaturas personalizadas e os combatentes que são
 * criaturas (só com o combate ativo; combate encerrado não deixa janela de combatente). O provedor das janelas usa
 * isso para fechar as janelas de quem saiu.
 */
export function creatureWindowTargets(campaign: Pick<Campaign, 'custom' | 'session'> | null | undefined): {
    creatureIds: string[];
    combatantIds: string[];
} {
    const creatures = campaign?.custom?.creatures;
    const combat = campaign?.session?.combat;

    return {
        creatureIds: (Array.isArray(creatures) ? creatures : []).map(creature => creature.id),
        combatantIds: combat?.isActive ? creatureCombatants(combat.combatants).map(combatant => combatant.id) : []
    };
}
