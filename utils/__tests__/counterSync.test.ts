import { mergeRemoteCounter } from '../counterSync'

describe('mergeRemoteCounter', () => {
    it('nada mudou fora: nada a fazer', () => {
        expect(mergeRemoteCounter(2, 2, 2)).toBeNull()
        expect(mergeRemoteCounter(2, 2, 1)).toBeNull()
    })

    it('mestre concedeu e o jogador não mexeu: o formulário passa a valer o novo', () => {
        expect(mergeRemoteCounter(3, 0, 0)).toEqual({ current: 3, baseline: 3 })
    })

    it('o jogador já gastou 1 aqui e o mestre concedeu 2: valem os dois (1 gasto, 2 concedidos)', () => {
        // carregou com 1, gastou (formulário 0), mestre foi a 3
        expect(mergeRemoteCounter(3, 1, 0)).toEqual({ current: 2, baseline: 3 })
    })

    it('gastou em outra aba: o formulário desce junto', () => {
        expect(mergeRemoteCounter(0, 1, 1)).toEqual({ current: 0, baseline: 0 })
    })

    it('nunca fica negativo', () => {
        expect(mergeRemoteCounter(0, 3, 1)).toEqual({ current: 0, baseline: 0 })
    })
})
