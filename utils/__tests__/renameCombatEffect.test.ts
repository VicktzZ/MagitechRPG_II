import { NEW_NAME, OLD_NAME, planRename } from '../../scripts/renameCombatEffect';

describe('planRename (efeito Visão na Penumbra → Visão Aprimorada)', () => {
    it('com o nome antigo, renomeia (qualquer caixa e acento)', () => {
        expect(planRename(OLD_NAME, OLD_NAME, NEW_NAME)).toBe('update');
        expect(planRename('visao na penumbra', OLD_NAME, NEW_NAME)).toBe('update');
        expect(planRename('  VISÃO NA PENUMBRA ', OLD_NAME, NEW_NAME)).toBe('update');
    });

    it('com o nome novo, não há nada a fazer', () => {
        expect(planRename(NEW_NAME, OLD_NAME, NEW_NAME)).toBe('already');
        expect(planRename('visao aprimorada', OLD_NAME, NEW_NAME)).toBe('already');
    });

    it('outro nome (alguém editou à mão) é conflito e não se mexe', () => {
        expect(planRename('Visão Noturna', OLD_NAME, NEW_NAME)).toBe('conflict');
        expect(planRename('', OLD_NAME, NEW_NAME)).toBe('conflict');
    });

    it('sem o documento, é inexistente', () => {
        expect(planRename(undefined, OLD_NAME, NEW_NAME)).toBe('missing');
    });

    it('desfazer inverte os nomes', () => {
        expect(planRename(NEW_NAME, NEW_NAME, OLD_NAME)).toBe('update');
        expect(planRename(OLD_NAME, NEW_NAME, OLD_NAME)).toBe('already');
    });
});
