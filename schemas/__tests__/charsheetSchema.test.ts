import { healthySheet, type Sheet } from '@utils/__tests__/charsheetFixture';
import { normalizeCharsheet } from '@utils/charsheetNormalize';
import { buildCharsheetSchema } from '../charsheetSchema';

const healthy = healthySheet;

const paths = (schemaResult: { success: boolean; error?: { issues: Array<{ path: Array<string | number> }> } }): string[] =>
    schemaResult.success ? [] : schemaResult.error!.issues.map(issue => issue.path.join('.'));

describe('charsheetSchema', () => {
    const create = buildCharsheetSchema({ mode: 'create' });

    test('ficha saudável passa na criação e na edição', () => {
        expect(create.safeParse(healthy()).success).toBe(true);
        expect(buildCharsheetSchema({ mode: 'edit', getBaseline: () => healthy() }).safeParse(healthy()).success).toBe(true);
    });

    describe('criação', () => {
        test('exige gastar todos os pontos de atributo e de perícia', () => {
            const sheet = healthy();
            sheet.points = { attributes: 5, expertises: 2, skills: 0, magics: 0 };
            expect(paths(create.safeParse(sheet))).toEqual(expect.arrayContaining([ 'points.attributes', 'points.expertises' ]));
        });

        test('atributo acima de 30 e perícia acima de 10 são recusados', () => {
            const sheet = healthy();
            sheet.attributes.foc = 31;
            sheet.expertises.Luta.value = 11;
            expect(paths(create.safeParse(sheet))).toEqual(expect.arrayContaining([ 'attributes.foc', 'expertises.Luta.value' ]));
        });

        test('sistema padrão exige classe, raça e linhagem; sistema customizado e edição não', () => {
            const empty = healthy();
            empty.class = '';
            empty.race = '';
            empty.lineage = '';
            expect(paths(create.safeParse(empty))).toEqual(expect.arrayContaining([ 'class', 'race', 'lineage' ]));

            const apocalypse = { ...empty, mode: 'Apocalypse' };
            const result = create.safeParse(apocalypse);
            expect(!result.success && result.error.issues.find(issue => issue.path[0] === 'lineage')?.message).toBe('Escolha a profissão do personagem');

            expect(create.safeParse({ ...empty, systemId: 'sistema-1' }).success).toBe(true);
            expect(buildCharsheetSchema({ mode: 'edit', getBaseline: () => empty }).safeParse(empty).success).toBe(true);
        });

        test('exige nome, jogador e dono', () => {
            const sheet = healthy();
            sheet.name = '';
            sheet.playerName = '';
            sheet.userId = '';
            expect(paths(create.safeParse(sheet))).toEqual(expect.arrayContaining([ 'name', 'playerName', 'userId' ]));
        });

        test('um item comum sem munição não reclama de campos de arma', () => {
            const sheet = healthy();
            sheet.inventory.items = [ { id: 'i1', name: 'Poção', description: 'x', kind: 'Consumível', weight: 1, quantity: 1, rarity: 'Comum' } ];
            expect(create.safeParse(sheet).success).toBe(true);
        });
    });

    describe('edição de ficha criada', () => {
        const edit = (baseline: Sheet) => buildCharsheetSchema({ mode: 'edit', getBaseline: () => baseline });

        test('pontos para gastar não bloqueiam', () => {
            const sheet = healthy();
            sheet.points = { attributes: 12, expertises: 3, skills: 1, magics: 2 };
            expect(edit(sheet).safeParse(sheet).success).toBe(true);
        });

        test('gastar mais pontos do que tem bloqueia, mas um saldo negativo herdado não', () => {
            const baseline = healthy();
            baseline.points = { attributes: -2, expertises: 0, skills: 0, magics: 0 };
            const same = JSON.parse(JSON.stringify(baseline));
            expect(edit(baseline).safeParse(same).success).toBe(true);

            const worse = JSON.parse(JSON.stringify(baseline));
            worse.points.attributes = -3;
            expect(paths(edit(baseline).safeParse(worse))).toContain('points.attributes');
        });

        test('atributo e perícia acima do teto só bloqueiam quem aumenta', () => {
            const baseline = healthy();
            baseline.attributes.vig = 32;
            baseline.expertises.Luta.value = 12;

            const same = JSON.parse(JSON.stringify(baseline));
            expect(edit(baseline).safeParse(same).success).toBe(true);

            const lower = JSON.parse(JSON.stringify(baseline));
            lower.attributes.vig = 31;
            lower.expertises.Luta.value = 11;
            expect(edit(baseline).safeParse(lower).success).toBe(true);

            const higher = JSON.parse(JSON.stringify(baseline));
            higher.attributes.vig = 33;
            higher.expertises.Luta.value = 13;
            expect(paths(edit(baseline).safeParse(higher))).toEqual(expect.arrayContaining([ 'attributes.vig', 'expertises.Luta.value' ]));
        });

        test('aceita decimais em dinheiro e AP, nomes repetidos e arma sem munição', () => {
            const sheet = healthy();
            sheet.inventory.money = 12.5;
            sheet.stats.ap = 4.5;
            sheet.stats.maxAp = 4.5;
            const item = { id: 'i1', name: 'Poção', description: 'x', kind: 'Consumível', weight: 1, quantity: 1, rarity: 'Comum' };
            sheet.inventory.items = [ item, { ...item, id: 'i2' } ];
            sheet.inventory.weapons = [ { id: 'w1', name: 'Pistola', description: 'x', weight: 1, quantity: 1, rarity: 'Comum', kind: 'Arma', categ: 'Pistola' } ];
            expect(edit(sheet).safeParse(sheet).success).toBe(true);
        });

        test('aceita dano com multiplicador e maiúscula, e munição fora do enum antigo', () => {
            const sheet = healthy();
            sheet.inventory.weapons = [ {
                id: 'w1', name: 'Bumerangue', description: 'x', weight: 1, quantity: 1, rarity: 'Comum', kind: 'Arma', categ: 'Arremesso',
                ammo: 'Dardo', bonus: '', hit: 'des', effect: { value: '2d6x2', critValue: '4D6', critChance: 20, effectType: 'Cortante' }
            } ];
            expect(edit(sheet).safeParse(sheet).success).toBe(true);
        });

        test('dano mal escrito numa arma nova é recusado', () => {
            const baseline = healthy();
            const sheet = healthy();
            sheet.inventory.weapons = [ {
                id: 'w1', name: 'Faca', description: 'x', weight: 1, quantity: 1, rarity: 'Comum', kind: 'Arma', categ: 'Branca',
                ammo: 'Não consome', bonus: '', hit: 'des', effect: { value: 'muito', critValue: '', critChance: 20 }
            } ];
            expect(paths(edit(baseline).safeParse(sheet))).toContain('inventory.weapons.0.effect.value');
        });

        test('spellUnlocked e spellStages aceitam estágios de 1 a 3 e recusam fora disso', () => {
            const baseline = healthy();
            const sheet = healthy();
            sheet.spellStages = { m1: 2 };
            sheet.spellUnlocked = { m1: 3, 'Magia sem id': 1 };
            expect(edit(baseline).safeParse(sheet).success).toBe(true);

            sheet.spellUnlocked = { m1: 4 };
            expect(paths(edit(baseline).safeParse(sheet))).toContain('spellUnlocked.m1');
        });

        test('points.evolution aceita 0 ou mais e ficha sem o campo continua válida', () => {
            const baseline = healthy();
            const sheet = healthy();
            expect(edit(baseline).safeParse(sheet).success).toBe(true);

            sheet.points.evolution = 3;
            expect(edit(baseline).safeParse(sheet).success).toBe(true);

            sheet.points.evolution = -1;
            expect(paths(edit(baseline).safeParse(sheet))).toContain('points.evolution');
        });

        test('chaves desconhecidas sobrevivem (perks da sessão, campos de item)', () => {
            const sheet = healthy();
            sheet.session = [ { campaignCode: 'ABC', stats: { lp: 1 }, perks: [ { id: 'p1', name: 'Vantagem' } ] } ];
            sheet.inventory.items = [ { id: 'i1', name: 'Chip', description: '', weight: 0, quantity: 1, rarity: 'Comum', ap: 3, level: 2, space: 1 } ];
            const parsed = edit(sheet).parse(sheet);
            expect(parsed.session[0].perks).toEqual([ { id: 'p1', name: 'Vantagem' } ]);
            expect(parsed.inventory.items[0]).toMatchObject({ ap: 3, level: 2, space: 1 });
        });
    });

    describe('fichas no formato antigo (depois de normalizar)', () => {
        const legacy = (): Sheet => {
            const sheet = healthy();
            sheet.elementalMastery = null;
            sheet.anotacoes = null;
            sheet.financialCondition = [ 'Estável' ];
            sheet.inventory.items = { 0: { id: 'i1', name: 'Poção', description: 'x', kind: 'Consumível', weight: 1, quantity: 1, rarity: 'Comum' } };
            sheet.inventory.weapons = { 0: { id: 'w1', name: 'Pistola', description: 'x', weight: 1, quantity: 1, rarity: 'Comum', kind: 'Arma', categ: 'Pistola', effect: { value: '1d6', critValue: '2d6', critChance: '19' } } };
            sheet.skills.bonus = { 0: { name: 'A', description: 'B', type: 'Bônus' } };
            sheet.expertises.Luta = 3;
            sheet.expertises.Magia = { value: 2 };
            return sheet;
        };

        test('o formato antigo cru é recusado pelo schema (é por isso que a carga normaliza)', () => {
            expect(create.safeParse(legacy()).success).toBe(false);
        });

        test('normalizado, passa', () => {
            const normalized = normalizeCharsheet(legacy());
            const result = create.safeParse(normalized);
            expect(paths(result)).toEqual([]);
            expect(result.success).toBe(true);
        });
    });
});
