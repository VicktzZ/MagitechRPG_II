/**
 * Estado de carregamento de uma campanha aberta pelo código (/app/campaign/[code]).
 *
 * Antes só existia "tem dados / não tem dados": código inexistente, campanha
 * excluída e falha de rede terminavam igual ao carregamento, num spinner sem fim.
 */
export type CampaignLoadStatus = 'loading' | 'ready' | 'not-found' | 'error';

/** Falha da busca do código na API; `status` é o HTTP devolvido (0 = sem resposta) */
export class CampaignLookupError extends Error {
    readonly status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = 'CampaignLookupError';
        this.status = status;
    }
}

export interface CampaignLoadInput {
    lookup: {
        /** Ainda buscando o ID da campanha pelo código */
        pending: boolean;
        error: unknown;
    };
    realtime: {
        /** O listener da campanha já entregou o primeiro resultado (ou falhou) */
        settled: boolean;
        error: unknown;
        /** O documento da campanha existe */
        found: boolean;
    };
}

export function resolveCampaignLoadStatus({ lookup, realtime }: CampaignLoadInput): CampaignLoadStatus {
    if (lookup.pending) return 'loading';

    if (lookup.error) {
        return lookup.error instanceof CampaignLookupError && lookup.error.status === 404 ? 'not-found' : 'error';
    }

    // Campanha já carregada continua válida mesmo que o listener falhe depois
    if (realtime.found) return 'ready';
    if (realtime.error) return 'error';
    if (!realtime.settled) return 'loading';

    // O listener respondeu e o documento não existe (campanha excluída)
    return 'not-found';
}
