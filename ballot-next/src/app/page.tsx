"use client";

import { useWallet } from "@/hooks/useWallet";
import { useBallot } from "@/hooks/useBallot";

import Header from "@/components/Header";
import DashboardCard from "@/components/DashboardCard";
import ActionsPanel from "@/components/ActionsPanel";
import ProposalsList from "@/components/ProposalsList";
import WinnerCard from "@/components/WinnerCard";

export default function Home() {
  const { signer, contract, account, status, setStatus, connectWallet } = useWallet();

  const {
    chairperson,
    proposals,
    winnerName,
    winnerIndex,
    voterData,
    giveRightToVote,
    delegateVote,
    voteForProposal,
  } = useBallot(contract, signer, setStatus);

  const hasVotingRight = Number(voterData?.weight ?? 0) > 0;

  return (
    <main className="container">
      <Header
        account={account}
        status={status}
        onConnect={connectWallet}
      />

      {!hasVotingRight && (
        <div
          style={{
            background: "#ff4d4f",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "16px",
            color: "white",
            fontWeight: "bold",
          }}
        >
          ❌ У вас нет права голосования. Обратитесь к организатору.
        </div>
      )}

      <div className="info-grid">
        <DashboardCard title="Chairperson" value={chairperson} />
        <DashboardCard title="Ваш вес" value={String(voterData?.weight ?? 0)} />
        <DashboardCard title="Голос" value={String(voterData?.vote ?? "-")} />
        <DashboardCard title="Делегат" value={voterData?.delegate || "-"} />
      </div>

      <ActionsPanel
        onGive={giveRightToVote}
        onDelegate={delegateVote}
        onVote={voteForProposal}
      />

      <ProposalsList
        proposals={proposals}
        onVote={voteForProposal}
      />

      <WinnerCard
        winnerIndex={winnerIndex}
        winnerName={winnerName}
      />
    </main>
  );
}