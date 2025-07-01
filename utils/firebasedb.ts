import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: 'AIzaSyClcnmb9jAB1JnRC-rhFvOb_7LmoeUwIAw',
    authDomain: 'magius-rpg.firebaseapp.com',
    projectId: 'magius-rpg',
    storageBucket: 'magius-rpg.firebasestorage.app',
    messagingSenderId: '630856333669',
    appId: '1:630856333669:web:1a2de9d7df9846b380c98c',
    measurementId: 'G-82SNKT930M'
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);