import { normalizeCharsheet, planNormalization } from '@utils/charsheetNormalize';
import { healthySheet, type Sheet } from './charsheetFixture';

describe('normalizeCharsheet', () => {
    test('uma ficha saudável não muda', () => {
        const sheet = healthySheet();
        expect(normalizeCharsheet(sheet)).toEqual(sheet);
    });

    test('é idempotente', () => {
        const sheet = healthySheet();
        sheet.inventory.items = { 0: { id: 'i1', name: 'Poção' } };
        sheet.elementalMastery = null;
        const once = normalizeCharsheet(sheet);
        expect(normalizeCharsheet(once)).toEqual(once);
    });

    test('não altera o objeto recebido', () => {
        const sheet = healthySheet();
        sheet.inventory.items = { 0: { id: 'i1', name: 'Poção' } };
        const copy = JSON.parse(JSON.stringify(sheet));
        normalizeCharsheet(sheet);
        expect(sheet).toEqual(copy);
    });

    test('listas gravadas como objeto de chaves numéricas viram array, na ordem das chaves', () => {
        const sheet = healthySheet();
        sheet.inventory.items = { 1: { id: 'b', name: 'B' }, 0: { id: 'a', name: 'A' } };
        sheet.inventory.weapons = { 0: { id: 'w', name: 'Pistola' } };
        sheet.skills.class = { 0: { name: 'X', description: 'y', type: 'Classe' } };
        sheet.skills.powers = { 0: 'power-id-1' };
        sheet.passives = { 0: { id: 'p', title: 'T', description: '', occasion: 'Sempre ativo' } };
        sheet.traits = { 0: 'Corajoso' };
        const normalized = normalizeCharsheet(sheet);
        expect(normalized.inventory.items.map((i: Sheet) => i.id)).toEqual([ 'a', 'b' ]);
        expect(normalized.inventory.weapons).toHaveLength(1);
        expect(normalized.skills.class).toHaveLength(1);
        expect(normalized.skills.powers).toEqual([ 'power-id-1' ]);
        expect(normalized.passives).toHaveLength(1);
        expect(normalized.traits).toEqual([ 'Corajoso' ]);
    });

    test('effects de habilidade gravado como objeto vira lista', () => {
        const sheet = healthySheet();
        sheet.skills.bonus = [ { name: 'A', description: 'b', type: 'Bônus', effects: { 0: 'x', 1: 'y' } } ];
        sheet.skills.powers = [ { id: 'p', name: 'P', effects: { 0: 'z' } }, 'id-solto' ];
        const normalized = normalizeCharsheet(sheet);
        expect(normalized.skills.bonus[0].effects).toEqual([ 'x', 'y' ]);
        expect(normalized.skills.powers).toEqual([ { id: 'p', name: 'P', effects: [ 'z' ] }, 'id-solto' ]);
    });

    test('campos de texto com null, número ou lista viram texto', () => {
        const sheet = healthySheet();
        sheet.elementalMastery = null;
        sheet.anotacoes = null;
        sheet.financialCondition = [ 'Estável' ];
        sheet.lineage = null;
        const normalized = normalizeCharsheet(sheet);
        expect(normalized.elementalMastery).toBe('');
        expect(normalized.anotacoes).toBe('');
        expect(normalized.financialCondition).toBe('');
        expect(normalized.lineage).toBe('');
    });

    test('idade ausente ou inválida vira número', () => {
        expect(normalizeCharsheet({ ...healthySheet(), age: null }).age).toBe(0);
        expect(normalizeCharsheet({ ...healthySheet(), age: '25' }).age).toBe(25);
    });

    test('perícia solta vira objeto com valor e atributo base', () => {
        const sheet = healthySheet();
        sheet.expertises.Luta = 3;
        sheet.expertises.Magia = { value: 2 };
        const normalized = normalizeCharsheet(sheet);
        expect(normalized.expertises.Luta).toEqual({ value: 3, defaultAttribute: null });
        expect(normalized.expertises.Magia).toEqual({ value: 2, defaultAttribute: null });
        expect(normalized.expertises.Fortitude).toEqual({ value: 0, defaultAttribute: null });
    });

    test('arma incompleta ganha os campos que o schema exige e mantém os que já tinha', () => {
        const sheet = healthySheet();
        sheet.inventory.weapons = [ { id: 'w', name: 'Pistola', quantity: '2', weight: '1,5', rarity: 'Comum', effect: { value: '1d6', critValue: '2d6', critChance: '19' }, weaponKind: 'Pistola' } ];
        const [ weapon ] = normalizeCharsheet(sheet).inventory.weapons;
        expect(weapon).toMatchObject({ ammo: 'Não consome', bonus: '', hit: '', categ: '', quantity: 2, weight: 1.5, weaponKind: 'Pistola' });
        expect(weapon.effect.critChance).toBe(19);
    });

    test('item sem nome sai da lista', () => {
        const sheet = healthySheet();
        sheet.inventory.items = [ { id: 'x', description: 'sem nome' }, { id: 'y', name: '  ' }, { id: 'z', name: 'Chip' } ];
        expect(normalizeCharsheet(sheet).inventory.items.map((i: Sheet) => i.id)).toEqual([ 'z' ]);
    });

    test('sessão: vantagens em objeto viram lista e nada é acrescentado', () => {
        const sheet = healthySheet();
        sheet.session = [ { campaignCode: 'ABC', perks: { 0: { id: 'p1', name: 'V' } } }, { campaignCode: 'XYZ' } ];
        const [ entry, bare ] = normalizeCharsheet(sheet).session;
        expect(entry.perks).toEqual([ { id: 'p1', name: 'V' } ]);
        expect(bare).toEqual({ campaignCode: 'XYZ' });
    });

    test('recursos e campos customizados perdem as chaves nulas', () => {
        const sheet = healthySheet();
        sheet.customResources = { bateria: 80, o2: null };
        sheet.customFields = { Altura: '1,70', Peso: null };
        const normalized = normalizeCharsheet(sheet);
        expect(normalized.customResources).toEqual({ bateria: 80 });
        expect(normalized.customFields).toEqual({ Altura: '1,70' });
    });

    test('não inventa chaves que a ficha não tinha', () => {
        const normalized = normalizeCharsheet({ name: 'Só nome' });
        expect(Object.keys(normalized)).toEqual([ 'name' ]);
    });
});

describe('planNormalization', () => {
    test('ficha no formato certo não gera nada', () => {
        expect(planNormalization(healthySheet())).toEqual({});
    });

    test('lista só o que mudaria, com caminho, e regrava só a lista afetada do inventário', () => {
        const sheet = healthySheet();
        sheet.inventory.items = { 0: { id: 'i1', name: 'Poção' } };
        sheet.elementalMastery = null;
        sheet.skills.bonus = { 0: { name: 'A', description: 'b', type: 'Bônus' } };
        expect(planNormalization(sheet)).toEqual({
            'inventory.items': [ { id: 'i1', name: 'Poção' } ],
            elementalMastery: '',
            'skills.bonus': [ { name: 'A', description: 'b', type: 'Bônus' } ]
        });
    });

    test('é idempotente: aplicar o plano e planejar de novo dá vazio', () => {
        const sheet = healthySheet();
        sheet.inventory.weapons = { 0: { id: 'w', name: 'Pistola' } };
        sheet.expertises.Luta = 3;
        sheet.anotacoes = null;
        const plan = planNormalization(sheet);
        const applied = { ...sheet, anotacoes: plan['anotacoes'], expertises: plan['expertises'], inventory: { ...sheet.inventory, weapons: plan['inventory.weapons'] } };
        expect(planNormalization(applied)).toEqual({});
    });

    test('não apaga item sem nome', () => {
        const sheet = healthySheet();
        sheet.inventory.items = [ { id: 'x', description: 'sem nome' } ];
        expect(planNormalization(sheet)).toEqual({});
    });

    test('não mexe em session nem em chaves que a ficha não tem', () => {
        const sheet = healthySheet();
        sheet.session = [ { campaignCode: 'ABC', stats: { lp: 1 }, perks: [ { id: 'p' } ] } ];
        delete sheet.customFields;
        expect(planNormalization(sheet)).toEqual({});
    });
});
