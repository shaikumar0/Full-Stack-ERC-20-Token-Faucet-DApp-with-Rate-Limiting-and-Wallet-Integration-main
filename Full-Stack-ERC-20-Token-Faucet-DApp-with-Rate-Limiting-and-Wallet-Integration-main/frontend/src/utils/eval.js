import { connectWallet } from "./wallet";
import {
  getTokenBalance,
  requestTokens,
  canClaim,
  getRemainingAllowance,
} from "./contracts";

const tokenAddress = import.meta.env.VITE_TOKEN_ADDRESS;
const faucetAddress = import.meta.env.VITE_FAUCET_ADDRESS;

window.__EVAL__ = {
  async connectWallet() {
    try {
      return await connectWallet();
    } catch (e) {
      throw new Error(e.message || "Wallet connection failed");
    }
  },

  async requestTokens() {
    try {
      const txHash = await requestTokens();
      return txHash;
    } catch (e) {
      throw new Error(e.message || "Request tokens failed");
    }
  },

  async getBalance(address) {
    try {
      return await getTokenBalance(address);
    } catch (e) {
      throw new Error("Failed to fetch balance");
    }
  },

  async canClaim(address) {
    return Boolean(await canClaim(address));
  },

  async getRemainingAllowance(address) {
    try {
      return await getRemainingAllowance(address);
    } catch (e) {
      throw new Error("Failed to fetch remaining allowance");
    }
  },

  async getContractAddresses() {
    return {
      token: tokenAddress,
      faucet: faucetAddress,
    };
  },
};
