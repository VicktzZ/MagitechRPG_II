import type { Item, Weapon } from '@models';
import type { SpellDTO } from '@models/dtos';
import { freshBudget } from '../engine/actionBudget';
import { findPassive } from '../passives/catalog';
import {
    buildActionTiles,
    classifyItem,
    countByExecution,
    filterTiles,
    groupTiles,
    isTileSpent,
    spellTileCategories,
    tileExecution
} from '../actionTiles';

const weapon = (patch: Partial<Weapon> = {}): Weapon => ({
    id: 'w1', name: 'Espada Longa', categ: 'Arma Branca', range: 'Corpo-a-corpo', effect: { value: '1d8', critValue: '2d8' }, ...patch
}) as unknown as Weapon;
const spell = (patch: Partial<SpellDTO> = {}): SpellDTO => ({
    id: 's1', name: 'Brasa Voraz', level: 1, element: 'FOGO', type: 'Ataque (imediato)', execution: 'Padrão', ...patch
}) as unknown as SpellDTO;
const item = (patch: Partial<Item> = {}): Item => ({ id: 'i1', name: 'Corda', kind: 'Utilidade', description: 'Uma corda.', quantity: 1, effects: [], ...patch }) as unknown as Item;

const build = (input: { weapons?: Weapon[]; spells?: SpellDTO[]; items?: Item[]; opportunityActive?: boolean } = {}) =>
    buildActionTiles({ weapons: [], spells: [], items: [], spellDetail: () => '3 MP', ...input });

describe('tileExecution', () => {
    it('as execuções do catálogo viram as do filtro, inclusive o antigo Livre e em qualquer caixa ou acento', () => {
        expect(tileExecution('Padrão')).toBe('Padrão');
        expect(tileExecution('padrao')).toBe('Padrão');
        expect(tileExecution('Livre')).toBe('Bônus');
        expect(tileExecution('Bônus')).toBe('Bônus');
        expect(tileExecution('Movimento')).toBe('Movimento');
        expect(tileExecution('Reação')).toBe('Reação');
        expect(tileExecution('Completa')).toBe('Completa');
    });

    it('vazio ou desconhecido não tem ação', () => {
        expect(tileExecution(undefined)).toBeNull();
        expect(tileExecution('Ritual')).toBeNull();
    });
});

describe('spellTileCategories', () => {
    it('Ataque é ataque, Cura e Recuperação são cura, o resto é Outros', () => {
        expect(spellTileCategories({ type: 'Ataque (imediato)' })).toEqual([ 'attack' ]);
        expect(spellTileCategories({ type: 'Cura (imediato)' })).toEqual([ 'heal' ]);
        expect(spellTileCategories({ type: 'Recuperação (sustentado)' })).toEqual([ 'heal' ]);
        expect(spellTileCategories({ type: 'Defesa (contínuo)' })).toEqual([ 'other' ]);
        expect(spellTileCategories({ type: 'Controle' })).toEqual([ 'other' ]);
        expect(spellTileCategories({ type: undefined })).toEqual([ 'other' ]);
    });

    it('a categoria somada vale nas duas (Ataque/Cura), e Ataque/Recuperação conta como ataque e cura', () => {
        expect(spellTileCategories({ type: 'Ataque/Cura (imediato)' })).toEqual([ 'attack', 'heal' ]);
        expect(spellTileCategories({ type: 'Ataque/Recuperação (imediato)' })).toEqual([ 'attack', 'heal' ]);
    });
});

describe('classifyItem', () => {
    it('arremessável é ataque e gasta a Padrão', () => {
        expect(classifyItem(item({ kind: 'Arremessável', name: 'Granada' }))).toEqual({ category: 'attack', execution: 'Padrão' });
    });

    it('o que cura (pelo nome, descrição ou efeitos) é cura, e tirar da bolsa gasta Movimento', () => {
        expect(classifyItem(item({ kind: 'Consumível', name: 'Poção de Cura' }))).toEqual({ category: 'heal', execution: 'Movimento' });
        expect(classifyItem(item({ kind: 'Consumível', name: 'Elixir', description: 'Recupera 10 de vida.' }))?.category).toBe('heal');
        expect(classifyItem(item({ kind: 'Consumível', name: 'Elixir', description: '', effects: [ 'Regenera 2 LP por turno' ] }))?.category).toBe('heal');
    });

    it('o resto que se usa é Outros; palavras parecidas não enganam (procurar não é cura)', () => {
        expect(classifyItem(item())).toEqual({ category: 'other', execution: 'Movimento' });
        expect(classifyItem(item({ kind: 'Especial', description: 'Ajuda a procurar passagens secretas.' }))?.category).toBe('other');
    });

    it('munição, capacidade, item-chave, equipamento e item acabado não entram', () => {
        const inert: Array<Item['kind']> = [ 'Munição', 'Capacidade', 'Item Chave', 'Equipamento' ];
        for (const kind of inert) {
            expect(classifyItem(item({ kind }))).toBeNull();
        }
        expect(classifyItem(item({ quantity: 0 }))).toBeNull();
        expect(classifyItem(item({ quantity: undefined }))).not.toBeNull();
    });
});

describe('buildActionTiles', () => {
    it('toda arma é um quadrado de ataque que gasta a Padrão e mostra o dano', () => {
        const [ tile ] = build({ weapons: [ weapon() ] });

        expect(tile).toMatchObject({ kind: 'weapon', category: 'attack', execution: 'Padrão', name: 'Espada Longa', detail: '1d8' });
    });

    it('no ataque de oportunidade a arma branca gasta a Reação; arma de fogo continua na Padrão', () => {
        const pistol = weapon({ id: 'w2', name: 'Pistola', categ: 'Arma de Fogo', range: 'Médio (18m)' } as unknown as Partial<Weapon>);
        const tiles = build({ weapons: [ weapon(), pistol ], opportunityActive: true });

        expect(tiles.map(tile => tile.execution)).toEqual([ 'Reação', 'Padrão' ]);
    });

    it('a magia entra na categoria dela com a execução e o custo; a de duas categorias vira dois quadrados', () => {
        const tiles = build({
            spells: [
                spell(),
                spell({ id: 's2', name: 'Cura Leve', type: 'Cura (imediato)', execution: 'Bônus' }),
                spell({ id: 's3', name: 'Dreno Vital', type: 'Ataque/Cura (imediato)' }),
                spell({ id: 's4', name: 'Muralha', type: 'Defesa (contínuo)', execution: 'Completa' })
            ]
        });

        expect(tiles.map(tile => [ tile.name, tile.category, tile.execution ])).toEqual([
            [ 'Brasa Voraz', 'attack', 'Padrão' ],
            [ 'Cura Leve', 'heal', 'Bônus' ],
            [ 'Dreno Vital', 'attack', 'Padrão' ],
            [ 'Dreno Vital', 'heal', 'Padrão' ],
            [ 'Muralha', 'other', 'Completa' ]
        ]);
        expect(tiles[0]).toMatchObject({ detail: '3 MP' });
        expect(new Set(tiles.map(tile => tile.id)).size).toBe(tiles.length);
    });

    it('magia com execução desconhecida entra, sem ação para gastar', () => {
        const tiles = build({ spells: [ spell({ execution: 'Ritual' }) ] });

        expect(tiles).toHaveLength(1);
        expect(tiles[0]?.execution).toBeNull();
    });

    it('os itens usáveis entram e os inertes ficam de fora', () => {
        const tiles = build({
            items: [
                item({ id: 'i1', name: 'Granada', kind: 'Arremessável' }),
                item({ id: 'i2', name: 'Poção de Cura', kind: 'Consumível' }),
                item({ id: 'i3' }),
                item({ id: 'i4', name: 'Balas', kind: 'Munição' })
            ]
        });

        expect(tiles.map(tile => [ tile.name, tile.category ])).toEqual([ [ 'Granada', 'attack' ], [ 'Poção de Cura', 'heal' ], [ 'Corda', 'other' ] ]);
    });

    it('sem nada na ficha, nenhum quadrado', () => {
        expect(build()).toEqual([]);
    });
});

describe('filtro, grupos e contadores', () => {
    const tiles = build({
        weapons: [ weapon() ],
        spells: [
            spell({ id: 'a', name: 'A', execution: 'Movimento', type: 'Utilidade' }),
            spell({ id: 'b', name: 'B', execution: 'Reação' }),
            spell({ id: 'c', name: 'C', type: 'Cura (imediato)', execution: 'Completa' })
        ],
        items: [ item() ]
    });

    it('sem filtro mostra tudo; com ele, só quem gasta aquela ação (Completa não aparece em Padrão)', () => {
        expect(filterTiles(tiles, null)).toHaveLength(tiles.length);
        expect(filterTiles(tiles, 'Padrão').map(tile => tile.name)).toEqual([ 'Espada Longa' ]);
        expect(filterTiles(tiles, 'Movimento').map(tile => tile.name)).toEqual([ 'A', 'Corda' ]);
        expect(filterTiles(tiles, 'Reação').map(tile => tile.name)).toEqual([ 'B' ]);
        expect(filterTiles(tiles, 'Completa').map(tile => tile.name)).toEqual([ 'C' ]);
        expect(filterTiles(tiles, 'Bônus')).toEqual([]);
    });

    it('agrupa em ataque, cura e outros, e conta por ação', () => {
        const groups = groupTiles(tiles);

        expect(groups.attack.map(tile => tile.name)).toEqual([ 'Espada Longa', 'B' ]);
        expect(groups.heal.map(tile => tile.name)).toEqual([ 'C' ]);
        expect(groups.other.map(tile => tile.name)).toEqual([ 'A', 'Corda' ]);
        expect(countByExecution(tiles)).toEqual({ 'Padrão': 1, 'Movimento': 2, 'Bônus': 0, 'Reação': 1, 'Completa': 1 });
    });
});

describe('isTileSpent', () => {
    const tile = (execution: Parameters<typeof tileExecution>[0]) => ({ execution: tileExecution(execution) });

    it('com a rodada nova nada está gasto', () => {
        for (const execution of [ 'Padrão', 'Bônus', 'Movimento', 'Reação', 'Completa' ]) {
            expect(isTileSpent(tile(execution), freshBudget())).toBe(false);
        }
    });

    it('gastar a Padrão apaga todo quadrado de Padrão e a Completa, e só eles', () => {
        const budget = { ...freshBudget(), padrao: 0 };

        expect(isTileSpent(tile('Padrão'), budget)).toBe(true);
        expect(isTileSpent(tile('Completa'), budget)).toBe(true);
        expect(isTileSpent(tile('Bônus'), budget)).toBe(false);
        expect(isTileSpent(tile('Movimento'), budget)).toBe(false);
        expect(isTileSpent(tile('Reação'), budget)).toBe(false);
    });

    it('a Reação gasta não apaga a Completa (ela não usa a Reação)', () => {
        const budget = { ...freshBudget(), reacao: 0 };

        expect(isTileSpent(tile('Reação'), budget)).toBe(true);
        expect(isTileSpent(tile('Completa'), budget)).toBe(false);
    });

    it('com ações extras (passivas) o quadrado só apaga quando acabam todas; sem ação reconhecida nunca apaga', () => {
        expect(isTileSpent(tile('Padrão'), { ...freshBudget(), padrao: 1 })).toBe(false);
        expect(isTileSpent({ execution: null }, { padrao: 0, bonus: 0, movimento: 0, reacao: 0 })).toBe(false);
    });
});

describe('quadrados das habilidades ativadas', () => {
    const abilities = [ 'Cura Interior', 'Postura Defensiva', 'Avatar da Destruição' ].map(name => findPassive(name === 'Cura Interior' ? 'class' : 'subclass', name)!);

    it('cada habilidade ativada vira um quadrado: a que cura em Cura, as outras em Outros, com a ação dela', () => {
        const tiles = buildActionTiles({ weapons: [], spells: [], items: [], abilities, abilityDetail: ability => ability.name.length > 15 ? 'longa' : 'curta' });

        expect(tiles.map(tile => [ tile.name, tile.kind, tile.category, tile.execution, tile.detail ])).toEqual([
            [ 'Cura Interior', 'ability', 'heal', 'Bônus', 'curta' ],
            [ 'Postura Defensiva', 'ability', 'other', 'Bônus', 'longa' ],
            [ 'Avatar da Destruição', 'ability', 'other', 'Completa', 'longa' ]
        ]);
        expect(countByExecution(tiles)).toMatchObject({ 'Bônus': 2, 'Completa': 1, 'Padrão': 0 });
    });

    it('passiva automática não vira quadrado, e a ação gasta apaga o quadrado como nos outros', () => {
        const tiles = buildActionTiles({ weapons: [], spells: [], items: [], abilities: [ findPassive('class', 'Armado')!, ...abilities ] });
        expect(tiles).toHaveLength(3);

        const bonus = tiles.find(tile => tile.name === 'Cura Interior')!;
        expect(isTileSpent(bonus, { ...freshBudget(), bonus: 0 })).toBe(true);
        const complete = tiles.find(tile => tile.name === 'Avatar da Destruição')!;
        expect(isTileSpent(complete, { ...freshBudget(), movimento: 0 })).toBe(true);
    });
});
