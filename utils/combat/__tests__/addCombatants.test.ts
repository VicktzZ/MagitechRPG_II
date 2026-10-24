import type { Combatant } from '@models'
import { byInitiative, insertCombatant, nextCreatureInstance } from '../addCombatants'

const c = (id: string, total = 0, dexterity = 0): Combatant => ({ id, name: id, type: 'creature', initiativeRoll: total, initiativeBonus: 0, initiativeTotal: total, hasActed: false, dexterity, effects: [] }) as unknown as Combatant
const ids = (combatants: Combatant[]): string[] => combatants.map(x => x.id)

describe('byInitiative', () => {
    it('maior iniciativa primeiro e destreza desempata', () => {
        expect(byInitiative(c('a', 20), c('b', 10))).toBeLessThan(0)
        expect(byInitiative(c('a', 10), c('b', 20))).toBeGreaterThan(0)
        expect(byInitiative(c('a', 10, 5), c('b', 10, 2))).toBeLessThan(0)
        expect(byInitiative(c('a', 10, 2), c('b', 10, 2))).toBe(0)
    })
})

describe('nextCreatureInstance', () => {
    it('primeira cópia: nome puro e sufixo -1 (como o início do combate)', () => {
        expect(nextCreatureInstance([], 'goblin', 'Goblin')).toEqual({ id: 'goblin-1', name: 'Goblin' })
    })

    it('as seguintes levam o número no nome e o menor n livre no id', () => {
        const combatants = [ c('goblin-1'), c('goblin-2') ]
        expect(nextCreatureInstance(combatants, 'goblin', 'Goblin')).toEqual({ id: 'goblin-3', name: 'Goblin (3)' })
        expect(nextCreatureInstance([ c('goblin-1'), c('goblin-3') ], 'goblin', 'Goblin')).toEqual({ id: 'goblin-2', name: 'Goblin (2)' })
    })

    it('entrada antiga com o id puro da criatura conta como a cópia 1', () => {
        expect(nextCreatureInstance([ c('goblin') ], 'goblin', 'Goblin')).toEqual({ id: 'goblin-2', name: 'Goblin (2)' })
    })

    it('outra criatura com prefixo parecido não conta; id com hífen e caracteres especiais funciona', () => {
        expect(nextCreatureInstance([ c('goblin-chefe-1') ], 'goblin', 'Goblin')).toEqual({ id: 'goblin-1', name: 'Goblin' })
        expect(nextCreatureInstance([ c('lobo-alfa.x-1') ], 'lobo-alfa.x', 'Lobo')).toEqual({ id: 'lobo-alfa.x-2', name: 'Lobo (2)' })
        expect(nextCreatureInstance([ c('loboXalfa-1') ], 'lobo.alfa', 'Lobo')).toEqual({ id: 'lobo.alfa-1', name: 'Lobo' })
    })

    it('jogador com o mesmo id não interfere em outra criatura', () => {
        expect(nextCreatureInstance([ c('p1') ], 'goblin', 'Goblin').id).toBe('goblin-1')
    })
})

describe('insertCombatant', () => {
    const action = (combatants: Combatant[], currentTurnIndex: number) => ({ phase: 'ACTION' as const, currentTurnIndex, combatants })

    it('na fase de iniciativa vai para o fim, sem mexer na ordem', () => {
        const combat = { phase: 'INITIATIVE' as const, currentTurnIndex: 0, combatants: [ c('a'), c('b') ] }
        expect(insertCombatant(combat, c('novo'))).toEqual({ index: 2, afterCurrent: false })
        expect(ids(combat.combatants)).toEqual([ 'a', 'b', 'novo' ])
    })

    it('na fase de ação entra no lugar da iniciativa, depois de quem está agindo', () => {
        // ordem 20, 15, 10, 5; agora é a vez do 15 (índice 1); o novo tira 8: entra entre 10 e 5
        const combat = action([ c('a', 20), c('b', 15), c('c', 10), c('d', 5) ], 1)
        expect(insertCombatant(combat, c('novo', 8))).toEqual({ index: 3, afterCurrent: false })
        expect(ids(combat.combatants)).toEqual([ 'a', 'b', 'c', 'novo', 'd' ])
        expect(combat.currentTurnIndex).toBe(1)
    })

    it('iniciativa baixa entra no fim da ordem', () => {
        const combat = action([ c('a', 20), c('b', 15) ], 0)
        expect(insertCombatant(combat, c('novo', 1)).index).toBe(2)
        expect(ids(combat.combatants)).toEqual([ 'a', 'b', 'novo' ])
    })

    it('iniciativa que já passou neste round age logo depois do turno atual', () => {
        // a (20) e b (15) já agiram, é a vez de c (10, índice 2); o novo tira 18: sua vez já passou
        const combat = action([ c('a', 20), c('b', 15), c('c', 10), c('d', 5) ], 2)
        expect(insertCombatant(combat, c('novo', 18))).toEqual({ index: 3, afterCurrent: true })
        expect(ids(combat.combatants)).toEqual([ 'a', 'b', 'c', 'novo', 'd' ])
        expect(combat.currentTurnIndex).toBe(2)
    })

    it('iniciativa maior que a de quem está agindo (na frente da lista) também entra logo depois dele', () => {
        const combat = action([ c('a', 20), c('b', 15) ], 0)
        expect(insertCombatant(combat, c('novo', 30))).toEqual({ index: 1, afterCurrent: true })
        expect(ids(combat.combatants)).toEqual([ 'a', 'novo', 'b' ])
    })

    it('empate de iniciativa e destreza: entra depois de quem já estava', () => {
        const combat = action([ c('a', 20), c('b', 10, 3), c('d', 5) ], 0)
        insertCombatant(combat, c('novo', 10, 3))
        expect(ids(combat.combatants)).toEqual([ 'a', 'b', 'novo', 'd' ])
    })

    it('destreza maior vence o empate', () => {
        const combat = action([ c('a', 20), c('b', 10, 1), c('d', 5) ], 0)
        insertCombatant(combat, c('novo', 10, 4))
        expect(ids(combat.combatants)).toEqual([ 'a', 'novo', 'b', 'd' ])
    })

    it('índice atual fora da lista é corrigido', () => {
        const combat = action([ c('a', 20), c('b', 10) ], 9)
        expect(insertCombatant(combat, c('novo', 30)).index).toBe(2)
    })

    it('lista vazia só adiciona', () => {
        const combat = action([], 0)
        expect(insertCombatant(combat, c('novo', 5))).toEqual({ index: 0, afterCurrent: false })
    })
})
