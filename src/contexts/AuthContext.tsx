import { useState, type ReactNode } from 'react';

import { createContext } from "react";

interface IAuthContext {
  enterprise_id: number;
  setEnterpriseId: (enterprise_id: number) => void;
}

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext({} as IAuthContext);

function AuthProvider({children}: AuthContextProviderProps) {
  const [enterprise_id, setEnterprise_Id] = useState<number>(0);

  const setEnterpriseId = (enterprise_id: number) => setEnterprise_Id(enterprise_id);

  return (
    <AuthContext.Provider value={{enterprise_id, setEnterpriseId}}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider