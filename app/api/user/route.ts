import { userCollection, userDoc } from '@models/db/user';
import type { User as UserType } from '@types';
import { getDocs, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    try {
        const snap = await getDocs(userCollection);
        const users = snap.docs.map(d => d.data());

        return Response.json({ users, message: 'SUCCESS' }, { status: 200 });
    } catch (error: any) {
        return Response.json({ message: 'FORBIDDEN', error: error?.message }, { status: 403 });
    }
}

export async function POST(req: Request) {
    try {
        const body: UserType = await req.json();
        const id = uuidv4();
        await setDoc(userDoc(id), { ...body, _id: id });

        return Response.json({ user: { ...body, _id: id }, message: 'SUCCESS' }, { status: 201 });
    } catch (error: any) {
        return Response.json({ message: 'FORBIDDEN', error: error?.message }, { status: 403 });
    }
}