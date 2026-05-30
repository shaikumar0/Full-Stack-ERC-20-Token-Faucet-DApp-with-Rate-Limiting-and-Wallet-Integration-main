import { useState } from "react";
import "./App.css";
import { connectWallet } from "./utils/wallet";
import {
  getTokenBalance,
  requestTokens,
  canClaim,
  getRemainingAllowance,
  getLastClaimAt,
} from "./utils/contracts";

function App() {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("");
  const [eligible, setEligible] = useState(false);
  const [remaining, setRemaining] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldownText, setCooldownText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleConnect() {
    try {
      setError("");
      setSuccess("");
      setLoading(true);

      const addr = await connectWallet();
      setAddress(addr);

      const bal = await getTokenBalance(addr);
      setBalance(bal);

      const can = await canClaim(addr);
      setEligible(can);

      const rem = await getRemainingAllowance(addr);
      setRemaining(rem);

      const last = await getLastClaimAt(addr);
      setCooldownText(getCooldownText(last));

    } catch (err) {
      setError(err.message || "Wallet connection failed");
    } finally {
      setLoading(false);
    }
  }



  async function handleRequest() {
    try {
      setError("");
      setSuccess("");
      setLoading(true);

      const can = await canClaim(address);
      if (!can) {
        throw new Error("Cooldown period not elapsed or lifetime limit reached");
      }

      await requestTokens();

      const bal = await getTokenBalance(address);
      setBalance(bal);

      const last = await getLastClaimAt(address);
      setCooldownText(getCooldownText(last));

      const rem = await getRemainingAllowance(address);
      setRemaining(rem);

      setEligible(false);
      setSuccess("Tokens claimed successfully!");
    } catch (err) {
      setError(err.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  }

  function getCooldownText(lastClaimTs) {
    const COOLDOWN = 24 * 60 * 60; // 24 hours

    if (lastClaimTs === "0") return "Ready to claim";

    const now = Math.floor(Date.now() / 1000);
    const remaining = Number(lastClaimTs) + COOLDOWN - now;

    if (remaining <= 0) return "Ready to claim";

    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;

    return `Cooldown: ${h}h ${m}m ${s}s remaining`;
  }

  function handleDisconnect() {
    setAddress("");
    setBalance("");
    setRemaining("");
    setCooldownText("");
    setEligible(false);
    setError("");
    setSuccess("");
  }

  function formatTokenAmount(value) {
    if (!value) return "0";
    return (Number(value) / 1e18).toString();
  }


  return (
    <div className="app-container">
      <div className="card">
        <h2 className="title" style={{color:"black"}}>Web3 Token Faucet</h2>

        {!address ? (
          <button
            className="primary-btn"
            onClick={handleConnect}
            disabled={loading}
          >
            {loading ? "Connecting..." : "Connect Wallet"}
          </button>
        ) : (
          <>
            <p className="info">
              <strong>Address:</strong> {address}
            </p>

            <p className="info">
              <strong>Token Balance:</strong> {formatTokenAmount(balance)}
            </p>

            <p className="info">
              <strong>Remaining Allowance:</strong> {formatTokenAmount(remaining)}
            </p>

            <p className="status">{cooldownText}</p>

            {loading && <div className="loader"></div>}

            <button
              className="primary-btn"
              onClick={handleRequest}
              disabled={!eligible || loading}
            >
              {loading ? "Processing..." : "Request Tokens"}
            </button>

            <button
              className="secondary-btn"
              onClick={handleDisconnect}
            >
              Disconnect Wallet
            </button>
          </>
        )}

        {error && <p className="error">{error}</p>}
        {success && (
          <p style={{ color: "green", textAlign: "center", marginTop: "10px" }}>
            {success}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
