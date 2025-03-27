// src/utils/viemClient.ts
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  Chain,
  parseEther,
  type Abi,
} from "viem";
import { sepolia, anvil } from "viem/chains";
import BlockvestArtifact from "../../foundry/out/Blockvest.sol/Blockvest.json";

const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CHAIN === "sepolia"
    ? "0x58e4123bc0CA156bAFF3D10Bd13becC05694DCD3" // example sepolia
    : "0x8464135c8F25Da09e49BC8782676a84730C318bC"; // example local

const ABI = BlockvestArtifact.abi as Abi;
const currentChain: Chain =
  process.env.NEXT_PUBLIC_CHAIN === "sepolia" ? sepolia : anvil;

// Public client (for read ops)
export const publicClient = createPublicClient({
  chain: currentChain,
  transport:
    process.env.NEXT_PUBLIC_CHAIN === "sepolia"
      ? http(process.env.NEXT_PUBLIC_ALCHEMY_RPC_URL || "")
      : http(), // local
});

// Wallet client (for write ops)
export const walletClient =
  typeof window !== "undefined" && (window as any).ethereum
    ? createWalletClient({
        chain: currentChain,
        transport: custom((window as any).ethereum),
      })
    : null;

/**
 * ensureWalletClient:
 * 1) Check if walletClient is defined.
 * 2) Confirm user is on the correct chain.
 * 3) Request accounts & return the first as userAccount.
 */
export const ensureWalletClient = async () => {
  if (!walletClient) {
    throw new Error("Wallet client is not available. Please install MetaMask.");
  }

  const chainId = await (window as any).ethereum.request({
    method: "eth_chainId",
  });
  if (parseInt(chainId, 16) !== currentChain.id) {
    throw new Error(`Please switch to the correct chain: ${currentChain.name}`);
  }

  // Prompt user to connect
  const accounts: string[] = await (window as any).ethereum.request({
    method: "eth_requestAccounts",
  });

  const userAccount = accounts[0] as `0x${string}`;
  return {
    client: walletClient,
    userAccount,
  };
};

export const waitForTxConfirmation = async (txHash: `0x${string}`) => {
  try {
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });
    console.log("Transaction confirmed:", receipt);
    return receipt;
  } catch (err) {
    console.error("Transaction failed:", err);
    throw new Error("Transaction failed to confirm.");
  }
};

export const blockvestContract = {
  // Write ops
  investInProject: async (projectId: number, investAmount: string) => {
    const { client, userAccount } = await ensureWalletClient();
    const value = parseEther(investAmount);
    const hash = await client.writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: ABI,
      functionName: "investInProject",
      args: [BigInt(projectId)],
      value,
      account: userAccount,
    });
    return waitForTxConfirmation(hash);
  },

  createProject: async (
    name: string,
    details: string,
    target: number | bigint,
    equity: number | bigint
  ) => {
    const { client, userAccount } = await ensureWalletClient();
    const hash = await client.writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: ABI,
      functionName: "createProject",
      args: [name, details, BigInt(target), BigInt(equity)],
      account: userAccount,
    });
    return waitForTxConfirmation(hash);
  },

  // e.g. for the project owner
  withdrawFunds: async (projectId: number) => {
    const { client, userAccount } = await ensureWalletClient();
    const hash = await client.writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: ABI,
      functionName: "withdrawFunds",
      args: [BigInt(projectId)],
      account: userAccount,
    });
    return waitForTxConfirmation(hash);
  },

  // Read ops
  getProject: async (projectId: number) => {
    const data = (await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: ABI,
      functionName: "getProject",
      args: [BigInt(projectId)],
    })) as [
      bigint,
      `0x${string}`,
      string,
      string,
      bigint,
      bigint,
      bigint,
      boolean
    ];
    return {
      id: Number(data[0]),
      owner: data[1],
      name: data[2],
      details: data[3],
      target: data[4].toString(),
      equity: data[5].toString(),
      totalInvested: data[6].toString(),
      isClosed: data[7],
    };
  },

  getAllProjectIds: async () => {
    const ids = (await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: ABI,
      functionName: "getAllProjectIds",
    })) as bigint[];
    return ids.map((id) => Number(id));
  },

  getInvestorAmount: async (projectId: number, investor: `0x${string}`) => {
    const amount = (await publicClient.readContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: ABI,
      functionName: "getInvestorAmount",
      args: [BigInt(projectId), investor],
    })) as bigint;
    return amount.toString();
  },
};
