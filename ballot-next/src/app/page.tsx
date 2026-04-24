"use client";

import { useWallet } from "@/hooks/useWallet";
import { useBallot } from "@/hooks/useBallot";
import { CONTRACT_ADDRESS } from "@/lib/contract";

import ActionsPanel from "@/components/ActionsPanel";
import ProposalsList from "@/components/ProposalsList";

export default function Home() {
  const { signer, contract, account, status, setStatus, connectWallet } = useWallet();

  const {
    chairperson,
    proposals,
    voterData,
    loadAll,
    giveRightToVote,
    delegateVote,
    voteForProposal,
  } = useBallot(contract, signer, setStatus);

  const contractAddress = String(contract?.target ?? CONTRACT_ADDRESS);

  return (
    <main className="app-shell">
      <h1>🗳️ Голосование</h1>

      <section className="header-section">
        <div className="header-actions">
          <button id="connectBtn" onClick={connectWallet}>🔗 Подключить кошелек</button>
        </div>
        <div className="header-grid">
          <div><span className="label">Аккаунт:</span> <span className="value">{account ? `${account.slice(0, 12)}...` : "-"}</span></div>
          <div><span className="label">Контракт:</span> <span className="value">{contractAddress ? `${contractAddress.slice(0, 12)}...` : "-"}</span></div>
          <div><span className="label">Результаты:</span> <span className="value">{chairperson ? `${chairperson.slice(0, 12)}...` : "-"}</span></div>
          <div><span className="label">Ваш вес:</span> <span className="value">{voterData?.weight ?? "0"}</span></div>
          <div><span className="label">Статус:</span> <span className="value">{voterData?.voted === "Aa" ? "✅ Голосовал" : "❌ Нет"}</span></div>
          <div><span className="label">Делегат:</span> <span className="value">{voterData?.delegate ? `${voterData.delegate.slice(0, 10)}...` : "-"}</span></div>
        </div>
        <button id="loadVoterBtn" onClick={loadAll}>Обновить информацию</button>
      </section>

      <div className="layout-grid">
        <div className="layout-left">
          <ActionsPanel onGive={giveRightToVote} onDelegate={delegateVote} />
        </div>
        <div className="layout-right">
          <section>
            <h2>📊 Предложения</h2>
            <button id="loadProposalsBtn" onClick={loadAll} className="btn-secondary">Обновить список</button>
            <ProposalsList proposals={proposals} onVote={voteForProposal} />
          </section>
        </div>
      </div>

      <div className="status-bar">
        <span id="status">{status}</span>
      </div>
    </main>
  );
}
