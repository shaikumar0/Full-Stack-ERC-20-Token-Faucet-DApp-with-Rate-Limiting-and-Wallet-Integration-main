import {ethers} from "ethers";
const faucetAddress = import.meta.env.VITE_FAUCET_ADDRESS;
const tokenAddress = import.meta.env.VITE_TOKEN_ADDRESS;

const tokenAbi = [
    "function balanceOf(address owner) view returns (uint256)"
];

function getProvider() {
    if (!window.ethereum) {
        throw new Error("MetaMask not installed");
    }
    return new ethers.BrowserProvider(window.ethereum);
}

export async function getTokenBalance(address) {
    const provider = getProvider();
    const token = new ethers.Contract(tokenAddress, tokenAbi, provider);
    const balance = await token.balanceOf(address);
    return balance.toString();
}

const faucetAbi = [
    "function requestTokens()",
    "function canClaim(address) view returns (bool)",
    "function remainingAllowance(address) view returns (uint256)"
];

export async function requestTokens() {
    const provider = getProvider();
    const signer = await provider.getSigner();
    const faucet = new ethers.Contract(faucetAddress, faucetAbi, signer);
    const tx = await faucet.requestTokens();
    await tx.wait();
    return tx.hash;
}

export async function canClaim(address) {
    const provider = getProvider();
    const faucet = new ethers.Contract(faucetAddress, faucetAbi, provider);
    return await faucet.canClaim(address);
}

export async function getRemainingAllowance(address) {
    const provider = getProvider();
    const faucet = new ethers.Contract(faucetAddress, faucetAbi, provider);
    const allowance = await faucet.remainingAllowance(address);
    return allowance.toString();
}

const faucetAbiExtra = [
  "function lastClaimAt(address) view returns (uint256)"
];

export async function getLastClaimAt(address) {
  const provider = getProvider();
  const faucet = new ethers.Contract(
    faucetAddress,
    [...faucetAbi, ...faucetAbiExtra],
    provider
  );
  const ts = await faucet.lastClaimAt(address);
  return ts.toString();
}
