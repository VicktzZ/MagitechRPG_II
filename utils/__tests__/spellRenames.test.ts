import { SPELL_RENAMES } from '../../scripts/data/spellRenames'
import { MANA_RECOVERY_SPELLS } from '../../scripts/data/manaRecoverySpells'
import { REACTION_SPELLS } from '../../scripts/data/reactionSpells'

const normalize = (name: string): string => name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

describe('revisão dos nomes das magias (scripts/data/spellRenames.ts)', () => {
    it('há 35 trocas, sem id repetido e sem troca que não muda nada', () => {
        expect(SPELL_RENAMES).toHaveLength(35)
        expect(new Set(SPELL_RENAMES.map(change => change.id)).size).toBe(SPELL_RENAMES.length)
        expect(SPELL_RENAMES.every(change => change.from !== change.to)).toBe(true)
    })

    it('os nomes novos não se repetem entre si e nenhum é igual a um nome antigo trocado por outra magia', () => {
        const news = SPELL_RENAMES.map(change => normalize(change.to))
        expect(new Set(news).size).toBe(news.length)
        const olds = new Set(SPELL_RENAMES.map(change => normalize(change.from)))
        expect(news.some(name => olds.has(name) && !SPELL_RENAMES.some(change => normalize(change.from) === name && normalize(change.to) === name))).toBe(false)
    })

    it('"name" (o rótulo da simulação) é o nome atual', () => {
        expect(SPELL_RENAMES.every(change => change.name === change.from)).toBe(true)
    })

    it('nenhum nome novo termina com espaço, começa em minúscula nem tem aspas retas ou apóstrofo solto', () => {
        for (const { to } of SPELL_RENAMES) {
            expect(to).toBe(to.trim())
            expect(to.charAt(0)).toBe(to.charAt(0).toUpperCase())
            expect(to).not.toMatch(/["']/)
        }
    })

    it('Condução (também é uma perícia) e Penumbra (termo de iluminação do combate) deixaram de ser nomes de magia', () => {
        const froms = SPELL_RENAMES.map(change => change.from)
        expect(froms).toEqual(expect.arrayContaining([ 'Condução', 'Penumbra' ]))
    })

    it('os lotes seed em código seguem os nomes novos (rodar o seed não desfaz a revisão)', () => {
        const names = [ ...MANA_RECOVERY_SPELLS, ...REACTION_SPELLS ].map(spell => spell.name)
        const olds = SPELL_RENAMES.map(change => change.from)
        expect(names.filter(name => olds.includes(name))).toEqual([])
        expect(names).toEqual(expect.arrayContaining([ 'Retaliação Sombria', 'Sangria de Mana' ]))
    })
})
