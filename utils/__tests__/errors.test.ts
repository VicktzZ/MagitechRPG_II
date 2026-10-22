import { asRequestError, errorMessage } from '../errors';

describe('errorMessage', () => {
    it('prefere o erro devolvido pela API', () => {
        const error = { message: 'Request failed with status code 400', response: { status: 400, data: { error: 'Nome inválido' } } };
        expect(errorMessage(error, 'Erro')).toBe('Nome inválido');
    });

    it('usa o texto padrão quando a requisição falhou sem corpo útil', () => {
        expect(errorMessage({ message: 'Network Error', isAxiosError: true }, 'Erro ao salvar')).toBe('Erro ao salvar');
        expect(errorMessage({ message: 'Request failed', response: { status: 500, data: {} } }, 'Erro ao salvar')).toBe('Erro ao salvar');
    });

    it('usa a mensagem de uma exceção comum', () => {
        expect(errorMessage(new Error('Campanha já finalizada'), 'Erro')).toBe('Campanha já finalizada');
    });

    it('cai no texto padrão para qualquer outra coisa', () => {
        expect(errorMessage(undefined, 'Erro')).toBe('Erro');
        expect(errorMessage('texto solto', 'Erro')).toBe('Erro');
        expect(errorMessage(new Error(''), 'Erro')).toBe('Erro');
    });
});

describe('asRequestError', () => {
    it('devolve objeto vazio para o que não é objeto', () => {
        expect(asRequestError(null)).toEqual({});
        expect(asRequestError(42)).toEqual({});
    });
});
