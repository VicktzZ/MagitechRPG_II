import {
    MAX_DICE_BONUS, MAX_DICE_CONFIGS, MAX_DICE_FACES, MAX_DICE_MODIFIERS, MAX_DICE_QUANTITY, sanitizeCreatureDices, type CreatureDice, type CreatureDiceConfig
} from '@utils/combat/creatureDice';

/**
 * O rascunho do dado no editor de criatura: o que o mestre digita antes de "Adicionar dado". Funções puras (o componente só desenha): cada termo somado tem um tipo
 * (bônus fixo, atributo ou perícia) e os três valores ao mesmo tempo, para trocar de tipo sem perder o que estava digitado.
 */

export type ModifierKind = 'bonus' | 'attribute' | 'expertise';

export interface DraftModifier {
    kind: ModifierKind;
    bonus: number;
    attribute: string;
    expertise: string;
}

export interface DiceDraft {
    /** Id do dado que está sendo editado; `null` para um dado novo */
    id: string | null;
    name: string;
    description: string;
    dices: CreatureDiceConfig[];
    modifiers: DraftModifier[];
}

export const emptyDraft = (): DiceDraft => ({ id: null, name: '', description: '', dices: [ { quantity: 1, faces: 6 } ], modifiers: [] });

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, Number.isFinite(value) ? Math.trunc(value) : min));

export const addConfig = (draft: DiceDraft): DiceDraft =>
    draft.dices.length >= MAX_DICE_CONFIGS ? draft : { ...draft, dices: [ ...draft.dices, { quantity: 1, faces: 6 } ] };

export const removeConfig = (draft: DiceDraft, index: number): DiceDraft => ({ ...draft, dices: draft.dices.filter((_, position) => position !== index) });

/** Quantidade de 1 a 99 e faces de 2 a 1000 (fora disso o número é cortado para a faixa) */
export const updateConfig = (draft: DiceDraft, index: number, field: keyof CreatureDiceConfig, value: number): DiceDraft => ({
    ...draft,
    dices: draft.dices.map((config, position) => position !== index
        ? config
        : { ...config, [field]: field === 'quantity' ? clamp(value, 1, MAX_DICE_QUANTITY) : clamp(value, 2, MAX_DICE_FACES) })
});

export const addModifier = (draft: DiceDraft, attributeKeys: readonly string[]): DiceDraft =>
    draft.modifiers.length >= MAX_DICE_MODIFIERS
        ? draft
        : { ...draft, modifiers: [ ...draft.modifiers, { kind: 'bonus', bonus: 1, attribute: attributeKeys[0] ?? '', expertise: '' } ] };

export const removeModifier = (draft: DiceDraft, index: number): DiceDraft => ({ ...draft, modifiers: draft.modifiers.filter((_, position) => position !== index) });

export const updateModifier = (draft: DiceDraft, index: number, patch: Partial<DraftModifier>): DiceDraft => ({
    ...draft,
    modifiers: draft.modifiers.map((modifier, position) => position !== index
        ? modifier
        : { ...modifier, ...patch, ...(patch.bonus !== undefined ? { bonus: clamp(patch.bonus, -MAX_DICE_BONUS, MAX_DICE_BONUS) } : {}) })
});

/** Carrega um dado salvo no rascunho para editar */
export function draftFromDice(dice: CreatureDice, attributeKeys: readonly string[]): DiceDraft {
    return {
        id: dice.id,
        name: dice.name,
        description: dice.description,
        dices: dice.dices.map(config => ({ ...config })),
        modifiers: dice.modifiers.map(modifier => ({
            kind: modifier.attribute ? 'attribute' : modifier.expertise ? 'expertise' : 'bonus',
            bonus: modifier.bonus ?? 1,
            attribute: modifier.attribute ?? attributeKeys[0] ?? '',
            expertise: modifier.expertise ?? ''
        }))
    };
}

/** O dado pronto para guardar, ou `null` se o rascunho ainda não vale (sem nome ou sem dado). Termo sem valor (perícia não escolhida, bônus 0) é descartado */
export function diceFromDraft(draft: DiceDraft, newId: string): CreatureDice | null {
    const [ dice ] = sanitizeCreatureDices([ {
        id: draft.id ?? newId,
        name: draft.name,
        description: draft.description,
        dices: draft.dices,
        modifiers: draft.modifiers.map(modifier => modifier.kind === 'attribute'
            ? { attribute: modifier.attribute }
            : modifier.kind === 'expertise' ? { expertise: modifier.expertise } : { bonus: modifier.bonus })
    } ]);
    return dice ?? null;
}

/** Guarda o dado na lista: troca o de mesmo id (edição) ou acrescenta ao fim */
export const upsertDice = (dices: readonly CreatureDice[], dice: CreatureDice): CreatureDice[] =>
    dices.some(candidate => candidate.id === dice.id) ? dices.map(candidate => candidate.id === dice.id ? dice : candidate) : [ ...dices, dice ];
