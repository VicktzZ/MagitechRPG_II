import type { CharsheetDTO } from '@models/dtos';
import { color } from '@themes/tokens';
import type { useCharsheetPointsView } from '../useCharsheetPointsView';
import type { VitalRow } from './VitalsPanel';

/** As barras de LP, MP e AP da ficha para o painel de dano e cura rápidos (sistema customizado pode desligar ou renomear cada uma) */
export function charsheetVitalRows(charsheet: Pick<CharsheetDTO, 'stats'>, view: ReturnType<typeof useCharsheetPointsView>): VitalRow[] {
    const stats = charsheet.stats;
    const rows: VitalRow[] = [];
    if (view.hasLP) rows.push({ key: 'lp', label: view.customSystem ? view.lpName : 'LP', name: view.lpName, value: stats?.lp ?? 0, max: stats?.maxLp ?? 0, barColor: color.lp });
    if (view.hasMP) rows.push({ key: 'mp', label: view.customSystem ? view.mpName : 'MP', name: view.mpName, value: stats?.mp ?? 0, max: stats?.maxMp ?? 0, barColor: color.mp });
    if (view.hasAP) rows.push({ key: 'ap', label: view.customSystem ? view.apName : 'AP', name: view.apName, value: stats?.ap ?? 0, max: stats?.maxAp ?? 0, barColor: color.ap });
    return rows;
}
