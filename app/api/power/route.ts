/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { getDocs, query, where, orderBy, setDoc } from 'firebase/firestore';
import { powerCollection, powerDoc } from '@models/db/power';
import { type MagicPower } from '@types';
import type { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest): Promise<Response> {
    try {
        const search = req.nextUrl.searchParams.get('search');
        const order = req.nextUrl.searchParams.get('order')?.toLowerCase() || 'asc';
        const filter = req.nextUrl.searchParams.get('filter');
        const sort = req.nextUrl.searchParams.get('sort')?.toLowerCase() || 'nome';
        // const limit = Number(req.nextUrl.searchParams.get('limit')) || 20;
        
        let q = powerCollection;
        
        // Filtros básicos (Firestore não tem $search fuzzy; usar where com regex limitado)
        if (search) {
            q = query(q, where('nome', '>=', search), where('nome', '<=', search));
        }
        
        if (filter && filter !== 'Nenhum') {
            q = query(q, where('elemento', '==', filter));
        }
        
        // Ordenação (limitada a campos únicos)
        const orderByField = filter ? 'nome' : sort;
        q = query(q, orderBy(orderByField, order));
        
        // Paginação simples
        // q = query(q, limitDocs(limit));
        
        const snap = await getDocs(q);
        const poderes = snap.docs.map(d => d.data());
        
        return Response.json(poderes);
    } catch (error: any) {
        return Response.json({ message: 'NOT FOUND', error: error.message }, { status: 404 });
    }
}

export async function POST(req: Request): Promise<Response> {
    try {
        const body: MagicPower = await req.json();
        const id = body._id ?? uuidv4();
        await setDoc(powerDoc(id), { ...body, _id: id });
        return Response.json({ ...body, _id: id });
    } catch (error: any) {
        return Response.json({ message: 'BAD REQUEST', error: error.message }, { status: 400 });
    }
}