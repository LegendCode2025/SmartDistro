import React, { createContext, useContext, useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { appfirebase } from "./firebaseconfig";
import { db } from "./firebaseconfig"; // Asegúrate de importar db
import { collection, query, where, getDocs } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [distribuidoraId, setDistribuidoraId] = useState(null);
  const [userType, setUserType] = useState(null); // "admin" o "empleado"

  useEffect(() => {
    const auth = getAuth(appfirebase);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Buscar el usuario en Firestore para determinar si es admin o empleado
        const adminsQuery = query(
          collection(db, "admins"),
          where("uid", "==", firebaseUser.uid)
        );
        const adminsSnapshot = await getDocs(adminsQuery);

        if (!adminsSnapshot.empty) {
          const adminDoc = adminsSnapshot.docs[0];
          const adminData = adminDoc.data();
          setUser({ ...firebaseUser, id: adminDoc.id });
          setUserType("admin");
          setDistribuidoraId(adminData.distribuidoraId);
          setIsLoggedIn(true);
          return;
        }

        const distribuidorasSnapshot = await getDocs(collection(db, "distribuidoras"));
        for (const distribuidoraDoc of distribuidorasSnapshot.docs) {
          const empleadosQuery = query(
            collection(db, "distribuidoras", distribuidoraDoc.id, "empleados"),
            where("uid", "==", firebaseUser.uid)
          );
          const empleadosSnapshot = await getDocs(empleadosQuery);

          if (!empleadosSnapshot.empty) {
            const empleadoDoc = empleadosSnapshot.docs[0];
            const empleadoData = empleadoDoc.data();
            setUser({ ...firebaseUser, id: empleadoDoc.id });
            setUserType("empleado");
            setDistribuidoraId(distribuidoraDoc.id);
            setIsLoggedIn(true);
            break;
          }
        }
      } else {
        setUser(null);
        setUserType(null);
        setDistribuidoraId(null);
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    const auth = getAuth(appfirebase);
    await signOut(auth);
    setUser(null);
    setUserType(null);
    setDistribuidoraId(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, userType, distribuidoraId, logout }}>
      {children}
    </AuthContext.Provider>
  );
};