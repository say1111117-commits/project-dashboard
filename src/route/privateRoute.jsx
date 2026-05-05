import { useAuth } from "../context/Auth";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }){

  const {user, isAuthLoading} = useAuth();

  if(isAuthLoading) return null; // kung di sure if logged in, hold muna render

  if(!user){ // pag walang user na naka log stay ka lang sa log in
    return <Navigate to='/login' replace />
  }

  return children;
}