import { SECONDARY_ELEMENTS, SECONDARY_ELEMENTS_UNLOCK_LEVEL } from '../../constants/secondaryElements';
import {
    isHiddenSpell,
    isSecondaryElement,
    secondaryElementsUnlocked,
    secondaryElementsUnlockedNotice,
    unlocksSecondaryElements
} from '../elements';

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

    it('a lista de constantes tem os cinco elementos secundários', () => {
        expect([ ...SECONDARY_ELEMENTS ].sort()).toEqual([ 'Explosão', 'Psíquico', 'Radiação', 'Sangue', 'Vácuo' ]);
    });
});

describe('liberação dos elementos secundários no nível 10', () => {
    it('o nível de liberação é o 10', () => {
        expect(SECONDARY_ELEMENTS_UNLOCK_LEVEL).toBe(10);
    });

    it.each([ [ 1, false ], [ 9, false ], [ 10, true ], [ 11, true ], [ 20, true ], [ '9', false ], [ '10', true ], [ undefined, false ], [ null, false ], [ 'x', false ] ])(
        'ficha nível %p: liberada = %p',
        (level, expected) => {
            expect(secondaryElementsUnlocked(level)).toBe(expected);
        }
    );

    it('antes do nível 10 a magia de elemento secundário fica escondida, em qualquer grafia do elemento', () => {
        [ 'SANGUE', 'Vácuo', 'PSÍQUICO', 'psiquico', 'RADIAÇÃO', 'Explosão' ].forEach(element => {
            expect(isHiddenSpell({ element }, 9)).toBe(true);
            expect(isHiddenSpell({ element }, 10)).toBe(false);
        });
    });

    it('a magia de elemento primário nunca fica escondida', () => {
        [ 'FOGO', 'ÁGUA', 'TERRA', 'AR', 'ELETRICIDADE', 'LUZ', 'TREVAS', 'NÃO-ELEMENTAL' ].forEach(element => {
            expect(isHiddenSpell({ element }, 1)).toBe(false);
        });
        expect(isHiddenSpell({}, 1)).toBe(false);
    });

    it('o aviso sai só quando a subida de nível chega ao 10 pela primeira vez', () => {
        expect(unlocksSecondaryElements(9, 10)).toBe(true);
        expect(unlocksSecondaryElements(1, 20)).toBe(true);
        expect(unlocksSecondaryElements(8, 9)).toBe(false);
        expect(unlocksSecondaryElements(10, 11)).toBe(false);
        expect(unlocksSecondaryElements(12, 20)).toBe(false);
    });

    it('a notificação diz "Elementos secundários desbloqueados!" e lista os cinco elementos logo abaixo', () => {
        const { title, content } = secondaryElementsUnlockedNotice();
        expect(title).toBe('Elementos secundários desbloqueados!');
        expect(content.split('\n')).toEqual([ 'Sangue', 'Vácuo', 'Psíquico', 'Radiação', 'Explosão' ]);
    });
});
