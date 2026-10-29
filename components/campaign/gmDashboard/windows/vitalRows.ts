import type { AppliedEffect } from '@models';
import type { CharsheetDTO } from '@models/dtos';
import { color } from '@themes/tokens';
import { effectiveMaxVital } from '@utils/combat/effectStats';
import { collectModifiers } from '@utils/combat/engine/modifiers';
import type { useCharsheetPointsView } from '../useCharsheetPointsView';
import type { VitalRow } from './VitalsPanel';

/**
 * As barras de LP, MP e AP da ficha para o painel de dano e cura rápidos (sistema customizado pode desligar ou renomear cada uma). Com `effects` (os do combatente,
 * só em combate ativo) o máximo de LP e MP é o de agora, depois de Fragilidade e afins: o valor gravado na ficha não muda.
 */
export function charsheetVitalRows(
    charsheet: Pick<CharsheetDTO, 'stats'>,
    view: ReturnType<typeof useCharsheetPointsView>,
    effects?: readonly AppliedEffect[] | null
): VitalRow[] {
    const stats = charsheet.stats;
    const modifiers = collectModifiers(effects);
    const rows: VitalRow[] = [];
    const lpMax = effectiveMaxVital(stats?.maxLp ?? 0, modifiers, 'lp');
    const mpMax = effectiveMaxVital(stats?.maxMp ?? 0, modifiers, 'mp');
    if (view.hasLP) rows.push({ key: 'lp', label: view.customSystem ? view.lpName : 'LP', name: view.lpName, value: stats?.lp ?? 0, max: lpMax, barColor: color.lp });
    if (view.hasMP) rows.push({ key: 'mp', label: view.customSystem ? view.mpName : 'MP', name: view.mpName, value: stats?.mp ?? 0, max: mpMax, barColor: color.mp });
    if (view.hasAP) rows.push({ key: 'ap', label: view.customSystem ? view.apName : 'AP', name: view.apName, value: stats?.ap ?? 0, max: stats?.maxAp ?? 0, barColor: color.ap });
    return rows;
}
