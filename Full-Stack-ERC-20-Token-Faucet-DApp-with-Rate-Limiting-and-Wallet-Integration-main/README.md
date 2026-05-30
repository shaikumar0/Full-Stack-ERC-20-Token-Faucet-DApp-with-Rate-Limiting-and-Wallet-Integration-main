Web3 Token Faucet DApp

This repo is a small but complete Web3 faucet: an ERC-20 token with on-chain guardrails (cooldowns, lifetime limits, pausing) plus a React frontend that talks to Sepolia via MetaMask. Everything is containerized so you can run it locally with a single command.

What’s inside
- Smart contracts: ERC-20 token with fixed supply, faucet-only minting, 24h cooldown, lifetime cap, and pause/unpause. Clear revert reasons and 0.8+ safety.
- Frontend: React + ethers.js, MetaMask (EIP-1193) integration, live balances, cooldown countdown, remaining allowance, and friendly errors. Includes the required window.__EVAL__ helpers for automated checks.
- Ops: Dockerized frontend with health check; `docker compose up` brings everything online. Config driven by env vars.

Deployed contracts (Sepolia)
- ERC-20 FaucetToken: https://sepolia.etherscan.io/address/0xE095cF078116D0964f7705f3E5790426A49Fc83f
- TokenFaucet: https://sepolia.etherscan.io/address/0xf056480b2E4951a2F96BC3A4ADa9e6B1f9f38307
Both are verified on Etherscan.

Prerequisites
- Docker
- MetaMask set to Sepolia
- A little Sepolia ETH for gas

Local quick start (Docker)
1) From the repo root, run: `docker compose up --build`
2) Open http://localhost:3000 (health check at /health). First load may take ~1 minute.

Configuration (.env for frontend)
```
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
VITE_TOKEN_ADDRESS=0xE095cF078116D0964f7705f3E5790426A49Fc83f
VITE_FAUCET_ADDRESS=0xf056480b2E4951a2F96BC3A4ADa9e6B1f9f38307
```

How it works
- The faucet enforces all rules on-chain: 24h cooldowns, per-address lifetime cap, and pausing. No centralized backend.
- The frontend only reads state and submits transactions through MetaMask.

Evaluation helpers (window.__EVAL__)
The UI exposes a small helper object for automated checks:
```
window.__EVAL__ = {
  connectWallet(),               // returns address (string)
  requestTokens(),               // returns tx hash (string)
  getBalance(address),           // returns balance (string)
  canClaim(address),             // returns boolean
  getRemainingAllowance(address),// returns string
  getContractAddresses()         // returns { token, faucet }
}
```
Numbers come back as strings; functions throw descriptive errors.

Design notes
- Faucet amount: fixed per claim to keep gas predictable and UX simple.
- Cooldown: 24 hours to prevent abuse.
- Lifetime limit: stops a single address from draining supply.
- Safety: faucet-only minting, checks-effects-interactions, Solidity 0.8 overflow guards, clear reverts.

Testing
- Contracts: Hardhat tests cover successful claims, cooldowns, lifetime limits, pause/unpause, and admin-only controls (with time travel for cooldown checks).
- Frontend: manual passes for wallet connect, loading/error states, and the evaluation helper.

Screenshots and demo

Key UI states:

1. **Wallet Disconnected** (`01-wallet-disconnected.png`) – Initial state with no wallet connected
2. **Wallet Connecting** (`02-wallet-connecting.png`) – MetaMask prompt active, user authorizing
3. **Wallet Connected** (`03-wallet-connected.png`) – Wallet linked, user can see balance and claim button
4. **Transaction Initialization** (`04-transaction-intialization.png`) – Claim submitted, awaiting on-chain confirmation
5. **Transaction Accepted** (`05-transaction-accepted.png`) – Transaction accepted by network, pending finality
6. **Transaction Successful** (`06-transaction-successful.png`) – Claim complete, cooldown timer active

See the [screenshots/](screenshots/) directory for all images.

**Video Demo:**  [YouTube](https://youtu.be/OW1TY6FehhA) – short walkthrough of the full workflow (connect → claim → cooldown).

Future ideas
- Multi-token faucet support
- Multi-chain deployments
- Simple admin dashboard
- Indexed event history view

Deployment checklist
- Contracts deployed to Sepolia and verified on Etherscan
- Docker images build and run
- /health endpoint responds
- window.__EVAL__ helpers available
- MetaMask flow works end-to-end (claim, cooldown, errors)

If you run into trouble, double-check your RPC URL, contract addresses, and that MetaMask is on Sepolia with enough test ETH for gas.