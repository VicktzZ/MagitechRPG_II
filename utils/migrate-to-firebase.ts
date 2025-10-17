import axios from 'axios';
import { app } from './database';
import { getFirestore, writeBatch, doc } from 'firebase/firestore';

const { data } = await axios.get('http://localhost:3000/api/get-db');

const db = getFirestore(app);

for (const key of Object.keys(data)) {
    const batch = writeBatch(db);

    for (const item of data[key]) {
        const ref = doc(db, key, String(item._id));
        batch.set(ref, item);
    }

    await batch.commit();
}

console.log('Migração concluída para coleções:', Object.keys(data));