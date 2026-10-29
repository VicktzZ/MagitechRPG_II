import type { ActiveTest, TestResponse } from '../../models/types/session'
import {
    canRespondToTest,
    collectNewResponses,
    evaluateTest,
    formatResponseNotice,
    formatTestRollText,
    formatTestVerdict,
    getPendingTest,
    isTestRequestFresh,
    MAX_TEST_DICE,
    resolveDiceCount,
    resolveTestModifiers,
    responseKey,
    rollD20,
    rollDice,
    TEST_REQUEST_TTL_MS
} from '../campaignTest'

const NOW = Date.parse('2026-10-21T20:00:00.000Z')
const minutesAgo = (minutes: number): string => new Date(NOW - minutes * 60_000).toISOString()

const makeTest = (overrides: Partial<ActiveTest> = {}): ActiveTest => ({
    id: 'teste-1',
    dt: 12,
    isGroupTest: true,
    isVisible: true,
    showResult: true,
    selectedPlayers: [],
    requestedBy: { id: 'gm', name: 'Mestre' },
    createdAt: minutesAgo(1),
    ...overrides
})

const makeResponse = (overrides: Partial<TestResponse> = {}): TestResponse => ({
    userName: 'Maria',
    rolls: [ 14 ],
    dice: 1,
    usedRoll: 14,
    bonus: 3,
    total: 17,
    success: true,
    respondedAt: minutesAgo(0),
    ...overrides
})

describe('isTestRequestFresh', () => {
    it('vale até o fim do prazo', () => {
        expect(isTestRequestFresh({ createdAt: minutesAgo(9) }, NOW)).toBe(true)
        expect(isTestRequestFresh({ createdAt: new Date(NOW - TEST_REQUEST_TTL_MS).toISOString() }, NOW)).toBe(true)
        expect(isTestRequestFresh({ createdAt: minutesAgo(11) }, NOW)).toBe(false)
    })

    it('data inválida não vale', () => {
        expect(isTestRequestFresh({ createdAt: 'ontem' }, NOW)).toBe(false)
    })
})

describe('getPendingTest', () => {
    const opts = { userId: 'ana', isGM: false, now: NOW }

    it('teste geral chama qualquer jogador', () => {
        const test = makeTest()
        expect(getPendingTest(test, opts)).toBe(test)
    })

    it('teste individual chama só quem foi escolhido', () => {
        const test = makeTest({ isGroupTest: false, selectedPlayers: [ 'ana' ] })
        expect(getPendingTest(test, opts)).toBe(test)
        expect(getPendingTest(test, { ...opts, userId: 'bia' })).toBeNull()
    })

    it('o mestre nunca é chamado', () => {
        expect(getPendingTest(makeTest(), { ...opts, isGM: true })).toBeNull()
    })

    it('sem teste ou sem usuário, nada a responder', () => {
        expect(getPendingTest(undefined, opts)).toBeNull()
        expect(getPendingTest(null, opts)).toBeNull()
        expect(getPendingTest(makeTest(), { ...opts, userId: undefined })).toBeNull()
    })

    it('quem já respondeu não é chamado de novo (nem depois de recarregar a página)', () => {
        const test = makeTest({ responses: { ana: makeResponse() } })
        expect(getPendingTest(test, opts)).toBeNull()
        expect(getPendingTest(test, { ...opts, userId: 'bia' })).toBe(test)
    })

    it('teste vencido não aparece para quem entra depois', () => {
        expect(getPendingTest(makeTest({ createdAt: minutesAgo(30) }), opts)).toBeNull()
    })

    it('teste fechado pelo jogador não reabre sozinho', () => {
        const test = makeTest()
        expect(getPendingTest(test, { ...opts, dismissedIds: new Set([ test.id ]) })).toBeNull()
        expect(getPendingTest(test, { ...opts, dismissedIds: new Set([ 'outro' ]) })).toBe(test)
    })

    it('um novo pedido volta a chamar quem tinha fechado o anterior', () => {
        const dismissed = new Set([ 'teste-1' ])
        const novo = makeTest({ id: 'teste-2' })
        expect(getPendingTest(novo, { ...opts, dismissedIds: dismissed })).toBe(novo)
    })

    it('lista de escolhidos ausente não quebra', () => {
        const test = { ...makeTest({ isGroupTest: false }), selectedPlayers: undefined as unknown as string[] }
        expect(canRespondToTest(test, 'ana')).toBe(false)
    })
})

describe('collectNewResponses', () => {
    it('devolve só as respostas ainda não vistas, da mais antiga para a mais nova', () => {
        const test = makeTest({
            responses: {
                bia: makeResponse({ userName: 'Bia', respondedAt: minutesAgo(1) }),
                ana: makeResponse({ userName: 'Ana', respondedAt: minutesAgo(2) }),
                caio: makeResponse({ userName: 'Caio', respondedAt: minutesAgo(0) })
            }
        })

        const first = collectNewResponses(test, new Set())
        expect(first.map(entry => entry.userId)).toEqual([ 'ana', 'bia', 'caio' ])

        const seen = new Set([ responseKey('teste-1', 'ana'), responseKey('teste-1', 'bia') ])
        expect(collectNewResponses(test, seen).map(entry => entry.userId)).toEqual([ 'caio' ])
    })

    it('a mesma pessoa respondendo a um pedido novo conta como resposta nova', () => {
        const seen = new Set([ responseKey('teste-1', 'ana') ])
        const novo = makeTest({ id: 'teste-2', responses: { ana: makeResponse() } })
        expect(collectNewResponses(novo, seen)).toHaveLength(1)
    })

    it('sem teste ou sem respostas, nada', () => {
        expect(collectNewResponses(undefined, new Set())).toEqual([])
        expect(collectNewResponses(makeTest(), new Set())).toEqual([])
    })
})

describe('resolveDiceCount', () => {
    it.each([
        [ 1, 1 ], [ 2, 2 ], [ 5, 5 ], [ 3.9, 3 ],
        [ 0, 1 ], [ -1, 1 ], [ undefined, 1 ], [ null, 1 ], [ 'x', 1 ], [ NaN, 1 ],
        [ 500, MAX_TEST_DICE ]
    ])('modificador %p dá %p d20', (mod, expected) => {
        expect(resolveDiceCount(mod)).toBe(expected)
    })
})

describe('resolveTestModifiers', () => {
    const charsheet = {
        level: 4,
        attributes: { des: 10, vig: 5 },
        mods: { attributes: { des: 3, vig: 1 } },
        expertises: {
            Furtividade: { value: 4, defaultAttribute: 'des' },
            Atletismo: { value: 1, defaultAttribute: 'vig' },
            Sorte: { value: 2, defaultAttribute: null }
        }
    }

    it('sem perícia é um d20 puro', () => {
        expect(resolveTestModifiers(charsheet, undefined)).toEqual({ dice: 1, bonus: 0 })
    })

    it('com perícia: dados = modificador do atributo padrão, bônus = valor da perícia', () => {
        expect(resolveTestModifiers(charsheet, 'Furtividade')).toEqual({ dice: 3, bonus: 4 })
        expect(resolveTestModifiers(charsheet, 'Atletismo')).toEqual({ dice: 1, bonus: 1 })
    })

    it('é a regra da perícia da ficha: o atributo cru não conta (antes 5 pontos davam 2 dados e o 3 nunca saía)', () => {
        // des = 10 pontos vale mod 3 aqui; a regra antiga olharia o 10 e daria 2 dados
        expect(resolveTestModifiers(charsheet, 'Furtividade').dice).toBe(3)
    })

    it('perícia sem atributo padrão rola um dado', () => {
        expect(resolveTestModifiers(charsheet, 'Sorte')).toEqual({ dice: 1, bonus: 2 })
    })

    it('perícia que a ficha não tem volta ao d20 puro', () => {
        expect(resolveTestModifiers(charsheet, 'Tecnologia')).toEqual({ dice: 1, bonus: 0 })
    })

    it('sem ficha volta ao d20 puro', () => {
        expect(resolveTestModifiers(null, 'Furtividade')).toEqual({ dice: 1, bonus: 0 })
        expect(resolveTestModifiers(undefined, 'Furtividade')).toEqual({ dice: 1, bonus: 0 })
    })

    it('modificador -1 (atributo zerado) rola um dado, como no botão da perícia', () => {
        const zerada = { ...charsheet, mods: { attributes: { des: -1 } } }
        expect(resolveTestModifiers(zerada, 'Furtividade')).toEqual({ dice: 1, bonus: 4 })
    })

    it('sistema customizado soma a influência do atributo (dados extras e bônus fixo)', () => {
        const system = {
            attributes: [ {
                key: 'agi', name: 'Agilidade', abbreviation: 'AGI',
                testInfluence: { mode: 'advantage', formula: 'attr' }
            } ]
        } as never
        const custom = {
            level: 1,
            systemId: 'sys-1',
            attributes: { agi: 2 },
            expertises: { Furtividade: { value: 3, defaultAttribute: 'agi' } }
        }
        const result = resolveTestModifiers(custom, 'Furtividade', system)
        expect(result.dice).toBe(3)
        expect(result.bonus).toBe(3)
    })
})

describe('rolagem', () => {
    it('rollD20 cobre 1 a 20', () => {
        expect(rollD20(() => 0)).toBe(1)
        expect(rollD20(() => 0.999999)).toBe(20)
        expect(rollD20(() => 0.5)).toBe(11)
    })

    it('rollDice rola a quantidade pedida (no mínimo um)', () => {
        let i = 0
        const sequence = [ 0, 0.5, 0.99 ]
        expect(rollDice(3, () => sequence[i++] ?? 0)).toEqual([ 1, 11, 20 ])
        expect(rollDice(0)).toHaveLength(1)
    })
})

describe('evaluateTest — a conta única do teste', () => {
    it('vale o maior d20 mais o bônus, e passa com total igual ou acima da DT', () => {
        expect(evaluateTest({ rolls: [ 7, 12, 3 ], bonus: 3, dt: 15 })).toEqual({ usedRoll: 12, total: 15, success: true })
        expect(evaluateTest({ rolls: [ 7, 12, 3 ], bonus: 2, dt: 15 })).toEqual({ usedRoll: 12, total: 14, success: false })
    })

    it('o veredito acompanha o total mostrado (antes o veredito vinha de outro d20)', () => {
        // d20 do diálogo antigo: 15 (passa DT 12); rolagem da perícia: 2 + 3 = 5 (não passa)
        const { total, success } = evaluateTest({ rolls: [ 2 ], bonus: 3, dt: 12 })
        expect(total).toBe(5)
        expect(success).toBe(false)
    })

    it('bônus negativo pode levar o total abaixo de zero', () => {
        expect(evaluateTest({ rolls: [ 1 ], bonus: -3, dt: 5 })).toEqual({ usedRoll: 1, total: -2, success: false })
    })
})

describe('texto', () => {
    const response = makeResponse({ rolls: [ 12, 7 ], dice: 2, usedRoll: 12, bonus: 3, total: 15 })

    it('com perícia usa o formato que o chat reconhece e conta os dados de verdade', () => {
        expect(formatTestRollText(response, 'Furtividade')).toBe('FURTIVIDADE - 2d20+3: [12, 7: 12] = 15')
        expect(formatTestRollText(makeResponse(), 'Atletismo')).toBe('ATLETISMO - 1d20+3: [14] = 17')
        expect(formatTestRollText(makeResponse({ bonus: -2, total: 12 }), 'Atletismo')).toBe('ATLETISMO - 1d20-2: [14] = 12')
    })

    it('sem perícia é o d20 simples de sempre', () => {
        expect(formatTestRollText(makeResponse({ bonus: 0, total: 14 }))).toBe('1d20: [14] = 14')
    })

    it('o texto com perícia casa com o leitor de mensagens de perícia do chat', () => {
        const chatPattern = /(.+?)\s+-\s+(\d*d\d+)([+-]\d+)?:\s+\[([^\]]+)\]\s*=\s*(\d+)/i
        expect(chatPattern.test(formatTestRollText(response, 'Furtividade'))).toBe(true)
    })

    it('veredito', () => {
        expect(formatTestVerdict('Maria', true)).toBe('Maria passou no teste!')
        expect(formatTestVerdict('Maria', false)).toBe('Maria não passou no teste!')
    })

    it('aviso ao mestre: só a rolagem, ou rolagem e veredito com cor', () => {
        const aberto = formatResponseNotice({ expertise: 'Furtividade', showResult: false }, response)
        expect(aberto).toEqual({ message: 'Maria rolou FURTIVIDADE - 2d20+3: [12, 7: 12] = 15', severity: 'info' })

        const passou = formatResponseNotice({ expertise: undefined, showResult: true }, makeResponse({ bonus: 0, total: 14 }))
        expect(passou.severity).toBe('success')
        expect(passou.message).toBe('Maria rolou 1d20: [14] = 14\nMaria passou no teste!')

        const falhou = formatResponseNotice({ expertise: undefined, showResult: true }, makeResponse({ success: false }))
        expect(falhou.severity).toBe('error')
    })
})

describe('resolveTestModifiers com Sobrepeso', () => {
    const heavy = {
        level: 4,
        mods: { attributes: { des: 3, vig: 1, foc: 2 } },
        expertises: {
            Furtividade: { value: 4, defaultAttribute: 'des' },
            Atletismo: { value: 1, defaultAttribute: 'vig' },
            Magia: { value: 5, defaultAttribute: 'foc' }
        },
        ...{ capacity: { max: 8 }, inventory: { weapons: [ { id: 'w1', name: 'Marreta', weight: 10 } ] } }
    }

    it('tira 1 por kg excedido do bônus das perícias de DES e VIG, e só delas', () => {
        expect(resolveTestModifiers(heavy, 'Furtividade')).toEqual({ dice: 3, bonus: 2 })
        expect(resolveTestModifiers(heavy, 'Atletismo')).toEqual({ dice: 1, bonus: -1 })
        expect(resolveTestModifiers(heavy, 'Magia')).toEqual({ dice: 2, bonus: 5 })
    })

    it('sem a ficha completa (sem inventário) não há penalidade', () => {
        const bare = { level: 4, mods: heavy.mods, expertises: heavy.expertises }
        expect(resolveTestModifiers(bare, 'Furtividade')).toEqual({ dice: 3, bonus: 4 })
    })
})
