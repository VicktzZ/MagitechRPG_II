import { zodResolver } from '@hookform/resolvers/zod';
import { ZodError, type ZodIssue, type ZodTypeAny } from 'zod';
import type { FieldValues, Resolver } from 'react-hook-form';
import { isSameValue } from '@utils/charsheetDiff';
import { buildCharsheetSchema, type CharsheetSchemaMode } from './charsheetSchema';

export interface CharsheetResolverOptions {
    mode: CharsheetSchemaMode;
    /** Ficha como foi carregada; só a edição usa. Lido a cada validação (muda depois de salvar). */
    getBaseline?: () => unknown;
}

const valueAt = (root: unknown, path: ReadonlyArray<string | number>): unknown => {
    let current = root;
    for (const segment of path) {
        if (current === null || current === undefined || typeof current !== 'object') return undefined;
        current = (current as Record<string | number, unknown>)[segment];
    }
    return current;
};

/**
 * Erro que já estava na ficha quando ela foi carregada e o jogador não tocou: o campo vale o mesmo que o salvo.
 * Não pode impedir salvar outra coisa (as anotações, o dinheiro...) — o jogador nem sempre vê esse campo para corrigir.
 */
function isInheritedIssue(issue: ZodIssue, values: unknown, baseline: unknown): boolean {
    if (issue.path.length === 0) return false;
    return isSameValue(valueAt(values, issue.path), valueAt(baseline, issue.path));
}

/**
 * Resolver do formulário da ficha.
 *
 * - Criação: valida com o schema rígido e entrega o valor já tratado pelo Zod.
 * - Edição: ignora erros herdados do banco e entrega os valores CRUS do formulário. O envio calcula o que mudou
 *   (`collectChanges`) a partir deles; o valor "limpo" do Zod descartava chaves que ele não conhece e, ao ser gravado
 *   por cima da ficha, apagava dados (vantagens da campanha, por exemplo).
 */
export function createCharsheetResolver<T extends FieldValues>({ mode, getBaseline }: CharsheetResolverOptions): Resolver<T> {
    const schema = buildCharsheetSchema({ mode, getBaseline });

    if (mode === 'create') return zodResolver(schema) as unknown as Resolver<T>;

    const editSchema = {
        parseAsync: async (values: unknown) => {
            const result = schema.safeParse(values);
            if (result.success) return values;

            const baseline = getBaseline?.();
            const issues = result.error.issues.filter(issue => !isInheritedIssue(issue, values, baseline));
            if (issues.length === 0) return values;
            throw new ZodError(issues);
        }
    } as unknown as ZodTypeAny;

    return zodResolver(editSchema, undefined, { raw: true }) as unknown as Resolver<T>;
}
