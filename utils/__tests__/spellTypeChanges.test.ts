import { MANA_RECOVERY_SPELLS } from '../../scripts/data/manaRecoverySpells'
import { MANA_RECOVERY_TYPE_CHANGES } from '../../scripts/data/manaRecoveryTypes'
import { SPELL_AREA_IDS, SPELL_SUMMON_IDS } from '../../scripts/data/spellTaxonomyChanges'
import { getSpellCategories, getSpellSubtypes } from '../spellCategory'
import { migrateSpellType } from '../spellTaxonomy'
import { invertSpellTypeChanges, planSpellTypeChanges } from '../spellTypeChanges'

const change = { id: 'a', name: 'Magia A', from: 'Ataque (imediato)', to: 'Ataque/Recuperação (imediato)' }

describe('planSpellTypeChanges', () => {
    it('type antigo: troca', () => {
        const plan = planSpellTypeChanges([ change ], new Map([ [ 'a', 'Ataque (imediato)' ] ]))
        expect(plan.update).toEqual([ change ])
        expect(plan.already).toEqual([])
    })

    it('type já novo: não faz nada (rodar de novo não faz mal)', () => {
        const plan = planSpellTypeChanges([ change ], new Map([ [ 'a', 'Ataque/Recuperação (imediato)' ] ]))
        expect(plan.update).toEqual([])
        expect(plan.already).toEqual([ change ])
    })

    it('type editado à mão: não mexe e avisa com o type de agora', () => {
        const plan = planSpellTypeChanges([ change ], new Map([ [ 'a', 'Ataque (Imediato)' ] ]))
        expect(plan.update).toEqual([])
        expect(plan.conflicts).toEqual([ { ...change, current: 'Ataque (Imediato)' } ])
    })

    it('magia que não existe mais, ou sem type: inexistente ou conflito, nunca troca', () => {
        const plan = planSpellTypeChanges([ change, { ...change, id: 'b' } ], new Map<string, string | undefined>([ [ 'b', undefined ] ]))
        expect(plan.missing.map(c => c.id)).toEqual([ 'a' ])
        expect(plan.conflicts.map(c => c.id)).toEqual([ 'b' ])
        expect(plan.update).toEqual([])
    })

    it('desfazer: inverte from e to e só troca de volta o que ainda está com o type novo', () => {
        const [ undo ] = invertSpellTypeChanges([ change ])
        expect(undo).toEqual({ ...change, from: change.to, to: change.from })
        expect(planSpellTypeChanges([ undo ], new Map([ [ 'a', change.to ] ])).update).toEqual([ undo ])
        expect(planSpellTypeChanges([ undo ], new Map([ [ 'a', change.from ] ])).already).toEqual([ undo ])
    })
})

describe('trocas de tipo das magias que recuperam mana', () => {
    it('há 46 trocas, sem id repetido', () => {
        expect(MANA_RECOVERY_TYPE_CHANGES).toHaveLength(46)
        expect(new Set(MANA_RECOVERY_TYPE_CHANGES.map(c => c.id)).size).toBe(46)
    })

    it.each(MANA_RECOVERY_TYPE_CHANGES.map(c => [ c.name, c ] as const))('%s: ganha Recuperação sem perder o resto', (_name, c) => {
        const before = getSpellCategories(c.from)
        const after = getSpellCategories(c.to)

        // Recuperação sempre entra no filtro Tipo
        expect(after).toContain('Recuperação')
        // ou só ela (a categoria antiga sai), ou a antiga somada a ela, na mesma ordem
        expect([ [ 'Recuperação' ], [ ...before, 'Recuperação' ] ]).toContainEqual(after)
        // o subtipo (e a grafia dele) não muda: só a categoria
        expect(c.to.slice(c.to.indexOf('('))).toBe(c.from.slice(c.from.indexOf('(')))
        expect(getSpellSubtypes(c.to)).toEqual(getSpellSubtypes(c.from))
    })

    it('as 21 magias do lote seed-mp estão na lista e o lote em código usa o type novo, já com a reorganização de 29/10/2026 (Área, categorias removidas)', () => {
        const byId = new Map(MANA_RECOVERY_TYPE_CHANGES.map(c => [ c.id, c ]))
        expect(MANA_RECOVERY_SPELLS).toHaveLength(21)

        for (const spell of MANA_RECOVERY_SPELLS) {
            const recovery = byId.get(spell.id)?.to ?? ''
            expect(migrateSpellType(recovery, { area: SPELL_AREA_IDS.includes(spell.id), summon: SPELL_SUMMON_IDS.includes(spell.id) })).toBe(spell.type)
        }
    })
})
