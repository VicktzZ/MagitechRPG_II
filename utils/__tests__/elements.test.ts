import { SECONDARY_ELEMENTS } from '../../constants/secondaryElements';
import { SECONDARY_ELEMENTS_RULE, elementHint, isSecondaryElement } from '../elements';

describe('isSecondaryElement', () => {
    it('reconhece os cinco secundários em qualquer caixa e com ou sem acento', () => {
        [ 'Sangue', 'SANGUE', 'sangue', 'Vácuo', 'VÁCUO', 'vacuo', 'Psíquico', 'PSÍQUICO', 'psiquico', 'Radiação', 'RADIAÇÃO', 'Explosão', 'EXPLOSÃO', 'EXPLOSAO' ].forEach(element => {
            expect(isSecondaryElement(element)).toBe(true);
        });
    });

    it('os primários e o resto não são secundários', () => {
        [ 'Fogo', 'ÁGUA', 'Terra', 'Ar', 'Eletricidade', 'Luz', 'Trevas', 'NÃO-ELEMENTAL', 'Tóxico', 'Gelo', '', '  ' ].forEach(element => {
            expect(isSecondaryElement(element)).toBe(false);
        });
    });

    it('o que não é texto não é elemento', () => {
        [ undefined, null, 5, {}, [ 'Sangue' ] ].forEach(value => expect(isSecondaryElement(value)).toBe(false));
    });

    it('espaços nas pontas não atrapalham', () => {
        expect(isSecondaryElement('  Sangue ')).toBe(true);
    });

    it('a lista de constantes e a regra por extenso dizem a mesma coisa', () => {
        expect([ ...SECONDARY_ELEMENTS ].sort()).toEqual([ 'Explosão', 'Psíquico', 'Radiação', 'Sangue', 'Vácuo' ]);
        SECONDARY_ELEMENTS.forEach(element => expect(SECONDARY_ELEMENTS_RULE).toContain(element));
        expect(SECONDARY_ELEMENTS_RULE).toBe('Sangue, Vácuo, Psíquico, Radiação e Explosão são elementos secundários.');
    });
});

describe('elementHint', () => {
    it('marca só os secundários, para as listas de filtro', () => {
        expect(elementHint('Sangue')).toBe('secundário');
        expect(elementHint('PSÍQUICO')).toBe('secundário');
        expect(elementHint('Fogo')).toBeUndefined();
        expect(elementHint('')).toBeUndefined();
    });
});
