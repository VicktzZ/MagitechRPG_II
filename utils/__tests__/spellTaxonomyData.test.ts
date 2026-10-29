import { SPELL_AREA_IDS, SPELL_SUMMON_IDS, SPELL_TAXONOMY_CHANGES } from '../../scripts/data/spellTaxonomyChanges'
import { MANA_RECOVERY_TYPE_CHANGES } from '../../scripts/data/manaRecoveryTypes'
import { getSpellCategories, getSpellSubtypes, SPELL_CATEGORIES } from '../spellCategory'
import { migrateSpellType } from '../spellTaxonomy'

const area = new Set(SPELL_AREA_IDS)
const summon = new Set(SPELL_SUMMON_IDS)

describe('mapeamento de tipos e subtipos do catálogo (scripts/data/spellTaxonomyChanges.ts)', () => {
    it('cada troca é exatamente o que a regra faz com o texto antigo', () => {
        for (const change of SPELL_TAXONOMY_CHANGES) {
            expect(migrateSpellType(change.from, { area: area.has(change.id), summon: summon.has(change.id) })).toBe(change.to)
        }
    })

    it('nenhuma troca é um "não muda nada" e não há id repetido', () => {
        expect(SPELL_TAXONOMY_CHANGES.every(change => change.from !== change.to)).toBe(true)
        const ids = SPELL_TAXONOMY_CHANGES.map(change => change.id)
        expect(new Set(ids).size).toBe(ids.length)
    })

    it('o resultado só usa categorias e subtipos vigentes', () => {
        const removed = [ 'Buff', 'Debuff', 'Ilusão', 'Anulação' ]
        for (const change of SPELL_TAXONOMY_CHANGES) {
            const categories = getSpellCategories(change.to)
            expect(categories.some(category => removed.includes(category))).toBe(false)
            expect(categories.every(category => SPELL_CATEGORIES.includes(category))).toBe(true)
            expect(change.to).not.toMatch(/sacrif|multiplic|condicion|adjacen/i)
        }
    })

    it('quem está no mapeamento de área ou de invocação termina com o subtipo (as que já o tinham ficam como estão)', () => {
        const changed = new Map(SPELL_TAXONOMY_CHANGES.map(change => [ change.id, change ]))
        for (const id of area) {
            const change = changed.get(id)
            if (change) expect(getSpellSubtypes(change.to)).toContain('Área')
        }
        for (const id of summon) {
            const change = changed.get(id)
            if (change) expect(getSpellSubtypes(change.to)).toContain('Invocação')
        }
    })

    it('os números do mapeamento: 183 em área, 10 invocações', () => {
        expect(SPELL_AREA_IDS).toHaveLength(183)
        expect(SPELL_SUMMON_IDS).toHaveLength(10)
        expect(new Set(SPELL_AREA_IDS).size).toBe(183)
        expect(new Set(SPELL_SUMMON_IDS).size).toBe(10)
    })

    it('categorias e subtipos removidos: 12 magias trocaram de categoria e 4 perderam um subtipo', () => {
        expect(SPELL_TAXONOMY_CHANGES.filter(change => /buff|debuff|ilus|anula/i.test(change.from))).toHaveLength(12)
        expect(SPELL_TAXONOMY_CHANGES.filter(change => /sacrif|multiplic|condicion|adjacen/i.test(change.from))).toHaveLength(4)
    })
})

describe('o lote de Recuperação continua coerente com a reorganização', () => {
    it('nenhum `type` novo do lote usa categoria ou subtipo removido', () => {
        for (const change of MANA_RECOVERY_TYPE_CHANGES) {
            expect(getSpellCategories(change.to).some(category => [ 'Buff', 'Debuff', 'Ilusão', 'Anulação' ].includes(category))).toBe(false)
        }
    })
})
