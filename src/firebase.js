import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configurația nu este secretă — accesul la date este controlat de regulile
// de securitate Firestore (vezi firestore.rules).
// NOTĂ: projectId/authDomain/storageBucket sunt identificatori ai proiectului
// Firebase de pe server (rămâne „diamond-kids"), NU numele afișat al aplicației.
// Numele afișat copiilor („SODO Kids") e separat și nu trebuie schimbat aici.
const firebaseConfig = {
  apiKey: "AIzaSyAEYxzxOng-lg9zAECyjhK5Wvk14I7Pjv4",
  authDomain: "diamond-kids.firebaseapp.com",
  projectId: "diamond-kids",
  storageBucket: "diamond-kids.firebasestorage.app",
  messagingSenderId: "183329169385",
  appId: "1:183329169385:web:628dcbf965314d897ab578",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
