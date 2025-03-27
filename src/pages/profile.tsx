import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { blockvestContract } from "@/utils/viemClient";
import { formatEther } from "viem";
import { useAccount } from "@/utils/AccountContext";
import type { Address } from "viem";

type Project = {
  id: number;
  owner: Address;
  name: string;
  details: string;
  target: string;
  equity: string;
  totalInvested: string;
  isClosed: boolean;
};

type InvestedProject = Project & {
  investedAmount: string;
  userEquity?: number;
};

export default function ProfilePage() {
  const { account } = useAccount();
  const [projects, setProjects] = useState<Project[]>([]);
  const [myProjects, setMyProjects] = useState<Project[]>([]);
  const [investedProjects, setInvestedProjects] = useState<InvestedProject[]>([]);

  /** Load all projects from contract */
  async function loadProjects() {
    try {
      const ids = await blockvestContract.getAllProjectIds();
      const loaded: Project[] = [];
      for (const id of ids) {
        const p = await blockvestContract.getProject(id);
        loaded.push(p);
      }
      setProjects(loaded);
    } catch (err) {
      console.error("Error loading projects:", err);
    }
  }

  /** Filter: which ones do I own, which ones am I invested in? */
  async function analyzeOwnershipAndInvestments(account: Address) {
    const mine: Project[] = [];
    const invested: InvestedProject[] = [];
    
    for (const p of projects) {
      // 1) check if I'm the owner
      if (p.owner.toLowerCase() === account.toLowerCase()) {
        mine.push(p);
      }
      
      // 2) check if I have invested
      const amountStr = await blockvestContract.getInvestorAmount(p.id, account);
      const amount = BigInt(amountStr);
      
      if (amount > 0n) {
        const target = BigInt(p.target);
        const equity = BigInt(p.equity);
        const userEquity = target > 0n ? 
          Number((amount * equity * 100n) / target) / 10000 : 0;
        
        invested.push({
          ...p,
          investedAmount: formatEther(amount),
          userEquity,
        });
      }
    }
    
    setMyProjects(mine);
    setInvestedProjects(invested);
  }

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (account) {
      analyzeOwnershipAndInvestments(account);
    }
  }, [account, projects]);

  return (
    <div>
      <Navbar />
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        {/* Show connection prompt if not connected */}
        {!account && (
          <div className="text-center p-8">
            <p className="mb-4">Please connect your wallet to view your profile</p>
          </div>
        )}

        {/* Only show content when connected */}
        {account && (
          <>
            {/* Projects I created */}
            <section className="mb-12">
              <h2 className="text-xl font-semibold mb-4">My Created Projects</h2>
              {myProjects.length === 0 ? (
                <p>No projects created yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myProjects.map((p) => (
                    <div key={p.id} className="bg-white p-6 rounded-xl shadow-md">
                      <h3 className="font-bold text-lg mb-2">{p.name}</h3>
                      <p className="text-gray-600 mb-3">{p.details}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Target:</span>
                          <span className="font-medium">
                            {formatEther(BigInt(p.target))} ETH
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Invested:</span>
                          <span className="font-medium">
                            {formatEther(BigInt(p.totalInvested))} ETH
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Equity Offered:</span>
                          <span className="font-medium">
                            {(Number(p.equity) / 100).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Projects I invested in */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Projects I've Invested In</h2>
              {investedProjects.length === 0 ? (
                <p>You haven't invested in any projects yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {investedProjects.map((p) => (
                    <div key={p.id} className="bg-white p-6 rounded-xl shadow-md">
                      <h3 className="font-bold text-lg mb-2">{p.name}</h3>
                      <p className="text-gray-600 mb-3">{p.details}</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Invested:</span>
                          <span className="font-medium">{p.investedAmount} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Your Equity:</span>
                          <span className="font-medium">
                            {p.userEquity?.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Project Status:</span>
                          <span className="font-medium">
                            {p.isClosed ? 'Closed' : 'Active'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}