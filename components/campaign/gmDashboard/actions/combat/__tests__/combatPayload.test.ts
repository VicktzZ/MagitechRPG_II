import type { Creature } from '@models'
import type { PlayerInfo } from '../../types'
import { buildJoinPayload, buildStartCreatures, buildStartPlayers, clampQuantity, countJoining } from '../combatPayload'

const players = [
    { id: 'u-ana', name: 'ana', avatar: '/ana.png', charsheet: { id: 'cs-ana', name: 'Aria Valen', stats: { lp: 30, maxLp: 61, mp: 10, maxMp: 20 }, attributes: { des: 8 } } },
    { id: 'u-bia', name: 'bia', charsheet: { id: 'cs-bia', name: 'Borin', stats: { lp: 5, maxLp: 9 }, attributes: { agi: 3, des: 2 } } },
    { id: 'u-sem', name: 'sem ficha' }
] as unknown as PlayerInfo[]

const creatures = [
    { id: 'goblin', name: 'Goblin', attributes: { des: 10 }, stats: { lp: 20, maxLp: 25, mp: 4, maxMp: 8 } },
    { id: 'lobo', name: 'Lobo', attributes: {}, stats: { lp: 12 } }
] as unknown as Creature[]

describe('buildStartPlayers', () => {
    it('monta o jogador com os dados da ficha e deixa de fora quem não tem ficha', () => {
        const built = buildStartPlayers(players, [ 'u-ana', 'u-sem', 'u-bia' ])
        expect(built).toHaveLength(2)
        expect(built[0]).toMatchObject({ odacId: 'u-ana', charsheetId: 'cs-ana', name: 'Aria Valen', dexterity: 8, avatar: '/ana.png', lp: 30, maxLp: 61, mp: 10, maxMp: 20 })
        expect(built[1]).toMatchObject({ charsheetId: 'cs-bia', agility: 3, dexterity: 2, mp: 0, maxMp: 0 })
    })
})

describe('buildStartCreatures', () => {
    it('uma entrada por cópia, com sufixo no id e número no nome quando há mais de uma', () => {
        const built = buildStartCreatures(creatures, [ 'goblin', 'lobo' ], { goblin: 2, lobo: 1 })
        expect(built.map(c => [ c.id, c.name ])).toEqual([ [ 'goblin-1', 'Goblin (1)' ], [ 'goblin-2', 'Goblin (2)' ], [ 'lobo-1', 'Lobo' ] ])
        expect(built[0]).toMatchObject({ lp: 20, maxLp: 25, mp: 4, maxMp: 8, dexterity: 10 })
        expect(built[2]).toMatchObject({ lp: 12, maxLp: 12, mp: 0, maxMp: 0, dexterity: 0 })
    })

    it('criatura que não existe mais é ignorada e a quantidade vale de 1 a 99', () => {
        expect(buildStartCreatures(creatures, [ 'fantasma' ], {})).toEqual([])
        expect(buildStartCreatures(creatures, [ 'lobo' ], { lobo: 0 })).toHaveLength(1)
        expect(buildStartCreatures(creatures, [ 'lobo' ], { lobo: 500 })).toHaveLength(99)
    })
})

describe('clampQuantity', () => {
    it('de 1 a 99, inteiro; valor inválido vale 1', () => {
        expect(clampQuantity(undefined)).toBe(1)
        expect(clampQuantity(Number.NaN)).toBe(1)
        expect(clampQuantity(0)).toBe(1)
        expect(clampQuantity(3.9)).toBe(3)
        expect(clampQuantity(150)).toBe(99)
    })
})

describe('buildJoinPayload', () => {
    it('manda só a ficha (e o avatar) dos jogadores e o id com a quantidade das criaturas', () => {
        const payload = buildJoinPayload(players, [ 'u-ana', 'u-bia', 'u-sem' ], [ 'goblin', 'lobo' ], { goblin: 3 })
        expect(payload).toEqual({
            players: [ { charsheetId: 'cs-ana', avatar: '/ana.png' }, { charsheetId: 'cs-bia' } ],
            creatures: [ { id: 'goblin', quantity: 3 }, { id: 'lobo', quantity: 1 } ]
        })
    })

    it('conta os combatentes que entram (jogadores mais as cópias)', () => {
        expect(countJoining({ players: [ { charsheetId: 'a' } ], creatures: [ { id: 'g', quantity: 2 }, { id: 'l', quantity: 1 } ] })).toBe(4)
        expect(countJoining({ players: [], creatures: [] })).toBe(0)
    })
})
