import { getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { powerDoc } from '@models/db/power';
import type { MagicPower } from '@types';

interface id { id: string }

export async function GET(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        const snap = await getDoc(powerDoc(id));
        if (!snap.exists()) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }
        return Response.json(snap.data());
    } catch (error: any) {
        return Response.json({ message: 'FORBIDDEN', error: error.message }, { status: 403 });
    }
}

export async function DELETE(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        await deleteDoc(powerDoc(id));
        return Response.json({ message: 'SUCCESS' });
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}

export async function PATCH(req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        const body: MagicPower = await req.json();
        await updateDoc(powerDoc(id), { ...body });
        return Response.json({ message: 'SUCCESS' });
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 });
    }
}