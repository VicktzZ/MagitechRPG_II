'use client';

import { useCampaignCurrentCharsheetContext } from '@contexts';
import { useCharsheetSystem } from '@hooks/useCharsheetSystem';
import { Favorite, Shield, WaterDrop } from '@mui/icons-material';
import { color as tokenColor } from '@themes/tokens';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useMemo, type ReactNode } from 'react';
import type { Stats } from '@models';

export type VitalKey = 'lp' | 'mp' | 'ap';

export interface Vital {
    key: VitalKey;
    /** Nome completo, ex.: "Pontos de Vida (LP)" (ou o nome que o sistema customizado dá) */
    label: string;
    /** Sigla curta, para a barra compacta */
    shortLabel: string;
    current: number;
    max: number;
    color: string;
    icon: ReactNode;
}

/**
 * Pontos vitais (vida, mana, armadura) da ficha que está na campanha, respeitando os sistemas
 * customizados que desligam ou renomeiam algum deles, e a função que os altera.
 * Usado pelo cabeçalho do jogador e pela barra fixa que aparece quando ele rola a página.
 */
export function usePlayerVitals() {
    const { charsheet, updateCharsheet } = useCampaignCurrentCharsheetContext();
    const { system: customSystem } = useCharsheetSystem(charsheet?.systemId);
    const stats = charsheet.stats;

    const vitals = useMemo((): Vital[] => {
        const hasLP = !customSystem || (customSystem.pointsConfig?.hasLP ?? customSystem.initialFields?.life?.enabled ?? true);
        const hasMP = !customSystem || (customSystem.pointsConfig?.hasMP ?? customSystem.initialFields?.mana?.enabled ?? true);
        const hasAP = !customSystem || (customSystem.pointsConfig?.hasAP ?? customSystem.initialFields?.armor?.enabled ?? true);
        const lpName = customSystem?.pointsConfig?.lpName || customSystem?.initialFields?.life?.label || 'Vida';
        const mpName = customSystem?.pointsConfig?.mpName || customSystem?.initialFields?.mana?.label || 'Mana';
        const apName = customSystem?.pointsConfig?.apName || customSystem?.initialFields?.armor?.label || 'Armadura';

        const list: Vital[] = [];
        if (hasLP) {
            list.push({
                key: 'lp',
                label: customSystem ? lpName : 'Pontos de Vida (LP)',
                shortLabel: 'LP',
                current: stats.lp,
                max: stats.maxLp,
                color: tokenColor.lp,
                icon: <Favorite fontSize="inherit" />
            });
        }
        if (hasMP) {
            list.push({
                key: 'mp',
                label: customSystem ? mpName : 'Pontos de Mana (MP)',
                shortLabel: 'MP',
                current: stats.mp,
                max: stats.maxMp,
                color: tokenColor.mp,
                icon: <WaterDrop fontSize="inherit" />
            });
        }
        if (hasAP) {
            list.push({
                key: 'ap',
                label: customSystem ? apName : 'Pontos de Armadura (AP)',
                shortLabel: 'AP',
                current: stats.ap,
                max: stats.maxAp,
                color: tokenColor.ap,
                icon: <Shield fontSize="inherit" />
            });
        }
        return list;
    }, [ customSystem, stats.lp, stats.maxLp, stats.mp, stats.maxMp, stats.ap, stats.maxAp ]);

    const update = useCallback((stat: VitalKey, delta: number) => {
        const maxKey = `max${stat.charAt(0).toUpperCase() + stat.slice(1)}` as keyof Stats;
        // Atualiza só o campo alterado: gravar o objeto `stats` inteiro sobrescrevia
        // alterações simultâneas do mestre (ex: dano aplicado no LP enquanto o jogador gasta MP)
        updateCharsheet({
            [`stats.${stat}`]: Math.max(0, Math.min(stats[stat] + delta, stats[maxKey] * 2))
        } as any).catch((error: unknown) => {
            console.error('Erro ao atualizar os pontos da ficha:', error);
            enqueueSnackbar('Não foi possível atualizar a ficha. Tente de novo.', { variant: 'error' });
        });
    }, [ stats, updateCharsheet ]);

    return { charsheet, customSystem, vitals, update };
}
