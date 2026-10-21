import {
    CHAT_MAX_PAGE_SIZE,
    CHAT_PAGE_SIZE,
    compareChatMessages,
    countUnreadMessages,
    latestMessageTimestamp,
    mergeChatMessages,
    oldestMessageId,
    parseChatPageSize
} from '../chatMessages'

const msg = (id: string, timestamp: string, extra: Record<string, unknown> = {}) => ({ id, timestamp, text: `texto ${id}`, ...extra })

describe('compareChatMessages', () => {
    it('ordena pelo horário', () => {
        expect(compareChatMessages(msg('a', '2026-01-01T10:00:00.000Z'), msg('b', '2026-01-01T10:00:01.000Z'))).toBeLessThan(0)
        expect(compareChatMessages(msg('a', '2026-01-01T10:00:02.000Z'), msg('b', '2026-01-01T10:00:01.000Z'))).toBeGreaterThan(0)
    })

    it('no empate de horário, desempata pelo ID (a ordem das consultas do Firestore)', () => {
        const t = '2026-01-01T10:00:00.000Z'
        expect(compareChatMessages(msg('a', t), msg('b', t))).toBeLessThan(0)
        expect(compareChatMessages(msg('b', t), msg('a', t))).toBeGreaterThan(0)
        expect(compareChatMessages(msg('a', t), msg('a', t))).toBe(0)
    })

    it('mensagem sem horário vai para o começo', () => {
        expect(compareChatMessages({ id: 'x' }, msg('a', '2026-01-01T10:00:00.000Z'))).toBeLessThan(0)
    })
})

describe('mergeChatMessages', () => {
    const old = msg('old', '2025-12-31T10:00:00.000Z')
    const a = msg('a', '2026-01-01T10:00:00.000Z')
    const b = msg('b', '2026-01-01T10:00:01.000Z')
    const c = msg('c', '2026-01-01T10:00:02.000Z')

    it('junta as listas e ordena da mais antiga para a mais nova', () => {
        expect(mergeChatMessages([ c, a ], [ old ], [ b ]).map(m => m.id)).toEqual([ 'old', 'a', 'b', 'c' ])
    })

    it('não repete mensagens com o mesmo ID; a última lista vence', () => {
        const newer = msg('a', '2026-01-01T10:00:00.000Z', { text: 'versão nova' })
        const merged = mergeChatMessages([ a, b ], [ newer ])
        expect(merged).toHaveLength(2)
        expect(merged.find(m => m.id === 'a')?.text).toBe('versão nova')
    })

    it('mensagem antiga sem ID se identifica pelo conteúdo (horário, autor e texto)', () => {
        const noId = { timestamp: '2025-01-01T00:00:00.000Z', text: 'oi', by: { id: 'ana' } }
        const same = { timestamp: '2025-01-01T00:00:00.000Z', text: 'oi', by: { id: 'ana' } }
        const other = { timestamp: '2025-01-01T00:00:00.000Z', text: 'oi', by: { id: 'bia' } }
        expect(mergeChatMessages([ noId ], [ same ], [ other ])).toHaveLength(2)
    })

    it('a janela do listener desliza sem apagar o que já estava na tela', () => {
        // o listener sempre devolve só as N mais recentes; quem sai da janela continua acumulado
        let shown = mergeChatMessages<ReturnType<typeof msg>>([], [ a, b ])
        shown = mergeChatMessages(shown, [ b, c ]) // a saiu da janela de 2
        expect(shown.map(m => m.id)).toEqual([ 'a', 'b', 'c' ])
    })

    it('listas vazias', () => {
        expect(mergeChatMessages()).toEqual([])
        expect(mergeChatMessages([], [])).toEqual([])
    })

    it('não altera as listas recebidas', () => {
        const input = [ c, a ]
        mergeChatMessages(input)
        expect(input.map(m => m.id)).toEqual([ 'c', 'a' ])
    })
})

describe('oldestMessageId', () => {
    it('é a mensagem mais antiga (ponto de partida de "carregar anteriores")', () => {
        const list = [ msg('b', '2026-01-01T10:00:01.000Z'), msg('a', '2026-01-01T10:00:00.000Z'), msg('c', '2026-01-01T10:00:02.000Z') ]
        expect(oldestMessageId(list)).toBe('a')
    })

    it('no empate de horário, a de menor ID (a mesma ordem do servidor)', () => {
        const t = '2026-01-01T10:00:00.000Z'
        expect(oldestMessageId([ msg('b', t), msg('a', t) ])).toBe('a')
    })

    it('ignora mensagens sem ID e lista vazia', () => {
        expect(oldestMessageId([])).toBeUndefined()
        expect(oldestMessageId([ { timestamp: '2020-01-01T00:00:00.000Z' }, msg('x', '2026-01-01T10:00:00.000Z') ])).toBe('x')
    })
})

describe('parseChatPageSize', () => {
    it.each([
        [ '50', 50 ], [ '1', 1 ], [ '200', 200 ],
        [ '99999', CHAT_MAX_PAGE_SIZE ],
        [ undefined, CHAT_PAGE_SIZE ], [ null, CHAT_PAGE_SIZE ], [ '', CHAT_PAGE_SIZE ],
        [ 'abc', CHAT_PAGE_SIZE ], [ '0', CHAT_PAGE_SIZE ], [ '-5', CHAT_PAGE_SIZE ]
    ])('%p vira %p', (raw, expected) => {
        expect(parseChatPageSize(raw )).toBe(expected)
    })
})

describe('não lidas', () => {
    const by = (id: string) => ({ id })
    const list = [
        msg('a', '2026-01-01T10:00:00.000Z', { by: by('ana') }),
        msg('b', '2026-01-01T10:05:00.000Z', { by: by('bia') }),
        msg('c', '2026-01-01T10:06:00.000Z', { by: by('me') }),
        msg('d', '2026-01-01T10:07:00.000Z', { by: by('ana') })
    ]

    it('conta só as mais novas que o último momento visto, de outras pessoas', () => {
        expect(countUnreadMessages(list, '2026-01-01T10:04:00.000Z', 'me')).toBe(2)
    })

    it('as minhas mensagens nunca contam', () => {
        expect(countUnreadMessages(list, '2026-01-01T09:00:00.000Z', 'me')).toBe(3)
    })

    it('nada novo, nada não lido', () => {
        expect(countUnreadMessages(list, '2026-01-01T10:07:00.000Z', 'me')).toBe(0)
        expect(countUnreadMessages([], '2026-01-01T10:07:00.000Z', 'me')).toBe(0)
    })

    it('horário da mais recente', () => {
        expect(latestMessageTimestamp(list)).toBe('2026-01-01T10:07:00.000Z')
        expect(latestMessageTimestamp([])).toBeUndefined()
    })
})
