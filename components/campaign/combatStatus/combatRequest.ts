/** Chamada à rota de combate (`POST /api/campaign/[id]/combat`) devolvendo o corpo mesmo quando a resposta é de erro, para o chamador tratar `code` e `canForce` */
export const post = async (campaignId: string, body: Record<string, unknown>): Promise<{ ok: boolean; result: Record<string, unknown> }> => {
    const response = await fetch(`/api/campaign/${campaignId}/combat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    return { ok: response.ok, result: await response.json() as Record<string, unknown> };
};

/** O erro com a mensagem do servidor, ou a padrão */
export const failure = (result: Record<string, unknown>, fallback: string): Error => new Error(typeof result['error'] === 'string' && result['error'] ? result['error'] : fallback);
