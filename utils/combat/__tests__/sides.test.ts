import {
    applySide, areaCandidates, areaIncludesSelf, areaMax, combatantSide, defaultAreaSelection, isCombatSide, MAX_AREA_TARGETS, oppositeSide, sanitizeAreaIds, sanitizeAreaTargets,
    type AreaSpec, type CombatSide
} from '../sides'

interface Fighter {
    id: string;
    type: 'player' | 'creature';
    side?: CombatSide;
}

const aria: Fighter = { id: 'aria', type: 'player' };
const borin: Fighter = { id: 'borin', type: 'player' };
const orc: Fighter = { id: 'orc', type: 'creature' };
const goblin: Fighter = { id: 'goblin-1', type: 'creature' };
const order = (): Fighter[] => [ { ...aria }, { ...orc }, { ...borin }, { ...goblin } ];

describe('combatantSide', () => {
    it('sem marca, jogador é aliado e criatura é inimigo', () => {
        expect(combatantSide(aria)).toBe('ally');
        expect(combatantSide(orc)).toBe('enemy');
    });

    it('a marca do mestre vale no lugar do padrão', () => {
        expect(combatantSide({ ...orc, side: 'ally' })).toBe('ally');
        expect(combatantSide({ ...aria, side: 'enemy' })).toBe('enemy');
    });

    it('marca inválida ou combatente ausente cai no padrão', () => {
        expect(combatantSide({ type: 'player', side: 'neutro' })).toBe('ally');
        expect(combatantSide({ type: 'creature', side: 3 })).toBe('enemy');
        expect(combatantSide(undefined)).toBe('enemy');
        expect(combatantSide(null)).toBe('enemy');
    });

    it('isCombatSide e oppositeSide', () => {
        expect(isCombatSide('ally')).toBe(true);
        expect(isCombatSide('enemy')).toBe(true);
        expect(isCombatSide('neutral')).toBe(false);
        expect(oppositeSide('ally')).toBe('enemy');
        expect(oppositeSide('enemy')).toBe('ally');
    });
});

describe('areaIncludesSelf e areaMax', () => {
    it('quem usa entra na área de aliados e na de qualquer um, e nunca na de inimigos', () => {
        expect(areaIncludesSelf({ affects: 'allies' })).toBe(true);
        expect(areaIncludesSelf({ affects: 'allies', includeSelf: false })).toBe(false);
        expect(areaIncludesSelf({ affects: 'any' })).toBe(true);
        expect(areaIncludesSelf({ affects: 'enemies' })).toBe(false);
        expect(areaIncludesSelf({ affects: 'enemies', includeSelf: true })).toBe(false);
    });

    it('o máximo vai de 1 ao teto', () => {
        expect(areaMax({ affects: 'allies' })).toBe(MAX_AREA_TARGETS);
        expect(areaMax({ affects: 'allies', max: 3 })).toBe(3);
        expect(areaMax({ affects: 'allies', max: 0 })).toBe(MAX_AREA_TARGETS);
        expect(areaMax({ affects: 'allies', max: 999 })).toBe(MAX_AREA_TARGETS);
        expect(areaMax({ affects: 'allies', max: 2.9 })).toBe(2);
    });
});

describe('areaCandidates', () => {
    const ids = (list: Fighter[]): string[] => list.map(fighter => fighter.id);

    it('aliados: os do mesmo lado, com quem usa, na ordem do combate', () => {
        expect(ids(areaCandidates(order(), 'aria', { affects: 'allies' }))).toEqual([ 'aria', 'borin' ]);
    });

    it('aliados sem quem usa', () => {
        expect(ids(areaCandidates(order(), 'aria', { affects: 'allies', includeSelf: false }))).toEqual([ 'borin' ]);
    });

    it('inimigos: os do outro lado', () => {
        expect(ids(areaCandidates(order(), 'aria', { affects: 'enemies' }))).toEqual([ 'orc', 'goblin-1' ]);
    });

    it('qualquer um: todos', () => {
        expect(ids(areaCandidates(order(), 'aria', { affects: 'any' }))).toEqual([ 'aria', 'orc', 'borin', 'goblin-1' ]);
        expect(ids(areaCandidates(order(), 'aria', { affects: 'any', includeSelf: false }))).toEqual([ 'orc', 'borin', 'goblin-1' ]);
    });

    it('vale o lado de quem usa: uma criatura usando "aliados" pega as outras criaturas', () => {
        expect(ids(areaCandidates(order(), 'orc', { affects: 'allies' }))).toEqual([ 'orc', 'goblin-1' ]);
        expect(ids(areaCandidates(order(), 'orc', { affects: 'enemies' }))).toEqual([ 'aria', 'borin' ]);
    });

    it('o lado marcado pelo mestre muda quem é aliado', () => {
        const list = order();
        list[1]!.side = 'ally'; // o orc ajuda o grupo
        expect(ids(areaCandidates(list, 'aria', { affects: 'allies' }))).toEqual([ 'aria', 'orc', 'borin' ]);
        expect(ids(areaCandidates(list, 'aria', { affects: 'enemies' }))).toEqual([ 'goblin-1' ]);
    });
});

describe('defaultAreaSelection', () => {
    it('área de aliados já vem com todos marcados; as outras, vazias', () => {
        expect(defaultAreaSelection(order(), 'aria', { affects: 'allies' })).toEqual([ 'aria', 'borin' ]);
        expect(defaultAreaSelection(order(), 'aria', { affects: 'enemies' })).toEqual([]);
        expect(defaultAreaSelection(order(), 'aria', { affects: 'any' })).toEqual([]);
    });

    it('respeita o máximo', () => {
        expect(defaultAreaSelection(order(), 'aria', { affects: 'allies', max: 1 })).toEqual([ 'aria' ]);
    });
});

describe('sanitizeAreaIds', () => {
    it('só texto curto, sem repetir', () => {
        expect(sanitizeAreaIds([ 'a', 'a', ' ', '', 3, null, 'b' ])).toEqual([ 'a', 'b' ]);
        expect(sanitizeAreaIds([ 'x'.repeat(81) ])).toEqual([]);
        expect(sanitizeAreaIds('aria')).toEqual([]);
        expect(sanitizeAreaIds(undefined)).toEqual([]);
    });
});

describe('sanitizeAreaTargets', () => {
    const allies: AreaSpec = { affects: 'allies' };

    it('mantém os que a área pode pegar, na ordem do combate', () => {
        expect(sanitizeAreaTargets(order(), 'aria', allies, [ 'borin', 'aria' ])).toEqual({ ids: [ 'aria', 'borin' ], dropped: [] });
    });

    it('descarta quem é do lado errado e quem nem está no combate', () => {
        expect(sanitizeAreaTargets(order(), 'aria', allies, [ 'aria', 'orc', 'fantasma' ])).toEqual({ ids: [ 'aria' ], dropped: [ 'orc', 'fantasma' ] });
    });

    it('quem usa fica de fora quando a área não o inclui', () => {
        expect(sanitizeAreaTargets(order(), 'aria', { affects: 'allies', includeSelf: false }, [ 'aria', 'borin' ])).toEqual({ ids: [ 'borin' ], dropped: [ 'aria' ] });
    });

    it('corta no máximo, e o que passou vira "dropped"', () => {
        expect(sanitizeAreaTargets(order(), 'aria', { affects: 'any', max: 2 }, [ 'aria', 'orc', 'borin' ])).toEqual({ ids: [ 'aria', 'orc' ], dropped: [ 'borin' ] });
    });

    it('lista inválida não pega ninguém', () => {
        expect(sanitizeAreaTargets(order(), 'aria', allies, 'aria')).toEqual({ ids: [], dropped: [] });
        expect(sanitizeAreaTargets(order(), 'aria', allies, undefined)).toEqual({ ids: [], dropped: [] });
    });
});

describe('applySide', () => {
    it('marca o lado e devolve só quem mudou', () => {
        const list = order();
        const changed = applySide(list, [ 'orc', 'aria' ], 'ally');

        expect(changed.map(fighter => fighter.id)).toEqual([ 'orc' ]);
        expect(list[1]!.side).toBe('ally');
        expect(list[0]!.side).toBeUndefined();
    });

    it('voltar ao lado de antes também conta como mudança', () => {
        const list = order();
        applySide(list, [ 'aria' ], 'enemy');
        expect(applySide(list, [ 'aria' ], 'ally').map(fighter => fighter.id)).toEqual([ 'aria' ]);
        expect(combatantSide(list[0])).toBe('ally');
    });

    it('ids que não estão no combate são ignorados', () => {
        expect(applySide(order(), [ 'fantasma' ], 'ally')).toEqual([]);
    });
});
