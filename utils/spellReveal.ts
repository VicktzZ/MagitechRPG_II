/**
 * Opção do mestre "revelar estágios" (`Campaign.revealSpellStages`): os jogadores passam a ver o texto e o custo de MP de todos os
 * estágios de todas as magias, mesmo os que a ficha ainda não liberou. É só visualização: o estágio continua bloqueado para
 * conjurar e evoluir (a regra de `utils/spellStages.ts` não muda). Vale na tela da campanha e na ficha de quem joga nela.
 */

interface RevealCampaign {
    revealSpellStages?: unknown;
    status?: string | null;
    players?: ReadonlyArray<{ charsheetId?: string | null }> | null;
}

/** A campanha liberou a visualização? Campanha finalizada (arquivada) não vale mais */
export function campaignRevealsSpellStages(campaign: Pick<RevealCampaign, 'revealSpellStages' | 'status'> | null | undefined): boolean {
    return campaign?.revealSpellStages === true && campaign.status !== 'finished';
}

/**
 * A ficha vê os estágios revelados? Sim se alguma campanha onde ela ainda joga (está em `players`) liberou a visualização:
 * a ficha guarda as campanhas por onde passou (`session`), então sair da campanha tira a liberação.
 */
export function sheetSeesRevealedStages(campaigns: ReadonlyArray<RevealCampaign | null | undefined>, charsheetId: string): boolean {
    return campaigns.some(campaign => campaignRevealsSpellStages(campaign)
        && Boolean(campaign?.players?.some(player => player.charsheetId === charsheetId)));
}
