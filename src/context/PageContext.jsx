import { createContext, useContext, useState } from "react";

const PageContext = createContext();

export function PageProvider({ children }){
  // default page 'home'
  const [activePage, setActivePage] = useState('home');

  return(
    <PageContext.Provider value={{activePage, setActivePage}}>
      {children}
    </PageContext.Provider>
  )
}
 
export const usePage = () => useContext(PageContext);