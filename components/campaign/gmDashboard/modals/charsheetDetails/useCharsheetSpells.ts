import type { CharsheetDTO, SpellDTO } from '@models/dtos';
import type { Spell } from '@models/entities';
import { useFirestoreByIds } from '@hooks/useFirestoreByIds';
import { normalizeToArray } from './normalizeToArray';

/**
 * Magias da ficha: objetos gravados na própria ficha mais as magias referenciadas por ID,
 * buscadas no Firestore em tempo real
 */
export function useCharsheetSpells(charsheet: Required<CharsheetDTO>): Array<SpellDTO | Spell> {
    const charsheetSpellsList = normalizeToArray<SpellDTO | string>(charsheet.spells);
    const charsheetSpellIds: string[] = charsheetSpellsList.filter((s): s is string => typeof s === 'string');
    const charsheetSpellObjects: SpellDTO[] = charsheetSpellsList.filter((s): s is SpellDTO => typeof s === 'object' && s !== null);
    const { data: fetchedSpells } = useFirestoreByIds('spell', charsheetSpellIds, {
        enabled: charsheetSpellIds.length > 0
    });
    return [ ...charsheetSpellObjects, ...(fetchedSpells ?? []) ];
}
