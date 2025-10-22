/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { spellCollection, spellDoc } from '@models/db/spell';
import { type Magia as MagiaType } from '@types';
import { getDocs, limit as limitDocs, orderBy, query, setDoc, where } from 'firebase/firestore';
import type { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest): Promise<Response> {
    try {
        const search = req.nextUrl.searchParams.get('search');
        const order = req.nextUrl.searchParams.get('order')?.toLowerCase() || 'asc';
        const filter = req.nextUrl.searchParams.get('filter');
        const sort = req.nextUrl.searchParams.get('sort')?.toLowerCase() || 'nome';
        const limit = Number(req.nextUrl.searchParams.get('limit')) || 10;
        
        let q = spellCollection;
        
        if (search) {
            q = query(q, where('nome', '>=', search), where('nome', '<=', search));
        }
        
        if (filter && filter !== 'Nenhum') {
            q = query(q, where('elemento', '==', filter));
        }
        
        const orderByField = filter === 'elemento' ? 'nome' : sort;
        q = query(q, orderBy(orderByField, order));
        
        // Para implementar paginação real, precisa-se de cursor (startAfter)
        // Por simplicidade, limitar e retornar página 1 apenas por agora
        q = query(q, limitDocs(limit));
        
        const snap = await getDocs(q);
        const magias = snap.docs.map(d => d.data());
        
        return Response.json(magias);
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 });
    }
}

export async function POST(req: Request): Promise<Response> {
    try {
        const body: MagiaType = await req.json();
        const id = body._id ?? uuidv4();
        await setDoc(spellDoc(id), { ...body, _id: id });
        return Response.json({ ...body, _id: id });
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}