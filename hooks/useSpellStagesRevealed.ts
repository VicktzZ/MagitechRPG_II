import { charsheetService } from '@services';
import { useQuery } from '@tanstack/react-query';

/**
 * A ficha vê os estágios de todas as magias revelados porque o mestre da campanha onde ela joga ligou a opção (`utils/spellReveal.ts`)?
 * Só consulta com a ficha salva e a regra de estágios valendo; falha ou carregando = não revelado (a regra normal vale).
 * Refaz a consulta ao voltar para a aba, então a opção do mestre chega sem recarregar a página.
 */
export function useSpellStagesRevealed(charsheetId: string | undefined, enabled: boolean): boolean {
    const { data } = useQuery({
        queryKey: [ 'spell-stages-revealed', charsheetId ],
        queryFn: async () => (await charsheetService.getSpellStagesRevealed(charsheetId!)).revealed === true,
        enabled: Boolean(charsheetId) && enabled,
        staleTime: 30_000,
        retry: false
    });
    return data === true;
}
