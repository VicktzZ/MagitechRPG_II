/* eslint-disable @typescript-eslint/promise-function-async */
import { fichaDoc } from '@models/db/ficha';
import { userCollection } from '@models/db/user';
import { getDoc, getDocs, query, where } from 'firebase/firestore';

import { getCampaign } from '@utils/server/getCampaign';
import type { NextRequest } from 'next/server';

interface CampaignGetAllDataParams {
    id: string;
}

export async function GET(
    req: NextRequest,
    { params }: { params: CampaignGetAllDataParams }
): Promise<Response> {
    try {
        const { id } = params;
        const userId = req.nextUrl.searchParams.get('userId');

        // Buscar campanha por id ou campaignCode se for 8 chars
        const campaignSnap = await getCampaign(id);
        if (!campaignSnap.exists()) {
            return Response.json({ message: 'Campanha não encontrada' }, { status: 404 });
        }
        const campaign = campaignSnap.data();

        // Buscar fichas dos jogadores de forma mais eficiente
        const fichaIds = campaign.players.map(p => p.fichaId);

        const fichasPromises = fichaIds.map(fichaId => getDoc(fichaDoc(fichaId)));
        const fichasSnaps = await Promise.all(fichasPromises);
        const fichas = fichasSnaps
            .filter(snap => snap.exists())
            .map(snap => snap.data())
            .filter(ficha => ficha !== undefined);

        // Buscar usuários (players e admin) de forma mais eficiente
        const userIds = [ ...campaign.players.map(p => p.userId), ...campaign.admin ];

        // Para evitar limitações do Firestore 'in' query (máximo 10), dividir em batches se necessário
        const userBatches = [];
        for (let i = 0; i < userIds.length; i += 10) {
            userBatches.push(userIds.slice(i, i + 10));
        }

        const userPromises = userBatches.map(batch =>
            getDocs(query(userCollection, where('_id', 'in', batch)))
        );

        const userSnaps = await Promise.all(userPromises);
        const allUsers = userSnaps
            .flatMap(snap => snap.docs)
            .map(doc => doc.data());

        // Separar players e admin
        const players = allUsers.filter(u => campaign.players.some(p => p.userId === u._id));
        const admin = allUsers.filter(u => campaign.admin.includes(u._id));

        // Verificar se o usuário atual é GM
        const isUserGM = userId ? campaign.admin.includes(userId) : false;

        const result = {
            campaign,
            fichas,
            users: {
                players,
                admin,
                all: allUsers
            },
            isUserGM,
            metadata: {
                totalFichas: fichas.length,
                totalUsers: allUsers.length,
                totalPlayers: players.length
            }
        };

        return Response.json(result, { status: 200 });

    } catch (error: any) {
        return Response.json({
            message: 'Erro interno do servidor',
            error: error.message
        }, { status: 500 });
    }
}