import { timingSafeEqual } from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@app/api/auth/[...nextauth]/route';
import { campaignRepository, charsheetRepository } from '@repositories';
import type { Campaign, Charsheet } from '@models/entities';
import { findCampaignByCodeOrId } from '@utils/helpers/findCampaignByCodeOrId';
import { campaignWithoutCreatureDefenses } from '@utils/combat/creatureSecrets';
import { isAdminEmail } from '@utils/adminCheck';
import { forbidden, notFound, unauthorized } from './errors';
import { assertId } from './input';

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    image?: string;
    isAdmin: boolean;
}

/**
 * Usuário autenticado da requisição. O `id` vem do callback de sessão do
 * NextAuth, que busca o usuário no banco pelo e-mail do JWT — nunca do body,
 * query string ou localStorage do cliente.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
    const session = await getServerSession(authOptions);
    const user = session?.user;
    if (!user?.id || !user.email) return null;

    return {
        id: String(user.id),
        email: String(user.email),
        name: String(user.name ?? ''),
        image: user.image ? String(user.image) : undefined,
        isAdmin: isAdminEmail(user.email)
    };
}

export async function requireUser(): Promise<AuthUser> {
    const user = await getAuthUser();
    if (!user) throw unauthorized();
    return user;
}

export async function requireAdmin(): Promise<AuthUser> {
    const user = await requireUser();
    if (!user.isAdmin) throw forbidden('Apenas administradores podem fazer isso');
    return user;
}

// ─────────────────────────────────────────────
// API key interna (servidor → servidor)
// ─────────────────────────────────────────────

/**
 * Valida o header `x-api-key` contra INTERNAL_API_KEY (comparação em tempo
 * constante). Serve para automações (cron, scripts) chamarem rotas de admin
 * sem sessão de navegador. Sem a variável configurada, nenhuma chave é aceita.
 *
 * Importante: esta chave é secreta e só existe no servidor. Uma chave em
 * variável NEXT_PUBLIC_* vai para o bundle do navegador e não protege nada.
 */
export function hasValidApiKey(req: Request): boolean {
    const expected = process.env.INTERNAL_API_KEY;
    const provided = req.headers.get('x-api-key');
    if (!expected || expected.length < 32 || !provided) return false;

    const encoder = new TextEncoder();
    const a = encoder.encode(provided);
    const b = encoder.encode(expected);
    return a.length === b.length && timingSafeEqual(a, b);
}

/** Admin logado ou automação com API key interna válida */
export async function requireAdminOrApiKey(req: Request): Promise<AuthUser | null> {
    if (hasValidApiKey(req)) return null;
    return await requireAdmin();
}

// ─────────────────────────────────────────────
// Campanhas
// ─────────────────────────────────────────────

export interface CampaignRole {
    isGM: boolean;
    isPlayer: boolean;
    isMember: boolean;
}

export function getCampaignRole(campaign: Campaign, user: AuthUser): CampaignRole {
    // Mestre é só quem está em campaign.admin — admins do site não ganham papel de
    // mestre automaticamente (podem jogar como jogadores em campanhas de outros)
    const isGM = Boolean(campaign.admin?.includes(user.id));
    const isPlayer = Boolean(campaign.players?.some(p => p.userId === user.id));
    return { isGM, isPlayer, isMember: isGM || isPlayer };
}

/**
 * A campanha como o usuário pode vê-la: o mestre recebe tudo; os demais, sem os segredos do mestre que ainda moram dentro do documento
 * (defesas das criaturas gravadas antes de irem para `campaigns/{id}/gmData`). Toda rota que devolve a campanha inteira passa por aqui.
 */
export function campaignForRole(campaign: Campaign, role: Pick<CampaignRole, 'isGM'>): Campaign {
    return role.isGM ? campaign : campaignWithoutCreatureDefenses(campaign);
}

export async function findCampaignOrThrow(idOrCode: string): Promise<Campaign> {
    assertId(idOrCode, 'campaign');
    const campaign = await findCampaignByCodeOrId(idOrCode);
    if (!campaign) throw notFound('Campanha não encontrada');
    return campaign;
}

/** Busca a campanha e exige que o usuário seja mestre ou jogador dela */
export async function requireCampaignMember(idOrCode: string, user: AuthUser): Promise<{ campaign: Campaign } & CampaignRole> {
    const campaign = await findCampaignOrThrow(idOrCode);
    const role = getCampaignRole(campaign, user);
    if (!role.isMember) throw forbidden('Você não participa desta campanha');
    return { campaign, ...role };
}

/** Busca a campanha e exige que o usuário seja membro dela, ou automação com API key interna (lê como o mestre) */
export async function requireCampaignMemberOrApiKey(idOrCode: string, req: Request): Promise<{ campaign: Campaign } & CampaignRole> {
    const campaign = await findCampaignOrThrow(idOrCode);
    if (hasValidApiKey(req)) return { campaign, isGM: true, isPlayer: false, isMember: true };

    const user = await requireUser();
    const role = getCampaignRole(campaign, user);
    if (!role.isMember) throw forbidden('Você não participa desta campanha');
    return { campaign, ...role };
}

/** Busca a campanha e exige que o usuário seja o mestre */
export async function requireCampaignGM(idOrCode: string, user: AuthUser): Promise<{ campaign: Campaign } & CampaignRole> {
    const campaign = await findCampaignOrThrow(idOrCode);
    const role = getCampaignRole(campaign, user);
    if (!role.isGM) throw forbidden('Apenas o mestre da campanha pode fazer isso');
    return { campaign, ...role };
}

/**
 * Mestre da campanha logado, ou automação com API key interna válida (age como mestre, sem checar dono —
 * a chave já é secreta o bastante). `userId` é quem assinou a mudança (auditoria em `saveCreatureDefenses`
 * etc.); automações usam `'api-key'` por não terem usuário.
 */
export async function requireCampaignGMOrApiKey(idOrCode: string, req: Request): Promise<{ campaign: Campaign; userId: string } & CampaignRole> {
    const campaign = await findCampaignOrThrow(idOrCode);
    if (hasValidApiKey(req)) return { campaign, userId: 'api-key', isGM: true, isPlayer: false, isMember: true };

    const user = await requireUser();
    const role = getCampaignRole(campaign, user);
    if (!role.isGM) throw forbidden('Apenas o mestre da campanha pode fazer isso');
    return { campaign, userId: user.id, ...role };
}

/**
 * O que um não-membro pode ver de uma campanha (ex.: ao digitar o código para
 * entrar): o suficiente para confirmar que ela existe — sem mensagens, notas,
 * fichas, combate ou loja.
 */
export function toCampaignPreview(campaign: Campaign) {
    return {
        id: campaign.id,
        campaignCode: campaign.campaignCode,
        title: campaign.title,
        description: campaign.description,
        mode: campaign.mode,
        status: campaign.status ?? 'active'
    };
}

export function campaignHasCharsheet(campaign: Campaign, charsheetId: string): boolean {
    return Boolean(campaign.players?.some(p => p.charsheetId === charsheetId));
}

/** Garante que todas as fichas informadas pertencem a jogadores da campanha */
export function assertCharsheetsInCampaign(campaign: Campaign, charsheetIds: string[]): void {
    const outsider = charsheetIds.find(id => !campaignHasCharsheet(campaign, id));
    if (outsider) throw forbidden('Uma das fichas informadas não faz parte desta campanha');
}

// ─────────────────────────────────────────────
// Fichas
// ─────────────────────────────────────────────

export interface CharsheetAccess {
    isOwner: boolean;
    /** Usuário é mestre de uma campanha onde a ficha joga */
    isGM: boolean;
    /** Usuário participa (como jogador) de uma campanha onde a ficha joga */
    isCampaignMate: boolean;
}

export async function getCharsheetAccess(charsheet: Charsheet, user: AuthUser): Promise<CharsheetAccess> {
    const isOwner = charsheet.userId === user.id;
    if (isOwner || user.isAdmin) {
        return { isOwner, isGM: user.isAdmin, isCampaignMate: false };
    }

    // Campanhas onde o usuário é mestre e a ficha está entre os jogadores
    const gmCampaigns = await campaignRepository.whereArrayContains('admin', user.id).find();
    if (gmCampaigns.some(c => campaignHasCharsheet(c, charsheet.id))) {
        return { isOwner, isGM: true, isCampaignMate: false };
    }

    // Campanhas que a ficha já entrou (registradas em charsheet.session) onde o usuário também joga
    const codes = [ ...new Set((charsheet.session ?? []).map(s => s.campaignCode).filter(Boolean)) ].slice(0, 20);
    for (const code of codes) {
        const campaign = await campaignRepository.whereEqualTo('campaignCode', code).findOne();
        if (campaign && campaignHasCharsheet(campaign, charsheet.id) && campaign.players?.some(p => p.userId === user.id)) {
            return { isOwner, isGM: false, isCampaignMate: true };
        }
    }

    return { isOwner, isGM: false, isCampaignMate: false };
}

export type CharsheetAccessLevel =
    | 'read'   // dono, mestre ou colega de campanha
    | 'write'  // dono ou mestre
    | 'owner'; // só o dono

export async function requireCharsheetAccess(
    charsheetId: string,
    user: AuthUser,
    level: CharsheetAccessLevel
): Promise<{ charsheet: Charsheet } & CharsheetAccess> {
    assertId(charsheetId, 'charsheet');
    const charsheet = await charsheetRepository.findById(charsheetId);
    if (!charsheet) throw notFound('Ficha não encontrada');

    const access = await getCharsheetAccess(charsheet, user);
    const allowed =
        user.isAdmin ||
        access.isOwner ||
        (level !== 'owner' && access.isGM) ||
        (level === 'read' && access.isCampaignMate);

    if (!allowed) throw forbidden('Você não tem acesso a esta ficha');
    return { charsheet, ...access };
}
