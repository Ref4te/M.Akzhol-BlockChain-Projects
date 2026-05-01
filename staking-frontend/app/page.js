"use client";

import { useState, useCallback } from "react";
import { ethers } from "ethers";

const CONTRACT_ADDRESS = "0x6D084C1712280A311F999e15Fe7F2AB7a92Fc7Fd";
const TOKEN_ADDRESS = "0x3124cd42990790d9392453fBcBFaFAA1676f6Af4";

const CONTRACT_ABI = [
  "function stake(uint256 amount) external",
  "function unstake() external",
  "function stakes(address) external view returns (uint256 amount, uint256 timestamp, uint256 unclaimed)",
  "function calculateReward(address user) external view returns (uint256)",
];

const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
];

export default function Home() {
  const [account, setAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [position, setPosition] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: "", type: "" });
  const [loading, setLoading] = useState({
    approve: false,
    stake: false,
    unstake: false,
    position: false,
  });

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "" }), 3000);
  };

  const getProvider = () => {
    if (!window.ethereum) {
      showToast("MetaMask not found", "error");
      return null;
    }
    return new ethers.BrowserProvider(window.ethereum);
  };

  const getSigner = async () => {
    const provider = getProvider();
    if (!provider) return null;
    return await provider.getSigner();
  };

  const fetchPosition = useCallback(async (addr) => {
    try {
      setLoading((prev) => ({ ...prev, position: true }));
      const provider = getProvider();
      if (!provider) return;
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const [stakeData, reward] = await Promise.all([
        contract.stakes(addr),
        contract.calculateReward(addr),
      ]);
      setPosition({
        staked: ethers.formatUnits(stakeData.amount, 18),
        reward: ethers.formatUnits(reward, 18),
      });
    } catch {
      setPosition({ staked: "0", reward: "0" });
    } finally {
      setLoading((prev) => ({ ...prev, position: false }));
    }
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) { showToast("MetaMask not found", "error"); return; }
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      showToast("Wallet connected");
      await fetchPosition(accounts[0]);
    } catch {
      showToast("Connection rejected", "error");
    }
  };

  const approve = async () => {
    if (!amount) return;
    setLoading((prev) => ({ ...prev, approve: true }));
    try {
      const signer = await getSigner();
      if (!signer) return;
      const token = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
      const tx = await token.approve(CONTRACT_ADDRESS, ethers.parseUnits(amount, 18));
      await tx.wait();
      showToast("Approval confirmed");
    } catch { showToast("Approval failed", "error"); }
    setLoading((prev) => ({ ...prev, approve: false }));
  };

  const stake = async () => {
    if (!amount) return;
    setLoading((prev) => ({ ...prev, stake: true }));
    try {
      const signer = await getSigner();
      if (!signer) return;
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.stake(ethers.parseUnits(amount, 18));
      await tx.wait();
      showToast("Staked successfully");
      setAmount("");
      await fetchPosition(account);
    } catch { showToast("Staking failed", "error"); }
    setLoading((prev) => ({ ...prev, stake: false }));
  };

  const unstake = async () => {
    setLoading((prev) => ({ ...prev, unstake: true }));
    try {
      const signer = await getSigner();
      if (!signer) return;
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.unstake();
      await tx.wait();
      showToast("Unstaked successfully");
      await fetchPosition(account);
    } catch { showToast("Unstake failed", "error"); }
    setLoading((prev) => ({ ...prev, unstake: false }));
  };

  const fmt = (val) => {
    const n = parseFloat(val);
    if (isNaN(n) || n === 0) return "0";
    if (n < 0.0001) return "<0.0001";
    return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
  };

  const shortAddress = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : "Connect Wallet";

  return (
    <>
      <main className="app">
        <div className="bg-grid" />

        <div className="content">
          <div className="header">
            <div className="logo">
              <div className="logo-icon">🔥</div>
              <h1>StakeFire</h1>
            </div>
            <div className="subtitle">Decentralized Staking Protocol</div>
          </div>

          <button
            className={`connect-btn ${account ? "connected" : ""}`}
            onClick={connectWallet}
          >
            <span className={`dot ${account ? "green" : "gray"}`} />
            {shortAddress}
          </button>

          {account && (
            <div className="card position-card">
              <div className="card-label">
                My Position
                <button
                  className="refresh-btn"
                  onClick={() => fetchPosition(account)}
                  title="Refresh"
                >
                  ↻
                </button>
              </div>
              <div className="position-grid">
                <div className="pos-item">
                  <div className="pos-val">
                    {loading.position ? "—" : fmt(position?.staked ?? "0")}
                    <span className="pos-unit">dAu</span>
                  </div>
                  <div className="pos-key">Staked</div>
                </div>
                <div className="pos-divider" />
                <div className="pos-item right">
                  <div className="pos-val green">
                    {loading.position ? "—" : fmt(position?.reward ?? "0")}
                    <span className="pos-unit">dAu</span>
                  </div>
                  <div className="pos-key">Earned · 10% APY</div>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-label">Stake Tokens</div>
            <div className="amount-row">
              <input
                className="amount-input"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="token-badge">dAu</div>
            </div>
            <div className="actions">
              <button
                className="action-btn btn-approve"
                onClick={approve}
                disabled={!account || !amount || loading.approve}
              >
                {loading.approve ? "Approving..." : "Approve"}
              </button>
              <button
                className="action-btn btn-stake"
                onClick={stake}
                disabled={!account || !amount || loading.stake}
              >
                {loading.stake ? "Staking..." : "Stake"}
              </button>
              <button
                className="action-btn btn-unstake"
                onClick={unstake}
                disabled={!account || loading.unstake}
              >
                {loading.unstake ? "Withdrawing..." : "Unstake All"}
              </button>
            </div>
          </div>
        </div>

        {toast.show && (
          <div className={`toast show ${toast.type}`}>{toast.msg}</div>
        )}
      </main>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap");

        .app {
          min-height: 100vh;
          background: #0a0a0f;
          padding: 2rem 1rem;
          font-family: "Syne", sans-serif;
          color: #f0eeff;
          position: relative;
        }

        .bg-grid {
          position: fixed; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(120, 80, 255, 0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(120, 80, 255, 0.06) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .content { position: relative; z-index: 2; max-width: 480px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 2rem; }
        .logo { display: flex; justify-content: center; align-items: center; gap: 10px; }

        .logo-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: linear-gradient(135deg, #7c3aed, #06d6a0);
          display: flex; align-items: center; justify-content: center;
        }

        h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }

        .subtitle {
          font-family: "Space Mono", monospace; font-size: 11px;
          color: #6b6a8a; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px;
        }

        .connect-btn {
          width: 100%; padding: 14px; border-radius: 14px;
          border: 1px solid #7c3aed; background: transparent; color: #a78bfa;
          margin-bottom: 1rem; font-family: "Space Mono", monospace; font-size: 13px; cursor: pointer;
        }
        .connected { color: #06d6a0; border-color: #06d6a0; }

        .card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.07);
          padding: 1.5rem; border-radius: 20px; margin-bottom: 1rem;
        }

        .card-label {
          font-family: "Space Mono", monospace; font-size: 10px;
          color: #6b6a8a; letter-spacing: 2px; text-transform: uppercase;
          margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;
        }

        .refresh-btn {
          background: none; border: none; color: #6b6a8a;
          font-size: 18px; cursor: pointer; padding: 0 2px; line-height: 1;
          transition: color 0.15s;
        }
        .refresh-btn:hover { color: #a78bfa; }

        .position-grid { display: flex; align-items: center; }

        .pos-item { flex: 1; }
        .pos-item.right { text-align: right; }

        .pos-divider {
          width: 1px; height: 48px; background: rgba(255,255,255,0.08); flex-shrink: 0; margin: 0 1rem;
        }

        .pos-val {
          font-size: 20px; font-weight: 700; margin-bottom: 4px;
          display: flex; align-items: baseline; gap: 5px;
        }
        .pos-item.right .pos-val { justify-content: flex-end; }

        .pos-unit {
          font-family: "Space Mono", monospace; font-size: 11px;
          color: #6b6a8a; font-weight: 400;
        }

        .pos-key {
          font-family: "Space Mono", monospace; font-size: 10px;
          color: #6b6a8a; letter-spacing: 1px; text-transform: uppercase;
        }

        .green { color: #06d6a0; }

        .amount-row { display: flex; gap: 10px; }

        .amount-input {
          flex: 1; padding: 12px; border-radius: 12px;
          background: rgba(255,255,255,0.05); color: white;
          border: 1px solid rgba(255,255,255,0.1);
          font-family: "Syne", sans-serif; font-size: 18px; font-weight: 700; outline: none;
        }

        .token-badge {
          padding: 12px 16px; border-radius: 10px;
          background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.3);
          color: #a78bfa; font-family: "Space Mono", monospace; font-size: 13px;
          display: flex; align-items: center;
        }

        .actions { display: grid; gap: 10px; margin-top: 1rem; }

        .action-btn {
          padding: 14px; border-radius: 12px; border: none;
          font-weight: 700; font-family: "Syne", sans-serif; font-size: 14px;
          cursor: pointer; transition: opacity 0.15s;
        }
        .action-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        .btn-approve {
          background: rgba(124,58,237,0.15); color: #a78bfa;
          border: 1px solid rgba(124,58,237,0.4);
        }
        .btn-stake { background: linear-gradient(135deg, #7c3aed, #5b21b6); color: white; }
        .btn-unstake {
          background: rgba(6,214,160,0.08); color: #06d6a0;
          border: 1px solid rgba(6,214,160,0.25);
        }

        .toast {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
          padding: 12px 20px; border-radius: 12px; background: #1a1a2e;
          font-family: "Space Mono", monospace; font-size: 12px;
          border: 1px solid rgba(255,255,255,0.1); white-space: nowrap;
        }
        .success { color: #06d6a0; border-color: rgba(6,214,160,0.4); }
        .error { color: #ff6b6b; border-color: rgba(255,107,107,0.4); }

        .dot {
          display: inline-block; width: 7px; height: 7px;
          border-radius: 50%; margin-right: 8px;
        }
        .dot.green { background: #06d6a0; }
        .dot.gray { background: gray; }
      `}</style>
    </>
  );
}