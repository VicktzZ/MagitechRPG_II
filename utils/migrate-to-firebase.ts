import axios from 'axios';
import { app } from './firebasedb';
import { getFirestore, writeBatch } from 'firebase/firestore';

const { data } = await axios.get('http://localhost:3000/api/get-db');

const db = getFirestore(app);

for (const key in data) {
    const batch = writeBatch(db);
    
    data[key].forEach((item: any) => {
        batch.set(db.collection(key).doc(item._id), item);
    });
    
    await batch.commit();
}

console.log(data);