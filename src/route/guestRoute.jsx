import { useAuth } from "../context/Auth";
import { Navigate } from "react-router-dom";

export default function GuestRoute({ children }){

  const {user, isAuthLoading} = useAuth();

  if (isAuthLoading) return null; // kung di sure if logged in, hold muna render

  if (user){
    return <Navigate to= '/dashboard' replace />
  }

  return children;
}