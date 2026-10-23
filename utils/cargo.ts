import { normalizeToArray } from './normalizeToArray';

/**
 * Carga (`capacity.cargo`) e remoção de itens do inventário.
 *
 * A carga é sempre recalculada a partir do inventário (peso × quantidade de itens, armas e armaduras),
 * nunca somada ou subtraída aos poucos: assim excluir, adicionar ou editar um item não deixa a conta
 * fora de sincronia e o arredondamento de ponto flutuante (0,1 + 0,2) não aparece na tela.
 *
 * Itens com `kind: 'Capacidade'` NÃO ocupam carga: na campanha eles aumentam o peso máximo
 * (`capacity.max`) em vez de ocupar espaço (`app/api/campaign/[id]/donate/route.ts` e
 * `components/campaign/playerDashboard/inventory/useInventoryActions.ts`).
 */

/** Casas decimais da carga: 2 evita `0.9999999999999999` sem esconder pesos como 0,25 kg */
const CARGO_DECIMALS = 100;

export interface CargoInventory {
    items?: unknown
    weapons?: unknown
    armors?: unknown
}

export interface InventoryEntryTarget {
    id?: string | null
    index?: number | null
    name?: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function roundCargo(value: number): number {
    return Math.round((value + Number.EPSILON) * CARGO_DECIMALS) / CARGO_DECIMALS;
}

/** Peso de uma unidade: número finito e nunca negativo (texto numérico como "0,5" não é aceito) */
function unitWeight(entry: Record<string, unknown>): number {
    const weight = Number(entry['weight']);
    return Number.isFinite(weight) && weight > 0 ? weight : 0;
}

/** Quantidade ausente, zero, negativa ou inválida conta como 1 (mesma regra da doação na campanha) */
function entryQuantity(entry: Record<string, unknown>): number {
    const quantity = Number(entry['quantity']);
    return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
}

/** Peso que o item ocupa na carga (peso × quantidade). `Capacidade` e entradas inválidas ocupam 0. */
export function itemCargoWeight(entry: unknown, options: { isItem?: boolean } = {}): number {
    if (!isRecord(entry)) return 0;
    if (options.isItem && entry['kind'] === 'Capacidade') return 0;
    return unitWeight(entry) * entryQuantity(entry);
}

/**
 * Soma peso × quantidade de itens, armas e armaduras, arredondada a 2 casas.
 * Aceita listas como array ou como objeto de chaves numéricas (o Firestore devolve assim) e ignora
 * entradas que não são objetos (ids soltos).
 */
export function computeCargo(inventory: CargoInventory | null | undefined): number {
    if (!inventory) return 0;

    const total = [
        ...normalizeToArray<unknown>(inventory.weapons).map(entry => itemCargoWeight(entry)),
        ...normalizeToArray<unknown>(inventory.armors).map(entry => itemCargoWeight(entry)),
        ...normalizeToArray<unknown>(inventory.items).map(entry => itemCargoWeight(entry, { isItem: true }))
    ].reduce((sum, weight) => sum + weight, 0);

    return roundCargo(total);
}

/** Texto não vazio (depois de aparar) ou `undefined` */
function filled(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() !== '' ? value : undefined;
}

/**
 * Lista sem a entrada clicada. Remove UMA entrada só (o inventário pode ter dois itens com o mesmo nome):
 *
 * 1. a da posição `index`, desde que ainda seja a mesma (mesmo `id` se houver `id`, senão mesmo `name`);
 * 2. senão a primeira com o mesmo `id`;
 * 3. senão a primeira com o mesmo `name`.
 *
 * Sem nenhuma correspondência devolve a lista como está (cópia).
 */
export function removeInventoryEntry<T = unknown>(list: unknown, target: InventoryEntryTarget): T[] {
    const entries = [ ...normalizeToArray<T>(list) ];
    const id = filled(target.id);
    const name = filled(target.name);

    const matches = (entry: unknown): boolean => {
        if (!isRecord(entry)) return false;
        if (id !== undefined) return entry['id'] === id;
        if (name !== undefined) return entry['name'] === name;
        return true; // sem id nem nome para conferir, vale a posição
    };

    let removeAt = -1;

    const { index } = target;
    if (typeof index === 'number' && Number.isInteger(index) && index >= 0 && index < entries.length && matches(entries[index])) {
        removeAt = index;
    }
    if (removeAt === -1 && id !== undefined) {
        removeAt = entries.findIndex(entry => isRecord(entry) && entry['id'] === id);
    }
    if (removeAt === -1 && name !== undefined) {
        removeAt = entries.findIndex(entry => isRecord(entry) && entry['name'] === name);
    }

    if (removeAt === -1) return entries;
    return entries.filter((_, position) => position !== removeAt);
}
