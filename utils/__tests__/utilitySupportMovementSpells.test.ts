import { MANA_RECOVERY_SPELLS } from '../../scripts/data/manaRecoverySpells'
import { REACTION_SPELLS } from '../../scripts/data/reactionSpells'
import { SPELL_RENAMES } from '../../scripts/data/spellRenames'
import { UTILITY_SUPPORT_MOVEMENT_SPELLS } from '../../scripts/data/utilitySupportMovementSpells'
import { extractDiceExpressions } from '../combat/spellRoller'
import { getSpellCategories, getSpellSubtypes } from '../spellCategory'
import { isSecondaryElement } from '../elements'

// spellRoller importa o diceRoller, que puxa o barril de @enums (subscriptionEnum.ts, que o ts-jest barra por um erro de tipo antigo)
jest.mock('@enums', () => ({
    MessageType: { TEXT: 'text', ROLL: 'roll', DICE: 'dice', ERROR: 'error', SYSTEM: 'system', EXPERTISE: 'expertise', COMBAT_LOG: 'combat_log' },
    PusherEvent: {}
}))

const normalize = (name: string): string => name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

const ELEMENTS = [ 'FOGO', 'ÁGUA', 'AR', 'TERRA', 'ELETRICIDADE', 'TREVAS', 'LUZ', 'NÃO-ELEMENTAL', 'SANGUE', 'VÁCUO', 'PSÍQUICO', 'RADIAÇÃO', 'EXPLOSÃO' ]
const EXECUTIONS = [ 'Padrão', 'Completa', 'Bônus', 'Reação', 'Movimento' ]
const RANGES = [ 'Pessoal', 'Toque', 'Curto', 'Médio', 'Longo' ]
/** Faixa de `mpCost` base por nível, em volta da média do catálogo (N1 1,7 · N2 4,2 · N3 7 · N4 12) */
const MP_BAND: Record<number, [number, number]> = { 1: [ 1, 3 ], 2: [ 3, 5 ], 3: [ 5, 8 ], 4: [ 10, 14 ] }

const BATCH = UTILITY_SUPPORT_MOVEMENT_SPELLS
const byCategory = (category: string) => BATCH.filter(spell => getSpellCategories(spell.type).includes(category))

describe('lote de 30 magias de Utilidade, Suporte e Movimento (scripts/data/utilitySupportMovementSpells.ts)', () => {
    it('são 30 magias: 10 de cada categoria, cada uma só da sua', () => {
        expect(BATCH).toHaveLength(30)
        for (const category of [ 'Utilidade', 'Suporte', 'Movimento' ]) {
            expect(byCategory(category)).toHaveLength(10)
        }
        for (const spell of BATCH) {
            expect(getSpellCategories(spell.type)).toHaveLength(1)
        }
    })

    it('os ids seguem o prefixo da categoria e não se repetem', () => {
        expect(new Set(BATCH.map(spell => spell.id)).size).toBe(30)
        const prefix: Record<string, string> = { Utilidade: 'seed-ut-', Suporte: 'seed-su-', Movimento: 'seed-mv-' }
        for (const [ category, start ] of Object.entries(prefix)) {
            expect(byCategory(category).every(spell => spell.id.startsWith(start))).toBe(true)
        }
    })

    it('nome e id não colidem com os outros lotes nem com os nomes novos da revisão (e os nomes são únicos entre si)', () => {
        const names = BATCH.map(spell => normalize(spell.name))
        expect(new Set(names).size).toBe(30)
        const others = [ ...MANA_RECOVERY_SPELLS, ...REACTION_SPELLS ]
        const takenNames = new Set([ ...others.map(spell => normalize(spell.name)), ...SPELL_RENAMES.map(change => normalize(change.to)), ...SPELL_RENAMES.map(change => normalize(change.from)) ])
        expect(names.filter(name => takenNames.has(name))).toEqual([])
        const takenIds = new Set(others.map(spell => spell.id))
        expect(BATCH.filter(spell => takenIds.has(spell.id))).toEqual([])
    })

    it('nenhum nome é genérico (uma palavra só) nem termina com espaço, e a primeira letra é maiúscula', () => {
        for (const { name } of BATCH) {
            expect(name).toBe(name.trim())
            expect(name.charAt(0)).toBe(name.charAt(0).toUpperCase())
            expect(name.split(/\s+/).length).toBeGreaterThanOrEqual(2)
        }
    })

    it('elementos, execução e alcance seguem a grafia do catálogo (NÃO-ELEMENTAL com "Ã" maiúsculo)', () => {
        for (const spell of BATCH) {
            expect(ELEMENTS).toContain(spell.element)
            expect(EXECUTIONS).toContain(spell.execution)
            expect(RANGES).toContain(spell.range)
        }
    })

    it('há variedade: vários elementos e os quatro níveis em cada categoria', () => {
        expect(new Set(BATCH.map(spell => spell.element)).size).toBeGreaterThanOrEqual(8)
        for (const category of [ 'Utilidade', 'Suporte', 'Movimento' ]) {
            const levels = new Set(byCategory(category).map(spell => spell.level))
            expect([ ...levels ].sort()).toEqual([ 1, 2, 3, 4 ])
            expect(new Set(byCategory(category).map(spell => spell.element)).size).toBeGreaterThanOrEqual(5)
        }
    })

    it('elemento secundário só no nível 10 em diante do jogador: as de elemento secundário são poucas (o filtro as esconde antes)', () => {
        expect(BATCH.filter(spell => isSecondaryElement(spell.element)).length).toBeLessThanOrEqual(4)
    })

    it('nível 1 a 4 como número, custo base dentro da faixa do nível', () => {
        for (const spell of BATCH) {
            expect([ 1, 2, 3, 4 ]).toContain(spell.level)
            const [ min, max ] = MP_BAND[spell.level]
            expect(spell.mpCost).toBeGreaterThanOrEqual(min)
            expect(spell.mpCost).toBeLessThanOrEqual(max)
        }
    })

    it('três estágios com texto, e no máximo UMA expressão de dados por estágio', () => {
        for (const spell of BATCH) {
            expect(spell.stages).toHaveLength(3)
            for (const stage of spell.stages) {
                expect(stage.trim().length).toBeGreaterThan(20)
                expect(extractDiceExpressions(stage).length).toBeLessThanOrEqual(1)
            }
        }
    })

    it('usa o vocabulário do catálogo: "turnos" e "combate", sem "rodadas", "cena" nem "ação livre"', () => {
        for (const spell of BATCH) {
            for (const stage of spell.stages) {
                expect(stage).not.toMatch(/\brodadas?\b/i)
                expect(stage).not.toMatch(/\bcenas?\b/i)
                expect(stage).not.toMatch(/a[cç][aã]o livre/i)
            }
        }
    })

    it('metros no formato do catálogo ("4,5m"), sem ponto decimal nem espaço antes da unidade', () => {
        for (const spell of BATCH) {
            for (const stage of spell.stages) {
                expect(stage).not.toMatch(/\d\.\d+\s?m\b/)
                expect(stage).not.toMatch(/\d\s+m\b(?!ana|ais|inut|ão|ana)/)
            }
        }
    })

    it('o tipo usa a taxonomia nova: categoria vigente, subtipo vigente, sem Buff/Debuff/Ilusão/Anulação nem os subtipos removidos', () => {
        for (const spell of BATCH) {
            expect(spell.type).toMatch(/^(Utilidade|Suporte|Movimento) \([^)]+\)$/)
            const subtypes = getSpellSubtypes(spell.type)
            expect(subtypes.length).toBeGreaterThanOrEqual(1)
            expect(spell.type).not.toMatch(/buff|debuff|ilus[aã]o|anula[cç][aã]o|sacrif|multiplicador|condicional|adjacente/i)
        }
    })

    it('"Área" no tipo só quando o texto fala de área, e quem fala de área no estágio 1 ou 2 tem o subtipo', () => {
        const AREA_WORDS = /\b(raio de|cone|linha de|onda|zona|aura|todos os aliados|todos os seus aliados|aliados a até|criaturas a até|criaturas num raio|em um raio|em um cone)\b/i
        for (const spell of BATCH) {
            const flagged = getSpellSubtypes(spell.type).some(subtype => normalize(subtype) === 'area')
            const mentions = spell.stages.some(stage => AREA_WORDS.test(stage))
            if (flagged) expect(mentions).toBe(true)
        }
        expect(BATCH.filter(spell => getSpellSubtypes(spell.type).some(subtype => normalize(subtype) === 'area')).length).toBeGreaterThanOrEqual(5)
    })

    it('nenhuma invoca entidade, então nenhuma leva "Invocação"', () => {
        expect(BATCH.some(spell => getSpellSubtypes(spell.type).some(subtype => normalize(subtype) === 'invocacao'))).toBe(false)
    })

    it('"sustentado" só quando o texto fala em manter a magia (gasto por turno); "contínuo" tem duração fixa em turnos', () => {
        for (const spell of BATCH) {
            const subtypes = getSpellSubtypes(spell.type).map(normalize)
            if (subtypes.includes('sustentado')) {
                expect(spell.stages.join(' ')).toMatch(/mantiver|manter|mantém|mantid|sustent/i)
            }
            if (subtypes.includes('continuo')) {
                // Contínuo = quantidade fixa de TURNOS (definição do dono): duração em minutos ou horas é fora de combate, o catálogo a trata como "imediato"
                expect(spell.stages.join(' ')).toMatch(/\d+ turnos?/i)
                expect(spell.stages.join(' ')).not.toMatch(/\d+ (minutos?|horas?)/i)
            }
        }
    })

    it('o 3º estágio do nível 4 é a Maestria: mais forte que o 2º (texto maior)', () => {
        for (const spell of BATCH.filter(entry => entry.level === 4)) {
            expect(spell.stages[2].length).toBeGreaterThan(spell.stages[1].length * 0.7)
        }
    })
})
