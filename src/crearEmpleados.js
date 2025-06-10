// Script para crear empleados/usuarios con roles en Firestore
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
// Configuración de Firebase directamente en el script
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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Lista de empleados/usuarios a crear
const empleados = [
  {
    email: "mariajose09@gmail.com",
    rol: "Caja"
  },
  {
    email: "juanperez@gmail.com",
    rol: "Atención al cliente"
  },
  {
    email: "kenny@gmail.com",
    rol: "Administrador"
  }
];

async function crearEmpleados() {
  for (const empleado of empleados) {
    const ref = doc(collection(db, "empleados"), empleado.email);
    await setDoc(ref, empleado);
    console.log(`Empleado creado: ${empleado.email} (${empleado.rol})`);
  }
  console.log("Todos los empleados han sido creados.");
}

crearEmpleados().catch(console.error);
