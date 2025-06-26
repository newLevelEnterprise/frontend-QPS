import { useState, type ReactNode } from 'react';

import { createContext } from "react";

interface IAuthContext {
  enterprise_id: number;
  setEnterpriseId: (enterprise_id: number) => void;
  user_id: number;
  setUserIdFn: (user_id: number) => void;
}

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext({} as IAuthContext);

function AuthProvider({children}: AuthContextProviderProps) {
  const [enterprise_id, setEnterprise_Id] = useState<number>(0);
  const [userId, setUserId] = useState<number>(0);

  const setEnterpriseId = (enterprise_id: number) => setEnterprise_Id(enterprise_id);
  const setUserIdFn = (user_id: number) => setUserId(user_id);

  return (
    <AuthContext.Provider value={{enterprise_id, setEnterpriseId, setUserIdFn, user_id: userId}}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider