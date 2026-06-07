import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDDeVbBWl2Qo0yh8e_ihFzBc3MMRbYjl1w",
  authDomain: "le-pool-1d505.firebaseapp.com",
  projectId: "le-pool-1d505",
  storageBucket: "le-pool-1d505.firebasestorage.app",
  messagingSenderId: "309664002279",
  appId: "1:309664002279:web:20de4f06770d05c533b242",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
