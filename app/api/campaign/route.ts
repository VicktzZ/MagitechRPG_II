import { campaignRepository } from '@repositories';
import { findCampaignByCodeOrId } from '@utils/helpers/findCampaignByCodeOrId';
import { CampaignDTO } from '@models/dtos';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import type { NextRequest } from 'next/server';
import { Campaign } from '@models/entities';
import {
    assertId,
    assertMaxLength,
    campaignForRole,
    forbidden,
    getCampaignRole,
    handleRouteError,
    readJsonBody,
    requireUser,
    TEXT_LIMITS,
    toCampaignPreview
} from '@utils/api';

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest): Promise<Response> {
    try {
        const user = await requireUser();
        const campaignCode = req.nextUrl.searchParams.get('code');
        const userId = req.nextUrl.searchParams.get('userId');

        if (campaignCode) {
            assertId(campaignCode, 'code');
            const campaign = await findCampaignByCodeOrId(campaignCode);
            if (!campaign) {
                return Response.json({ message: 'NOT FOUND' }, { status: 404 });
            }
            // Membros recebem a campanha inteira (os jogadores sem os segredos do mestre); quem só tem o código, uma prévia
            const role = getCampaignRole(campaign, user);
            return Response.json(role.isMember ? campaignForRole(campaign, role) : toCampaignPreview(campaign));
        }

        if (userId) {
            assertId(userId, 'userId');
            if (userId !== user.id && !user.isAdmin) {
                throw forbidden('Você só pode listar as suas próprias campanhas');
            }

            const asGmQuery = campaignRepository
                .whereArrayContains('admin', userId)
                .find();

            const allCampaignsQuery = campaignRepository.find();

            const [ gmCampaigns, allCampaigns ] = await Promise.all([ asGmQuery, allCampaignsQuery ]);

            const asGm = gmCampaigns.map(c => ({ id: c.id, code: c.campaignCode }));

            const asPlayer = allCampaigns
                .filter(c => Array.isArray(c.players) && c.players.some(p => p.userId === userId))
                .map(c => ({ id: c.id, code: c.campaignCode }));

            return Response.json({ asGm, asPlayer });
        }

        if (!user.isAdmin) {
            throw forbidden('Apenas administradores podem listar todas as campanhas');
        }
        const allCampaigns = await campaignRepository.find();
        // O administrador do site vê todas as campanhas, mas os segredos do mestre são só do mestre de cada uma
        return Response.json(allCampaigns.map(each => campaignForRole(each, getCampaignRole(each, user))));

    } catch (error) {
        return handleRouteError(error, 'Erro ao buscar campanhas');
    }
}

export async function POST(req: Request): Promise<Response> {
    try {
        const user = await requireUser();
        const body: Campaign = await readJsonBody(req);
        assertMaxLength(body.title, TEXT_LIMITS.title, 'title');
        assertMaxLength(body.description, TEXT_LIMITS.description, 'description');

        // Quem cria é o mestre; ninguém entra como jogador na criação.
        // O id é descartado: com id definido o FireORM sobrescreveria outra campanha.
        const { id: _ignoredId, ...campaignData } = body;

        // O código é o "convite" da campanha: precisa ser único, senão uma campanha
        // nova com o mesmo código poderia capturar quem tenta entrar na original
        if (campaignData.campaignCode !== undefined) {
            if (!/^[A-Z0-9]{8}$/.test(String(campaignData.campaignCode))) {
                return Response.json({ message: 'BAD REQUEST', error: 'Código de campanha inválido' }, { status: 400 });
            }
            const existing = await campaignRepository.whereEqualTo('campaignCode', campaignData.campaignCode).findOne();
            if (existing) {
                return Response.json({ message: 'CONFLICT', error: 'Código de campanha já em uso, tente novamente' }, { status: 409 });
            }
        }

        const dto = plainToInstance(CampaignDTO, { ...campaignData, admin: [ user.id ], players: [] });
        const errors = await validate(dto);

        if (errors.length > 0) {
            return Response.json({ message: 'BAD REQUEST', errors }, { status: 400 });
        }

        const newCampaign = new Campaign(dto);
        const createdCampaign = await campaignRepository.create(newCampaign);

        return Response.json(createdCampaign, { status: 201 });
    } catch (error) {
        return handleRouteError(error, 'Erro ao criar campanha');
    }
}
