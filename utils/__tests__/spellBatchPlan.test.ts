import { normalizeSpellName, planSpellBatch } from '../spellBatchPlan'

const batch = [ { id: 'seed-a', name: 'Vigia Luminoso' }, { id: 'seed-b', name: 'Ponte de Gelo' } ]

describe('plano de gravação de um lote de magias novas (utils/spellBatchPlan.ts)', () => {
    it('sem colisão, o lote todo pode ser criado', () => {
        const plan = planSpellBatch(batch, [ { id: 'x', name: 'Outra Magia' } ])
        expect(plan.ok).toBe(true)
        expect(plan.create).toEqual(batch)
        expect(plan.idCollisions).toEqual([])
        expect(plan.nameCollisions).toEqual([])
    })

    it('id que já existe aborta', () => {
        const plan = planSpellBatch(batch, [ { id: 'seed-b', name: 'Nome Diferente' } ])
        expect(plan.ok).toBe(false)
        expect(plan.idCollisions).toEqual([ { id: 'seed-b', name: 'Ponte de Gelo' } ])
    })

    it('nome que já existe em outro id aborta, sem olhar acento nem caixa nem espaços repetidos', () => {
        const plan = planSpellBatch(batch, [ { id: 'velha', name: '  vigia   LUMINOSO ' } ])
        expect(plan.ok).toBe(false)
        expect(plan.nameCollisions).toEqual([ { id: 'seed-a', name: 'Vigia Luminoso', existingId: 'velha' } ])
        expect(normalizeSpellName('Ação Rápida')).toBe('acao rapida')
    })

    it('id ou nome repetido dentro do próprio lote aborta', () => {
        expect(planSpellBatch([ ...batch, { id: 'seed-a', name: 'Outro' } ], []).ok).toBe(false)
        expect(planSpellBatch([ ...batch, { id: 'seed-c', name: 'ponte de gelo' } ], []).duplicatesInBatch).toEqual([ 'nome ponte de gelo' ])
    })
})
