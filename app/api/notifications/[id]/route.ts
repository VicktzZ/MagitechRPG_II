import { notificationCollection, notificationDoc } from '@models/db/notification';
import { getDocs, limit as limitDocs, query, updateDoc, where } from 'firebase/firestore';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { read } = await req.json();
        await updateDoc(notificationDoc(id), { read });
        return Response.json({ message: 'SUCCESS' });
    } catch (error) {
        console.error('Erro ao atualizar notificação:', error);
        return Response.json({ message: 'Erro ao atualizar notificação' }, { status: 500 });
    }
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const q = query(notificationCollection, where('userId', '==', id), limitDocs(50));
        const snap = await getDocs(q);
        const notifications = snap.docs.map(d => d.data()).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        return Response.json(notifications);
    } catch (error) {
        console.error('Erro ao buscar notificações:', error);
        return Response.json({ message: 'Erro ao buscar notificações' }, { status: 500 });
    }
}
