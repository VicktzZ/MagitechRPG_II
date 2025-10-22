/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { fichaDoc } from '@models/db/ficha';
import { powerCollection } from '@models/db/power';
import { spellCollection } from '@models/db/spell';
import { type Ficha as FichaType } from '@types';
import { deleteDoc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';

interface id { id: string }

export async function GET(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        const docRef = fichaDoc(id);
        const snap = await getDoc(docRef);
        if (!snap.exists()) {
            return Response.json({ message: 'NOT FOUND' }, { status: 404 });
        }
        
        const ficha = snap.data() ;

        // Buscar magics relacionadas
        if (ficha.magics.length > 0) {
            const magicIds = ficha.magics.map(m => m._id || m);
            const magicQuery = query(spellCollection, where('_id', 'in', magicIds));
            const magicSnap = await getDocs(magicQuery);
            ficha.magics = magicSnap.docs.map(d => d.data());
        }

        // Buscar powers relacionadas em skills.powers
        if (ficha.skills.powers.length > 0) {
            const powerIds = ficha.skills.powers.map(p => p._id || p);
            const powerQuery = query(powerCollection, where('_id', 'in', powerIds));
            const powerSnap = await getDocs(powerQuery);
            ficha.skills.powers = powerSnap.docs.map(d => ({
                _id: d.data()._id,
                name: d.data().nome,
                description: d.data()['descrição'],
                element: d.data().elemento,
                mastery: d.data().maestria,
                type: 'Poder Mágico' as const
            }));
        }

        return Response.json(ficha);
    } catch (error: any) {
        return Response.json({ message: 'FORBIDDEN', error: error.message }, { status: 403 });
    }
}

export async function DELETE(_req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        await deleteDoc(fichaDoc(id));
        return Response.json({ message: 'SUCCESS' });
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}

export async function PATCH(req: Request, { params: { id } }: { params: id }): Promise<Response> {
    try {
        const body: FichaType = await req.json();
        await updateDoc(fichaDoc(id), { ...body });
        return Response.json({ message: 'SUCCESS' });
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 });
    }
}