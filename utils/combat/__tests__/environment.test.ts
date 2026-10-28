import type { AppliedEffect, Combat } from '@models';
import {
    ambientAttackDice, attackDiceWithLight, combatLight, combatantAttackDice, combatantInDifficultTerrain, defaultEnvironment, displacementNow, dropTerrainFor,
    hasTerrainImmunity, isInDifficultTerrain, readEnvironment, sanitizeLight, sanitizeTerrainIds, setTerrain
} from '../environment';

const effect = (name: string, modifiers: Array<Record<string, unknown>>, effectId = name): AppliedEffect =>
    ({ id: name, effectId, level: 1, remaining: 2, snapshot: { name, levels: [ { level: 1, modifiers } ] } }) as unknown as AppliedEffect;

const visaoAprimorada = effect('Visão Aprimorada', [ { kind: 'flag', target: 'dim_vision' } ], 'seed-visao-penumbra');
const visaoVerdadeira = effect('Visão Verdadeira', [ { kind: 'flag', target: 'true_sight' } ]);
const cegueira = effect('Cegueira', [ { kind: 'disadvantage', target: 'attack' } ], 'seed-cegueira');
const precisao = effect('Precisão', [ { kind: 'advantage', target: 'attack' } ]);
const velocidade = effect('Velocidade', [ { kind: 'stat_bonus', target: 'displacement', value: '+50%' } ]);
const botas = effect('Botas do Pântano', [ { kind: 'flag', target: 'terrain_immunity' } ]);

const combat = (overrides: Record<string, unknown> = {}): Combat => ({
    isActive: true,
    combatants: [ { id: 'cs-ana', effects: [] }, { id: 'goblin-1', effects: [ visaoAprimorada ] } ],
    environment: { light: 'penumbra', difficultTerrainIds: [ 'cs-ana' ] },
    ...overrides
}) as unknown as Combat;

describe('ambiente gravado', () => {
    it('sem o campo (combate antigo) ou com lixo vale luz clara e sem terreno difícil', () => {
        expect(readEnvironment(undefined)).toEqual(defaultEnvironment());
        expect(readEnvironment(null)).toEqual({ light: 'claro', difficultTerrainIds: [] });
        expect(readEnvironment({ light: 'lava', difficultTerrainIds: 'x' })).toEqual({ light: 'claro', difficultTerrainIds: [] });
        expect(readEnvironment('penumbra')).toEqual({ light: 'claro', difficultTerrainIds: [] });
    });

    it('lê a luz e os ids válidos, sem repetir', () => {
        expect(readEnvironment({ light: 'escuridao', difficultTerrainIds: [ 'a', 'a', 7, '', 'b' ] })).toEqual({ light: 'escuridao', difficultTerrainIds: [ 'a', 'b' ] });
    });

    it('o que vem do cliente: só as três luzes; ids de texto curto, até 60', () => {
        expect(sanitizeLight('penumbra')).toBe('penumbra');
        expect(sanitizeLight('Penumbra')).toBeNull();
        expect(sanitizeLight(undefined)).toBeNull();
        expect(sanitizeTerrainIds([ 'a', 'a', 'x'.repeat(81), 3, ' ', 'b' ])).toEqual([ 'a', 'b' ]);
        expect(sanitizeTerrainIds('a')).toEqual([]);
        expect(sanitizeTerrainIds(Array.from({ length: 80 }, (_, index) => `c${index}`))).toHaveLength(60);
    });
});

describe('terreno difícil por combatente', () => {
    it('marca e desmarca sem alterar o original', () => {
        const env = { light: 'claro' as const, difficultTerrainIds: [ 'a' ] };
        const marked = setTerrain(env, [ 'b', 'a' ], true);
        expect(marked.difficultTerrainIds).toEqual([ 'a', 'b' ]);
        expect(setTerrain(marked, [ 'a' ], false).difficultTerrainIds).toEqual([ 'b' ]);
        expect(env.difficultTerrainIds).toEqual([ 'a' ]);
    });

    it('quem saiu do combate sai da lista; sem ambiente continua sem terreno', () => {
        expect(dropTerrainFor({ light: 'penumbra', difficultTerrainIds: [ 'a', 'b' ] }, 'a')).toEqual({ light: 'penumbra', difficultTerrainIds: [ 'b' ] });
        expect(dropTerrainFor(undefined, 'a')).toEqual(defaultEnvironment());
    });

    it('pergunta por combatente', () => {
        const env = { light: 'claro' as const, difficultTerrainIds: [ 'a' ] };
        expect(isInDifficultTerrain(env, 'a')).toBe(true);
        expect(isInDifficultTerrain(env, 'b')).toBe(false);
        expect(isInDifficultTerrain(undefined, 'a')).toBe(false);
        expect(isInDifficultTerrain(null, undefined)).toBe(false);
    });

    it('só vale com o combate ativo', () => {
        expect(combatantInDifficultTerrain(combat(), 'cs-ana')).toBe(true);
        expect(combatantInDifficultTerrain(combat(), 'goblin-1')).toBe(false);
        expect(combatantInDifficultTerrain(combat({ isActive: false }), 'cs-ana')).toBe(false);
        expect(combatantInDifficultTerrain(null, 'cs-ana')).toBe(false);
    });
});

describe('deslocamento de agora', () => {
    it('terreno difícil corta pela metade, depois dos efeitos', () => {
        expect(displacementNow(9, [], false)).toBe(9);
        expect(displacementNow(9, [], true)).toBe(4.5);
        expect(displacementNow(9, [ velocidade ], false)).toBe(13.5);
        expect(displacementNow(9, [ velocidade ], true)).toBe(6.75);
    });

    it('a imunidade (marca terrain_immunity de um efeito) anula o corte', () => {
        expect(hasTerrainImmunity([ botas ])).toBe(true);
        expect(hasTerrainImmunity([ velocidade ])).toBe(false);
        expect(displacementNow(9, [ botas ], true)).toBe(9);
    });

    it('deslocamento ausente vale zero, sem NaN', () => {
        expect(displacementNow(undefined, [], true)).toBe(0);
    });
});

describe('luz e visão no acerto', () => {
    it('claro não muda nada', () => {
        expect(ambientAttackDice('claro', [])).toEqual({ advantages: 0, disadvantages: 0, notes: [] });
    });

    it('penumbra: cobertura parcial para quem tem visão normal; Aprimorada e Verdadeira ficam de fora', () => {
        expect(ambientAttackDice('penumbra', [])).toMatchObject({ disadvantages: 1, notes: [ 'Penumbra: cobertura parcial, desvantagem, −1d20' ] });
        expect(ambientAttackDice('penumbra', [ visaoAprimorada ]).disadvantages).toBe(0);
        expect(ambientAttackDice('penumbra', [ visaoVerdadeira ]).disadvantages).toBe(0);
    });

    it('escuridão: visão normal fica cega, Aprimorada tem cobertura parcial, Verdadeira não sofre', () => {
        expect(ambientAttackDice('escuridao', [])).toMatchObject({ disadvantages: 1, notes: [ 'Escuridão: cegueira (visão normal), desvantagem, −1d20' ] });
        expect(ambientAttackDice('escuridao', [ visaoAprimorada ])).toMatchObject({ disadvantages: 1, notes: [ 'Escuridão: cobertura parcial (Visão Aprimorada), desvantagem, −1d20' ] });
        expect(ambientAttackDice('escuridao', [ visaoVerdadeira ])).toEqual({ advantages: 0, disadvantages: 0, notes: [] });
    });

    it('quem já está com o efeito Cegueira não ganha a cegueira da escuridão de novo', () => {
        expect(ambientAttackDice('escuridao', [ cegueira ]).disadvantages).toBe(0);
        // a penumbra é outra coisa (cobertura parcial): conta mesmo com Cegueira
        expect(ambientAttackDice('penumbra', [ cegueira ]).disadvantages).toBe(1);
    });

    it('soma aos efeitos de acerto: a conta é a do saldo', () => {
        const total = attackDiceWithLight([ precisao, cegueira ], 'penumbra');
        expect(total.advantages).toBe(1);
        expect(total.disadvantages).toBe(2);
        expect(total.notes).toEqual([ 'Precisão: vantagem, +1d20', 'Cegueira: desvantagem, −1d20', 'Penumbra: cobertura parcial, desvantagem, −1d20' ]);
        expect(attackDiceWithLight([ precisao ], 'claro')).toMatchObject({ advantages: 1, disadvantages: 0 });
    });
});

describe('os d20 de acerto de um combatente em combate', () => {
    it('a luz da cena vale para quem está no combate ativo, conforme a visão dele', () => {
        expect(combatLight(combat())).toBe('penumbra');
        expect(combatantAttackDice(combat(), 'cs-ana').disadvantages).toBe(1);
        // o goblin tem Visão Aprimorada: a penumbra não o atrapalha
        expect(combatantAttackDice(combat(), 'goblin-1').disadvantages).toBe(0);
    });

    it('fora do combate, sem o combatente ou sem ambiente a luz não conta', () => {
        expect(combatLight(combat({ isActive: false }))).toBe('claro');
        expect(combatantAttackDice(combat({ isActive: false }), 'cs-ana').disadvantages).toBe(0);
        expect(combatantAttackDice(combat(), 'cs-bia').disadvantages).toBe(0);
        expect(combatantAttackDice(combat(), undefined).disadvantages).toBe(0);
        expect(combatantAttackDice(combat({ environment: undefined }), 'cs-ana').disadvantages).toBe(0);
        expect(combatantAttackDice(null, 'cs-ana')).toEqual({ advantages: 0, disadvantages: 0, notes: [] });
    });
});
