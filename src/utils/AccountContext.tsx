import React, { createContext, useContext, useEffect, useState } from "react";
import type { Address } from "viem";

type AccountContextType = {
  account: Address | null;
  setAccount: React.Dispatch<React.SetStateAction<Address | null>>;
};

const AccountContext = createContext<AccountContextType>({
  account: null,
  setAccount: () => {},
});

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<Address | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount(null);
        } else {
          setAccount(accounts[0] as Address);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    }
  }, []);

  return (
    <AccountContext.Provider value={{ account, setAccount }}>
      {children}
    </AccountContext.Provider>
  );
}

export const useAccount = () => useContext(AccountContext);