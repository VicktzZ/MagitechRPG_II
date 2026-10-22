import { defaultPerks } from '../../consts/defaultPerks';
import { applyPerkEffects } from '../applyPerkEffects';

function findPerk(name: string) {
    const perk = Object.values(defaultPerks).flat().find(candidate => candidate.name === name);
    if (!perk) throw new Error(`Perk "${name}" não está em defaultPerks`);
    return perk;
}

const charsheet = {
    stats: { lp: 20, mp: 10, ap: 5, maxLp: 20, maxMp: 10, maxAp: 5 },
    capacity: { cargo: 2, max: 5 }
};

function apply(name: string) {
    return applyPerkEffects({
        effects: findPerk(name).effects as never,
        currentCharsheet: charsheet,
        campaignCode: 'TESTE'
    });
}

describe('perks de atributo do roguelite gravam no campo certo da ficha', () => {
    it('Pele de Ferro aumenta stats.maxLp em 10', () => {
        const { updates } = apply('Pele de Ferro');
        expect(updates).toEqual({ 'stats.maxLp': 30 });
    });

    it('Reservatório de Mana aumenta stats.maxMp em 5', () => {
        const { updates } = apply('Reservatório de Mana');
        expect(updates).toEqual({ 'stats.maxMp': 15 });
    });

    it('Peso Pesado aumenta capacity.max em 1', () => {
        const { updates } = apply('Peso Pesado');
        expect(updates).toEqual({ 'capacity.max': 6 });
    });

    it('nenhum deles grava mais em campos soltos da raiz (maxLp, maxMp, cargo.max)', () => {
        const keys = [ 'Pele de Ferro', 'Reservatório de Mana', 'Peso Pesado' ].flatMap(name => Object.keys(apply(name).updates));
        expect(keys).toEqual(expect.not.arrayContaining([ 'maxLp', 'maxMp', 'cargo.max' ]));
        expect(keys.sort()).toEqual([ 'capacity.max', 'stats.maxLp', 'stats.maxMp' ]);
    });

    it('as mensagens descrevem o que mudou', () => {
        expect(apply('Pele de Ferro').messages).toEqual([ '+10 LP máximo' ]);
        expect(apply('Reservatório de Mana').messages).toEqual([ '+5 MP máximo' ]);
        expect(apply('Peso Pesado').messages).toEqual([ '+1kg de capacidade' ]);
    });

    it('os updates apontam para caminhos que existem na ficha', () => {
        for (const name of [ 'Pele de Ferro', 'Reservatório de Mana', 'Peso Pesado' ]) {
            for (const path of Object.keys(apply(name).updates)) {
                const value = path.split('.').reduce<unknown>((current, key) => (current as Record<string, unknown> | undefined)?.[key], charsheet);
                expect(typeof value).toBe('number');
            }
        }
    });
});

describe('por que o alvo precisa ter o caminho completo', () => {
    it('um alvo solto como "maxLp" cairia num campo da raiz que a ficha não lê', () => {
        const { updates } = applyPerkEffects({
            effects: [ { type: 'add', target: 'maxLp', value: 10 } ],
            currentCharsheet: charsheet,
            campaignCode: 'TESTE'
        });
        expect(updates).toEqual({ maxLp: 10 });
        expect(updates).not.toHaveProperty([ 'stats.maxLp' ]);
    });
});

describe('alvos dos perks padrão', () => {
    const effects = Object.values(defaultPerks).flat().flatMap(perk => (perk.effects ?? []).map(effect => ({ perk: perk.name, effect })));

    it('nenhum efeito usa os alvos soltos que não existem na ficha', () => {
        const wrong = effects.filter(({ effect }) => [ 'maxLp', 'maxMp', 'maxAp', 'cargo.max', 'cargo' ].includes(String(effect.target)));
        expect(wrong.map(({ perk }) => perk)).toEqual([]);
    });
});
