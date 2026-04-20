/* eslint-disable @typescript-eslint/promise-function-async */
import { campaignRepository, userRepository } from '@repositories';
import { chunk } from '@utils/helpers/chunk';
import { findCampaignByCodeOrId } from '@utils/helpers/findCampaignByCodeOrId';
import type { NextRequest } from 'next/server';

interface id { id: string }

export async function GET(_req: NextRequest, { params }: { params: id }): Promise<Response> {
    try {
        const { id } = params;

        const campaign = await findCampaignByCodeOrId(id);
        if (!campaign) {
            return Response.json({ message: 'CAMPAIGN NOT FOUND' }, { status: 404 });
        }

        const userIds = [ ...campaign.players.map(p => p.userId), ...campaign.admin ];
        
        if (userIds.length === 0) {
            return Response.json([]);
        }

        const idChunks = chunk(userIds, 10);
        
        const queries = idChunks.map(ids => 
            userRepository.whereIn('id', ids).find()
        );
        
        const results = await Promise.all(queries);
        const users = results.flat();

        return Response.json(users);
    } catch (error: any) {
        return Response.json({ message: 'FORBIDDEN', error: error.message }, { status: 403 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: id }): Promise<Response> {
    try {
        const { id } = params;
        const { userId } = await req.json();

        const campaign = await findCampaignByCodeOrId(id);
        if (!campaign) {
            return Response.json({ message: 'CAMPAIGN NOT FOUND' }, { status: 404 });
        }

        const updatedPlayers = campaign.players.filter(p => p.userId !== userId);
        const updatedSessionUsers = campaign.session.users.filter(u => u !== userId);
        
        await campaignRepository.update({
            ...campaign,
            players: updatedPlayers,
            session: {
                ...campaign.session,
                users: updatedSessionUsers
            }
        });

        return Response.json({ message: 'USER REMOVED FROM CAMPAIGN' });
    } catch (error: any) {
        return Response.json({ message: 'FORBIDDEN', error: error.message }, { status: 403 });
    }
}