import React, { useEffect } from "react";
import Link from "next/link";
import { useAccount } from "@/utils/AccountContext";
import { ensureWalletClient } from "@/utils/viemClient";
import type { Address } from "viem";

export default function Navbar() {
  const { account, setAccount } = useAccount();

  async function connectWallet() {
    try {
      const { userAccount } = await ensureWalletClient();
      setAccount(userAccount);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        setAccount(accounts[0] ? (accounts[0] as Address) : null);
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    }
  }, [setAccount]);

  return (
    <nav className="p-4 border-b mb-4 flex justify-between items-center bg-white shadow-sm">
      <div className="text-xl font-bold text-blue-600">
        <Link href="/">Blockvest</Link>
      </div>
      <div className="flex items-center gap-6">
        <Link href="/projects" className="hover:text-blue-600 transition-colors">
          Projects
        </Link>
        <Link href="/profile" className="hover:text-blue-600 transition-colors">
          Profile
        </Link>
        {account ? (
          <span className="px-3 py-1.5 bg-gray-100 rounded-full text-sm">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
        ) : (
          <button
            onClick={connectWallet}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-colors"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
}