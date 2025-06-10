// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Configuración de Firebase usando variables de entorno
const firebaseConfig = {
  apiKey: "AIzaSyDN3Fr-oeYMnvbkOLteNyB-mUDSYtMlU50",
  authDomain: "smartdistro-9b240.firebaseapp.com",
  projectId: "smartdistro-9b240",
  storageBucket: "smartdistro-9b240.firebasestorage.app",
  messagingSenderId: "136850907058",
  appId: "1:136850907058:web:b3eeda2fdcc958186cceab",
  measurementId: "G-1WG14NF1W9"
};

// Inicializa Firebase
const appfirebase = initializeApp(firebaseConfig);

const storage = getStorage(appfirebase);

// Inicializa Firestore
const db = getFirestore(appfirebase);

// Inicializa Authentication
const auth = getAuth(appfirebase);

export { appfirebase, db, auth, storage, firebaseConfig }; 