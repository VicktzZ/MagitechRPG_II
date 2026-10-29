import { ballisticWeaponAmmo, energyWeaponAmmo, otherWeaponAmmo } from '@constants/dataTypes';
import { defaultWeapons } from '@constants/defaultWeapons';
import { DICE_NOTATION_REGEX, isDiceNotation } from '@utils/diceNotation';
import { weaponEffectSchema, weaponSchema } from '../itemsSchemas';

const catalogWeapons = Object.values(defaultWeapons).flat();

const validWeapon = {
    name: 'Bumerangue de teste',
    description: 'Volta para a mão',
    rarity: 'Comum',
    weight: 1,
    quantity: 1,
    ammo: 'Não consome',
    categ: 'Arma Branca (Leve)',
    bonus: 'Pontaria',
    hit: 'des',
    kind: 'Arremessável (9m)',
    range: 'Curto',
    accessories: [ 'Não possui acessórios' ],
    magazineSize: 0,
    effect: { effectType: 'Cortante', critChance: 19, critValue: '4d6', value: '2d6x2' }
};

describe('dano da arma no formulário de criação usa a mesma notação da ficha (utils/diceNotation)', () => {
    const effect = (value: string, critValue = '2d6') => weaponEffectSchema.safeParse({ effectType: 'Cortante', critChance: 20, value, critValue });

    it.each([ '1d6', '2D6', '2d6x2', '1d8+2', '1d8+2d4', '1d10-1', '2d4+2d4', '10d6x3' ])('aceita %s', (dano) => {
        expect(effect(dano).success).toBe(true);
        expect(effect('1d6', dano).success).toBe(true);
        expect(isDiceNotation(dano)).toBe(true);
    });

    it.each([ '', 'abc', '1d', 'd6', '2d6xx', '2d6x', '1d6+', '1d6 + 2', '2 d6' ])('recusa "%s"', (dano) => {
        expect(effect(dano).success).toBe(false);
        expect(effect('1d6', dano).success).toBe(false);
    });

    it('apara espaços nas pontas e grava o texto aparado', () => {
        const result = effect(' 2d6x2 ', ' 4d6 ');
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.value).toBe('2d6x2');
            expect(result.data.critValue).toBe('4d6');
        }
    });

    it('mostra a mensagem de formato compartilhada', () => {
        const result = effect('xyz');
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0]?.message).toMatch(/XdY/);
        }
    });

    it('arma completa com dano 2d6x2 passa no schema da arma', () => {
        expect(weaponSchema.safeParse(validWeapon).success).toBe(true);
    });

    it('todas as armas do catálogo têm dano e dano crítico aceitos', () => {
        const recusadas = catalogWeapons
            .filter(weapon => !(DICE_NOTATION_REGEX.test(weapon.effect?.value ?? '') && DICE_NOTATION_REGEX.test(weapon.effect?.critValue ?? '')))
            .map(weapon => weapon.name);
        expect(recusadas).toEqual([]);
    });

    it('o catálogo tem armas com multiplicador (2d6x2) que a regra antiga recusava', () => {
        const antiga = /^(?:\d+d(?:\d+)(?:[-+]\d+)?)$/i;
        const soNaNova = catalogWeapons.filter(weapon => !antiga.test(weapon.effect?.value ?? '') || !antiga.test(weapon.effect?.critValue ?? ''));
        expect(soNaNova.length).toBeGreaterThan(0);
        expect(soNaNova.every(weapon => weapon.effect && DICE_NOTATION_REGEX.test(weapon.effect.value) && DICE_NOTATION_REGEX.test(weapon.effect.critValue))).toBe(true);
    });
});

describe('munição que o modal de arma oferece é a que o schema da arma aceita', () => {
    const offered = [ 'Não consome', ...ballisticWeaponAmmo, ...energyWeaponAmmo, ...otherWeaponAmmo ];

    it('inclui Dardo e Ácido', () => {
        expect(offered).toEqual(expect.arrayContaining([ 'Dardo', 'Ácido' ]));
    });

    it.each(offered)('aceita "%s"', (ammo) => {
        expect(weaponSchema.safeParse({ ...validWeapon, ammo }).success).toBe(true);
    });

    it('recusa munição vazia', () => {
        expect(weaponSchema.safeParse({ ...validWeapon, ammo: '' }).success).toBe(false);
    });

    it('toda munição usada no catálogo de armas está entre as opções do modal', () => {
        const usadas = new Set(catalogWeapons.map(weapon => weapon.ammo ?? 'Não consome'));
        const fora = [ ...usadas ].filter(ammo => !offered.includes(ammo));
        expect(fora).toEqual([]);
    });
});
