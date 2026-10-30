import { DURATION_FALSE_POSITIVES, DURATION_TYPE_CHANGES } from '../../scripts/data/spellDurationTypeChanges'
import { MANA_RECOVERY_SPELLS } from '../../scripts/data/manaRecoverySpells'
import { REACTION_SPELLS } from '../../scripts/data/reactionSpells'
import { getSpellSubtypes } from '../spellCategory'
import { toContinuousSubtype } from '../spellTaxonomy'

describe('toContinuousSubtype', () => {
    it.each([
        [ 'Ataque (imediato)', 'Ataque (contínuo)' ],
        [ 'Ataque (Imediato)', 'Ataque (Contínuo)' ],
        [ 'Ataque (imediato/Área)', 'Ataque (contínuo/Área)' ],
        [ 'Encantamento (Imediato/Área)', 'Encantamento (Contínuo/Área)' ],
        [ 'Mentalização (imediato/Invocação)', 'Mentalização (contínuo/Invocação)' ],
        [ 'Ataque/Cura (imediato)', 'Ataque/Cura (contínuo)' ],
        [ 'Cura/Recuperação (Imediato)', 'Cura/Recuperação (Contínuo)' ]
    ])('%s → %s', (from, to) => {
        expect(toContinuousSubtype(from)).toBe(to)
    })

    it('é idempotente e não mexe no que não é "imediato"', () => {
        for (const type of [ 'Ataque (contínuo)', 'Ataque (conjurado/Área)', 'Defesa (sustentado)', 'Reação', 'Ataque', '', 'Ataque (Área)' ]) {
            expect(toContinuousSubtype(type)).toBe(type)
        }
        expect(toContinuousSubtype(toContinuousSubtype('Ataque (imediato/Área)'))).toBe('Ataque (contínuo/Área)')
    })

    it('"imediato" não vira "contínuo" duas vezes quando a magia já tinha os dois', () => {
        expect(toContinuousSubtype('Ataque (imediato, contínuo)')).toBe('Ataque (contínuo)')
        expect(toContinuousSubtype('Ataque (Imediato/Contínuo/Área)')).toBe('Ataque (Contínuo/Área)')
    })

    it('a palavra "imediato" fora do parêntese não conta e o texto depois dele fica', () => {
        expect(toContinuousSubtype('Ataque imediato')).toBe('Ataque imediato')
        expect(toContinuousSubtype('Ataque (imediato) extra')).toBe('Ataque (contínuo) extra')
    })

    it('o filtro de subtipo do app passa a enxergar "Contínuo" (e não mais "Imediato")', () => {
        expect(getSpellSubtypes('Ataque (imediato/Área)')).toEqual(expect.arrayContaining([ 'Imediato', 'Área' ]))
        const after = getSpellSubtypes(toContinuousSubtype('Ataque (imediato/Área)'))
        expect(after).toEqual(expect.arrayContaining([ 'Contínuo', 'Área' ]))
        expect(after).not.toContain('Imediato')
    })
})

describe('reclassificação imediato → contínuo (scripts/data/spellDurationTypeChanges.ts)', () => {
    it('são 140 trocas, sem id repetido e sem troca que não muda nada', () => {
        expect(DURATION_TYPE_CHANGES).toHaveLength(140)
        expect(new Set(DURATION_TYPE_CHANGES.map(change => change.id)).size).toBe(DURATION_TYPE_CHANGES.length)
        expect(DURATION_TYPE_CHANGES.every(change => change.from !== change.to)).toBe(true)
    })

    it('todas saem de "imediato" e chegam a "contínuo", com o resto do tipo igual', () => {
        for (const { from, to } of DURATION_TYPE_CHANGES) {
            expect(from).toMatch(/\(imediato[^)]*\)/i)
            expect(to).toBe(toContinuousSubtype(from))
            expect(to).not.toMatch(/imediato/i)
            expect(to).toMatch(/\(cont[ií]nuo/i)
            // categoria e subtipos extras (Área, Invocação) ficam como estavam
            expect(to.split('(')[0]).toBe(from.split('(')[0])
            expect(getSpellSubtypes(to).filter(subtype => subtype !== 'Contínuo').sort()).toEqual(getSpellSubtypes(from).filter(subtype => subtype !== 'Imediato').sort())
        }
    })

    it('nenhuma magia aparece nas trocas e nos falsos positivos ao mesmo tempo', () => {
        const names = new Set(DURATION_TYPE_CHANGES.map(change => change.name))
        expect(DURATION_FALSE_POSITIVES).toHaveLength(7)
        expect(DURATION_FALSE_POSITIVES.some(entry => names.has(entry.name))).toBe(false)
    })

    it('os lotes seed em código seguem o tipo novo (rodar o seed não desfaz a reclassificação)', () => {
        const byId = new Map(DURATION_TYPE_CHANGES.map(change => [ change.id, change ]))
        const seeds = [ ...MANA_RECOVERY_SPELLS, ...REACTION_SPELLS ]
        const touched = seeds.filter(spell => byId.has(spell.id))
        expect(touched.length).toBeGreaterThan(0)
        for (const spell of touched) expect(spell.type).toBe(byId.get(spell.id)?.to)
    })
})
