// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // ✅ Fix: Import Firestore

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBN7QbguIUFeiWa8XiAfSlbko2vwlAcDhA",
  authDomain: "voting-a4197.firebaseapp.com",
  projectId: "voting-a4197",
  storageBucket: "voting-a4197.firebasestorage.app",
  messagingSenderId: "39671915963",
  appId: "1:39671915963:web:531c32b675f6561bba109e",
  measurementId: "G-Q7JTSKDFPR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Fix: Get Firestore instance (NOT analytics)
const db = getFirestore(app);

export { db };
