// src/pages/projects.tsx
import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { blockvestContract } from "@/utils/viemClient";
import { useAccount } from "@/utils/AccountContext";
import { formatEther, parseEther } from "viem";

/** 
 * For clarity, here's a simple type for the Project we get from `getProject`.
 * Adjust/extend as needed. 
 */
type Project = {
  id: number;
  owner: `0x${string}`;
  name: string;
  details: string;
  target: string;        // as string
  equity: string;        // as string
  totalInvested: string; // as string
  isClosed: boolean;
};

export default function ProjectsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { account } = useAccount();
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState({
    name: "",
    details: "",
    target: "",
    equity: "",
  });
  const [creating, setCreating] = useState(false);

  // For invests, keep a local state of "how much" user wants to invest in each project
  // Example: { "1": "0.1", "2": "3", ... } = projectId -> string for "ETH"
  const [investInputs, setInvestInputs] = useState<Record<number, string>>({});

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
      console.error("Error loading projects", err);
    }
  }

  /** Create a new project */
  async function handleCreateProject(e: React.FormEvent) {
    e.preventDefault();
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }
    // Convert equity percentage to basis points (1% = 100)
    const equityPercentage = parseFloat(newProject.equity);
    if (equityPercentage <= 0 || equityPercentage > 100) {
      alert("Equity must be between 0.1% and 100%");
      return;
    }
    const equityBasisPoints = Math.round(equityPercentage * 100);

    // Convert ETH to wei
    const targetWei = parseEther(newProject.target);

    // Validate inputs
    const targetEth = parseFloat(newProject.target);
    const equity = parseFloat(newProject.equity);
    
    if (targetEth <= 0 || equity <= 0 || equity > 100) {
      alert("Invalid target or equity. Equity must be between 0.1 and 100");
      return;
    }

    setCreating(true);
    try {
      await blockvestContract.createProject(
        newProject.name,
        newProject.details,
        targetWei,
        equityBasisPoints
      );
      setNewProject({ name: "", details: "", target: "", equity: "" });
      await loadProjects();
    } catch (err) {
      console.error("Create project error:", err);
      alert("Failed to create project. Check console for details.");
    }
    setCreating(false);
  }

  /** Invest in a particular project */
  async function handleInvest(projectId: number) {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    const amount = investInputs[projectId];
    const project = projects.find(p => p.id === projectId);
    
    if (!project || !amount) return;

    try {
      const amountWei = parseEther(amount);
      const remaining = BigInt(project.target) - BigInt(project.totalInvested);
      
      if (amountWei > remaining) {
        alert(`Maximum investment allowed: ${formatEther(remaining)} ETH`);
        return;
      }

      await blockvestContract.investInProject(projectId, amount);
      setInvestInputs(prev => ({ ...prev, [projectId]: "" }));
      await loadProjects();
    } catch (err) {
      console.error("Invest error:", err);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div>
      <Navbar />
      <main className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Investment Opportunities</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full transition-colors"
          >
            {showCreateForm ? 'Close Form' : 'Create New Project'}
          </button>
        </div>

        {showCreateForm && (
          <div className="mb-12 bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-6">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-6">
              <div>
                <label className="block mb-2">Project Name</label>
                <input
                  type="text"
                  className="w-full p-3 border rounded-lg"
                  value={newProject.name}
                  onChange={(e) =>
                    setNewProject({ ...newProject, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block mb-2">Project Details</label>
                <textarea
                  className="w-full p-3 border rounded-lg"
                  rows={3}
                  value={newProject.details}
                  onChange={(e) =>
                    setNewProject({ ...newProject, details: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block mb-2">Target (ETH)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full p-3 border rounded-lg"
                  value={newProject.target}
                  onChange={(e) =>
                    setNewProject({ ...newProject, target: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block mb-2">Equity (%)</label>
                <input
                  type="number"
                  step="0.1"
                  max="100"
                  className="w-full p-3 border rounded-lg"
                  value={newProject.equity}
                  onChange={(e) =>
                    setNewProject({ ...newProject, equity: e.target.value })
                  }
                />
              </div>

              {/* The critical submit button */}
              <button
                type="submit"
                disabled={creating}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                {creating ? "Creating..." : "Create Project"}
              </button>
            </form>
          </div>
        )}


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => {
            const target = BigInt(p.target);
            const invested = BigInt(p.totalInvested);
            const progress = target > 0n ? Number((invested * 10000n) / target) / 100 : 0;

            return (
              <div key={p.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{p.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    p.isClosed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {p.isClosed ? 'Closed' : 'Active'}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{p.details}</p>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Target:</span>
                    <span className="font-medium">{formatEther(target)} ETH</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Equity Offered:</span>
                    <span className="font-medium">{(Number(p.equity) / 100).toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Invested:</span>
                    <span className="font-medium">{formatEther(invested)} ETH</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative pt-4">
                  <div className="flex mb-2 items-center justify-between">
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        {progress}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                    <div
                      style={{ width: `${progress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Invest section */}
                {!p.isClosed && (
                  <div className="flex gap-3 mt-4">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="ETH amount"
                      className="flex-1 p-2 border rounded-lg"
                      value={investInputs[p.id] || ""}
                      onChange={(e) => setInvestInputs(prev => ({
                        ...prev,
                        [p.id]: e.target.value
                      }))}
                    />
                    <button
                      onClick={() => handleInvest(p.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Invest
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}