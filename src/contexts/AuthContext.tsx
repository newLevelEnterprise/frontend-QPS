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
  const [enterprise_id, setEnterprise_Id] = useState<number>(() => {
    const id = localStorage.getItem('enterprise_id') as string ?? 0;
    return parseInt(id);
  });
  const [userId, setUserId] = useState<number>(() => {
    const id = localStorage.getItem('user_id') as string ?? 0;
    return parseInt(id);
  });

  const setEnterpriseId = (enterprise_id: number) => {
    localStorage.setItem('enterprise_id', `${enterprise_id}`);
    setEnterprise_Id(enterprise_id);
  };
  const setUserIdFn = (user_id: number) => {
    localStorage.setItem('user_id', `${user_id}`);
    setUserId(user_id)
  };

  return (
    <AuthContext.Provider value={{enterprise_id, setEnterpriseId, setUserIdFn, user_id: userId}}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider