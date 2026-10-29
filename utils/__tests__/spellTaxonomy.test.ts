import { getSpellCategories, getSpellSubtypes } from '../spellCategory'
import { migrateSpellType } from '../spellTaxonomy'

describe('categorias removidas', () => {
    it.each([
        [ 'Buff (contínuo)', 'Suporte (contínuo)' ],
        [ 'Debuff (Contínuo)', 'Controle (Contínuo)' ],
        [ 'Ilusão (Contínuo)', 'Controle (Contínuo)' ],
        [ 'Anulação (Sustentado)', 'Controle (Sustentado)' ],
        [ 'Debuff/Ataque (Imediato)', 'Controle/Ataque (Imediato)' ],
        [ 'Ataque/Debuff (Área)', 'Ataque/Controle (Área)' ],
        [ 'Cura/Buff (Imediato)', 'Cura/Suporte (Imediato)' ],
        [ 'Ilusão/Recuperação (contínuo)', 'Controle/Recuperação (contínuo)' ],
        [ 'Anulação/Recuperação (imediato)', 'Controle/Recuperação (imediato)' ]
    ])('%s → %s', (from, to) => {
        expect(migrateSpellType(from)).toBe(to)
    })

    it('não repete a categoria: Controle/Debuff fica Controle', () => {
        expect(migrateSpellType('Controle/Debuff (imediato)')).toBe('Controle (imediato)')
        expect(migrateSpellType('Suporte/Buff (contínuo)')).toBe('Suporte (contínuo)')
    })

    it('aceita a grafia sem acento e em outra caixa', () => {
        expect(migrateSpellType('ilusao (contínuo)')).toBe('Controle (contínuo)')
        expect(migrateSpellType('ANULAÇÃO (imediato)')).toBe('Controle (imediato)')
    })

    it('categorias que ficam não mudam', () => {
        expect(migrateSpellType('Ataque (imediato)')).toBe('Ataque (imediato)')
        expect(migrateSpellType('Ataque/Recuperação (imediato)')).toBe('Ataque/Recuperação (imediato)')
        expect(migrateSpellType('Utilidade/Suporte (Sustentado)')).toBe('Utilidade/Suporte (Sustentado)')
    })
})

describe('subtipos removidos', () => {
    it.each([
        [ 'Ataque (Imediato/Multiplicador)', 'Ataque (Imediato)' ],
        [ 'Ataque/Recuperação (Área/Sacrifício)', 'Ataque/Recuperação (Área)' ],
        [ 'Ataque (Imediato/Adjacente)', 'Ataque (Imediato)' ],
        [ 'Ataque (Área/Condicional)', 'Ataque (Área)' ]
    ])('%s → %s', (from, to) => {
        expect(migrateSpellType(from)).toBe(to)
    })

    it('se só havia o subtipo removido, os parênteses saem', () => {
        expect(migrateSpellType('Ataque (Sacrifício)')).toBe('Ataque')
        expect(migrateSpellType('Controle (condicional)')).toBe('Controle')
    })

    it('o meio de uma lista com vírgula', () => {
        expect(migrateSpellType('Ataque (Conjurado, Multiplicador, Contínuo)')).toBe('Ataque (Conjurado, Contínuo)')
    })
})

describe('Área e Invocação', () => {
    it('somam ao subtipo que a magia já tem', () => {
        expect(migrateSpellType('Ataque (imediato)', { area: true })).toBe('Ataque (imediato/Área)')
        expect(migrateSpellType('Mentalização (conjurado)', { summon: true })).toBe('Mentalização (conjurado/Invocação)')
        expect(migrateSpellType('Ataque (conjurado)', { area: true, summon: true })).toBe('Ataque (conjurado/Área/Invocação)')
    })

    it('sem subtipo ganha os parênteses', () => {
        expect(migrateSpellType('Ataque', { area: true })).toBe('Ataque (Área)')
        expect(migrateSpellType('Mentalização', { summon: true })).toBe('Mentalização (Invocação)')
    })

    it('não repete o que já tem, em qualquer caixa', () => {
        expect(migrateSpellType('Ataque (Área)', { area: true })).toBe('Ataque (Área)')
        expect(migrateSpellType('Ataque (imediato/área)', { area: true })).toBe('Ataque (imediato/área)')
        expect(migrateSpellType('Ataque (Invocação)', { summon: true })).toBe('Ataque (Invocação)')
    })

    it('respeita a vírgula do texto original', () => {
        expect(migrateSpellType('Cura/Recuperação (Conjurado, Contínuo)', { area: true })).toBe('Cura/Recuperação (Conjurado, Contínuo, Área)')
    })

    it('junta tudo: categoria trocada, subtipo removido e subtipo novo', () => {
        expect(migrateSpellType('Ilusão (Contínuo)', { area: true })).toBe('Controle (Contínuo/Área)')
        expect(migrateSpellType('Ataque (Área/Condicional)', { area: true })).toBe('Ataque (Área)')
        expect(migrateSpellType('Debuff/Ataque (Imediato)', { area: true })).toBe('Controle/Ataque (Imediato/Área)')
    })

    it('"Reação" fica (o filtro de subtipo já a ignora)', () => {
        expect(migrateSpellType('Defesa (Reação)', { area: true })).toBe('Defesa (Reação/Área)')
        expect(getSpellSubtypes('Defesa (Reação/Área)')).toEqual([ 'Área' ])
    })
})

describe('texto que sobra e casos sem mudança', () => {
    it('preserva o texto depois do parêntese', () => {
        expect(migrateSpellType('Transmutação (contínuo) Execução: Padrão Alcance: Pessoal', { area: true })).toBe('Transmutação (contínuo/Área) Execução: Padrão Alcance: Pessoal')
    })

    it('sem nada a mudar devolve o mesmo texto', () => {
        for (const type of [ 'Ataque (imediato)', 'Defesa (Reação)', 'Ataque', 'Cura (Conjurado, Contínuo)', '' ]) {
            expect(migrateSpellType(type)).toBe(type)
        }
    })

    it('é idempotente: aplicar de novo não muda mais nada', () => {
        const once = migrateSpellType('Ilusão/Recuperação (contínuo/Sacrifício)', { area: true, summon: true })
        expect(once).toBe('Controle/Recuperação (contínuo/Área/Invocação)')
        expect(migrateSpellType(once, { area: true, summon: true })).toBe(once)
    })
})

describe('o resultado é lido pelos filtros como o dono pediu', () => {
    it('categoria e subtipos do texto novo', () => {
        const type = migrateSpellType('Debuff/Ataque (Imediato/Multiplicador)', { area: true })
        expect(type).toBe('Controle/Ataque (Imediato/Área)')
        expect(getSpellCategories(type)).toEqual([ 'Controle', 'Ataque' ])
        expect(getSpellSubtypes(type)).toEqual([ 'Imediato', 'Área' ])
    })
})
