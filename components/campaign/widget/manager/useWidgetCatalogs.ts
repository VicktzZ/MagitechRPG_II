import { useEffect, useMemo, useState } from 'react';
import { useCampaignContext } from '@contexts';
import type { Armor, Item, Weapon } from '@models';
import type { RPGSystem } from '@models/entities';
import { defaultItems } from '@constants/defaultItems';
import { defaultWeapons } from '@constants/defaultWeapons';
import { defaultArmors } from '@constants/defaultArmors';

/** Item do catálogo usado como atalho para preencher receitas de crafting */
export interface CatalogItem {
    name: string;
    weight?: number;
    description?: string;
}

export interface WidgetCatalogs {
    catalogItemNames: string[];
    findCatalogItem: (name: string) => CatalogItem | undefined;
    catalogWeapons: Array<Partial<Weapon>>;
    catalogArmors: Array<Partial<Armor>>;
}

/**
 * Catálogos de itens, armas e armaduras já estabelecidos (itens padrão da aplicação +
 * sistema customizado + criados na campanha), usados no crafting do diálogo de widgets.
 */
export function useWidgetCatalogs(open: boolean): WidgetCatalogs {
    const { campaign } = useCampaignContext();
    const [ systemCustomItems, setSystemCustomItems ] = useState<Array<Partial<Item>>>([]);
    const [ systemCustomWeapons, setSystemCustomWeapons ] = useState<Array<Partial<Weapon>>>([]);
    const [ systemCustomArmors, setSystemCustomArmors ] = useState<Array<Partial<Armor>>>([]);

    // Catálogo de itens/armas/armaduras já estabelecidos (do sistema customizado +
    // criados na campanha), usados como atalho para preencher o crafting sem digitar tudo.
    useEffect(() => {
        if (!open || !campaign.systemId) {
            setSystemCustomItems([]);
            setSystemCustomWeapons([]);
            setSystemCustomArmors([]);
            return;
        }
        fetch(`/api/rpg-system/${campaign.systemId}`)
            .then(async res => await res.json())
            .then((data: RPGSystem) => {
                setSystemCustomItems(data.customItems?.items ?? []);
                setSystemCustomWeapons(data.customItems?.weapons ?? []);
                setSystemCustomArmors(data.customItems?.armors ?? []);
            })
            .catch(() => {
                setSystemCustomItems([]);
                setSystemCustomWeapons([]);
                setSystemCustomArmors([]);
            });
    }, [ open, campaign.systemId ]);

    // Catálogo combinado: itens padrão da aplicação + do sistema customizado + criados na campanha
    const catalogItems = useMemo(() => {
        const fromCampaign = campaign.custom?.items?.item ?? [];
        const fromDefaults = [ ...defaultItems.scientific, ...defaultItems.magical ];
        const combined = [ ...fromCampaign, ...systemCustomItems, ...fromDefaults ];
        const seen = new Set<string>();
        const result: CatalogItem[] = [];
        combined.forEach(item => {
            const name = item?.name?.trim();
            if (!name || seen.has(name.toLowerCase())) return;
            seen.add(name.toLowerCase());
            result.push({ name, weight: item.weight, description: item.description });
        });
        return result.sort((a, b) => a.name.localeCompare(b.name));
    }, [ campaign.custom?.items?.item, systemCustomItems ]);

    const catalogItemNames = useMemo(() => catalogItems.map(i => i.name), [ catalogItems ]);
    const findCatalogItem = (name: string) => catalogItems.find(i => i.name.toLowerCase() === name.trim().toLowerCase());

    // Catálogos de armas e armaduras (mesmas três fontes), para receitas que produzem equipamento
    const catalogWeapons = useMemo(() => {
        const fromCampaign = campaign.custom?.items?.weapon ?? [];
        const fromDefaults = Object.values(defaultWeapons).flat();
        const combined = [ ...fromCampaign, ...systemCustomWeapons, ...fromDefaults ];
        const seen = new Set<string>();
        const result: Array<Partial<Weapon>> = [];
        combined.forEach(w => {
            const name = w?.name?.trim();
            if (!name || seen.has(name.toLowerCase())) return;
            seen.add(name.toLowerCase());
            result.push(w);
        });
        return result.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    }, [ campaign.custom?.items?.weapon, systemCustomWeapons ]);

    const catalogArmors = useMemo(() => {
        const fromCampaign = campaign.custom?.items?.armor ?? [];
        const fromDefaults = Object.values(defaultArmors).flat();
        const combined = [ ...fromCampaign, ...systemCustomArmors, ...fromDefaults ];
        const seen = new Set<string>();
        const result: Array<Partial<Armor>> = [];
        combined.forEach(a => {
            const name = a?.name?.trim();
            if (!name || seen.has(name.toLowerCase())) return;
            seen.add(name.toLowerCase());
            result.push(a);
        });
        return result.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
    }, [ campaign.custom?.items?.armor, systemCustomArmors ]);

    return { catalogItemNames, findCatalogItem, catalogWeapons, catalogArmors };
}
