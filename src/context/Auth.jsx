import { createContext, useContext, useEffect, useState } from "react"

import { auth, db } from "../service/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { getDoc, doc } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }){

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // habang loading pa si Auth.jsx

  useEffect(() => {
    
    const unSubs = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
  
    if(currentUser){
      const docRef = doc(db, 'users', currentUser.uid);
      const userData = await getDoc(docRef);
      if(userData.exists()){
        setRole(userData.data().role);
      }else{
        setRole(null);
      }
    }
    setIsAuthLoading(false);
      });
      return () => unSubs();
  },[]);

    return(
      <AuthContext.Provider value={{ user, role, isAuthLoading }}>
        {children}
      </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext);