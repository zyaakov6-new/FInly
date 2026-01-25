import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration
// TODO: Replace with your Firebase project config
const firebaseConfig = {
    apiKey: "AIzaSyDbnXAQzJIK-a0zs16XwXHXQMS7U70NlUc",
    authDomain: "finly-b3a24.firebaseapp.com",
    projectId: "finly-b3a24",
    storageBucket: "finly-b3a24.firebasestorage.app",
    messagingSenderId: "545494325443",
    appId: "1:545494325443:web:a10795c2175590447f6a76",
    measurementId: "G-3LPD3SJL9R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export { getStorage } from 'firebase/storage';

export default app;
