import type { Item, Weapon } from '@models';
import type { SpellDTO } from '@models/dtos';
import { getSpellCategories } from '@utils/spellCategory';
import { normalizeSearchText } from '@utils/searchText';
import { canSpend, executionSlot, type ActionBudget } from './engine/actionBudget';
import { isOpportunityWeapon } from './opportunities';

/**
 * Os "quadrados" da seção Ações do painel do jogador (estilo hotbar): tudo que o personagem pode fazer em combate, separado em **Ataque**, **Cura** e **Outros**, cada um
 * com a ação que gasta (Padrão, Movimento, Bônus, Reação ou Completa). Puro: a tela só desenha o que sai daqui.
 *  - Ataque: todas as armas, as magias da categoria Ataque e os itens de arremesso;
 *  - Cura: as magias da categoria Cura ou Recuperação (devolvem LP ou MP) e os itens que curam;
 *  - Outros: o resto das magias e os itens que se usam e não entram nas duas.
 * Uma magia que é de duas categorias (Ataque/Cura) aparece nas duas.
 */

export type TileCategory = 'attack' | 'heal' | 'other';

export const TILE_CATEGORIES: readonly TileCategory[] = [ 'attack', 'heal', 'other' ];

export const TILE_CATEGORY_LABEL: Record<TileCategory, string> = { attack: 'Ataque', heal: 'Cura', other: 'Outros' };

/** A ação que o quadrado gasta, na ordem do filtro da seção */
export type TileExecution = 'Padrão' | 'Movimento' | 'Bônus' | 'Reação' | 'Completa';

export const TILE_EXECUTIONS: readonly TileExecution[] = [ 'Padrão', 'Movimento', 'Bônus', 'Reação', 'Completa' ];

/** A execução do catálogo ("padrão", "Livre", "Bônus"...) na forma que o filtro usa; `null` se não se reconhece */
export function tileExecution(execution: unknown): TileExecution | null {
    switch (executionSlot(execution)) {
    case 'padrao': return 'Padrão';
    case 'bonus': return 'Bônus';
    case 'movimento': return 'Movimento';
    case 'reacao': return 'Reação';
    case 'completa': return 'Completa';
    default: return null;
    }
}

interface TileBase {
    /** Chave estável do quadrado (a mesma magia em duas categorias tem dois quadrados) */
    id: string;
    category: TileCategory;
    name: string;
    /** A ação que ele gasta; `null` se a execução da magia não é reconhecida (não há o que gastar) */
    execution: TileExecution | null;
    /** Texto curto sob o nome: dano da arma, custo de MP da magia, tipo do item */
    detail: string;
}

export type ActionTile =
    | (TileBase & { kind: 'weapon'; weapon: Weapon })
    | (TileBase & { kind: 'spell'; spell: SpellDTO })
    | (TileBase & { kind: 'item'; item: Item });

export type TileKind = ActionTile['kind'];

/** Categorias de uma magia: Ataque, Cura (inclui Recuperação de MP) ou, se nenhuma das duas, Outros */
export function spellTileCategories(spell: { type?: string | null }): TileCategory[] {
    const categories = getSpellCategories(spell.type);
    const found: TileCategory[] = [];
    if (categories.includes('Ataque')) found.push('attack');
    if (categories.includes('Cura') || categories.includes('Recuperação')) found.push('heal');
    return found.length > 0 ? found : [ 'other' ];
}

/** Itens que não se usam em combate: munição, capacidade (mochila), item-chave e equipamento vestido */
const INERT_ITEM_KINDS = new Set([ 'municao', 'capacidade', 'item chave', 'equipamento' ]);

const HEAL_TEXT = /\b(cura|curar|curativo|recupera|recuperar|regenera|regenerar|restaura|restaurar)\b/;

export interface ItemUse {
    category: TileCategory;
    execution: TileExecution;
}

/**
 * Como um item entra nos quadrados, ou `null` se não se usa em combate. Arremessável (granada) é ataque e gasta a Padrão; o que cura (pelo texto do nome, da descrição
 * e dos efeitos) é cura; o resto é Outros. Tirar o item da bolsa gasta Movimento (regra do dono), então é o que os demais custam. **Premissa minha, a rever**: o app
 * ainda não consome o item nem tem a ação dele no cadastro.
 */
export function classifyItem(item: Pick<Item, 'kind' | 'name' | 'description' | 'effects' | 'quantity'>): ItemUse | null {
    if (item.quantity !== undefined && Number(item.quantity) <= 0) return null;

    const kind = normalizeSearchText(item.kind);
    if (INERT_ITEM_KINDS.has(kind)) return null;
    if (kind === 'arremessavel') return { category: 'attack', execution: 'Padrão' };

    const text = normalizeSearchText([ item.name, item.description, ...(Array.isArray(item.effects) ? item.effects : []) ].filter(Boolean).join(' '));
    return { category: HEAL_TEXT.test(text) ? 'heal' : 'other', execution: 'Movimento' };
}

export interface BuildTilesInput {
    weapons: readonly Weapon[];
    spells: readonly SpellDTO[];
    items: readonly Item[];
    /** Há um ataque de oportunidade em curso: a arma branca gasta a Reação no lugar da Padrão */
    opportunityActive?: boolean;
    /** O texto curto sob o nome da magia (o custo de MP dos estágios liberados) */
    spellDetail?: (spell: SpellDTO) => string;
}

const slug = (value: unknown): string => String(value ?? '').trim() || 'sem-nome';

/** Todos os quadrados do personagem: armas, depois magias, depois itens (cada um na ordem em que aparece na ficha) */
export function buildActionTiles({ weapons, spells, items, opportunityActive = false, spellDetail }: BuildTilesInput): ActionTile[] {
    const tiles: ActionTile[] = [];

    weapons.forEach((weapon, index) => {
        if (!weapon) return;
        const reaction = opportunityActive && isOpportunityWeapon(weapon);
        tiles.push({
            id: `weapon:${slug(weapon.id || weapon.name)}:${index}`,
            kind: 'weapon',
            category: 'attack',
            name: weapon.name,
            execution: reaction ? 'Reação' : 'Padrão',
            detail: weapon.effect?.value ? String(weapon.effect.value) : '',
            weapon
        });
    });

    spells.forEach(spell => {
        if (!spell) return;
        const detail = spellDetail?.(spell) ?? '';
        for (const category of spellTileCategories(spell)) {
            tiles.push({
                id: `spell:${slug(spell.id || spell.name)}:${category}`,
                kind: 'spell',
                category,
                name: spell.name,
                execution: tileExecution(spell.execution),
                detail,
                spell
            });
        }
    });

    items.forEach((item, index) => {
        if (!item) return;
        const use = classifyItem(item);
        if (!use) return;
        tiles.push({
            id: `item:${slug(item.id || item.name)}:${index}`,
            kind: 'item',
            category: use.category,
            name: item.name,
            execution: use.execution,
            detail: item.kind ? String(item.kind) : '',
            item
        });
    });

    return tiles;
}

/** O filtro por ação: sem filtro (`null`) mostra tudo; com ele, só os quadrados que gastam aquela ação */
export const filterTiles = (tiles: readonly ActionTile[], execution: TileExecution | null): ActionTile[] =>
    execution === null ? [ ...tiles ] : tiles.filter(tile => tile.execution === execution);

export const groupTiles = (tiles: readonly ActionTile[]): Record<TileCategory, ActionTile[]> => ({
    attack: tiles.filter(tile => tile.category === 'attack'),
    heal: tiles.filter(tile => tile.category === 'heal'),
    other: tiles.filter(tile => tile.category === 'other')
});

/** Quantos quadrados gastam cada ação (para os contadores do filtro) */
export function countByExecution(tiles: readonly ActionTile[]): Record<TileExecution, number> {
    const counts: Record<TileExecution, number> = { 'Padrão': 0, 'Movimento': 0, 'Bônus': 0, 'Reação': 0, 'Completa': 0 };
    for (const tile of tiles) {
        if (tile.execution) counts[tile.execution] += 1;
    }
    return counts;
}

/**
 * A ação do quadrado já foi gasta na rodada? Então ele fica cinza e desativado. Vale para todo quadrado da mesma ação ao mesmo tempo (gastou a Padrão, todos os de
 * Padrão apagam), e a Completa apaga assim que falta uma das três (Padrão, Bônus ou Movimento). Sem ação reconhecida não há o que gastar: nunca apaga.
 */
export const isTileSpent = (tile: Pick<ActionTile, 'execution'>, budget: ActionBudget): boolean => tile.execution !== null && !canSpend(budget, tile.execution);
