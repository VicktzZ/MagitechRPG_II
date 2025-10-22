import { getDocs, query, where, setDoc } from 'firebase/firestore';
import { notificationCollection, notificationDoc } from '@models/db/notification';
import type { Notification } from '@types';
import { v4 as uuidv4 } from 'uuid';

interface Params {
    userId: string
}

export async function GET(_: Request, { params }: { params: Params }): Promise<Response> {
    try {
        const q = query(notificationCollection, where('userId', '==', params.userId));
        const snap = await getDocs(q);
        const notifications = snap.docs.map(d => d.data()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        return Response.json(notifications);
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 });
    }
}

export async function POST(req: Request, { params }: { params: Params }): Promise<Response> {
    try {
        const body: Notification = await req.json();
        const id = body._id ?? uuidv4();
        await setDoc(notificationDoc(id), { ...body, _id: id, userId: params.userId });
        return Response.json({ ...body, _id: id, userId: params.userId });
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 });
    }
}