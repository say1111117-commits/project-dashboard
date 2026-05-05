// Import ng Firebase core function para ma-initialize ang app
import { initializeApp } from "firebase/app";

// Import ng authentication service ng Firebase
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // import ang Firestore

// Configuration ng Firebase project mo
// Galing ito sa Firebase Console (Project Settings)
const firebaseConfig = {
  apiKey: "AIzaSyB8FtSo_QsuP_HWWmoRei8vDGhB_S7mc7w", // unique key para ma-access ang project
  authDomain: "my-login-app-a2f2d.firebaseapp.com", // domain para sa authentication (login, signup)
  projectId: "my-login-app-a2f2d", // ID ng project mo sa Firebase
  storageBucket: "my-login-app-a2f2d.firebasestorage.app", // storage para sa files (images, etc.)
  messagingSenderId: "399822972540", // ginagamit sa push notifications (Firebase Cloud Messaging)
  appId: "1:399822972540:web:09fe08d1c1e101a4530bf9" // unique identifier ng app mo
};

// Dito ini-initialize ang Firebase app gamit ang config
const app = initializeApp(firebaseConfig);

// Kinukuha ang authentication service mula sa Firebase app
// Ito yung gagamitin para mag login, register, logout, etc.
export const auth = getAuth(app);
export const db = getFirestore(app);