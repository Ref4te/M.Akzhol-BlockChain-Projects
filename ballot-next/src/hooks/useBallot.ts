"use client";

import { useEffect, useState } from "react";
import { Contract, JsonRpcSigner, ethers } from "ethers";

export interface ProposalData {
  index: number;
  name: string;
  voteCount: string;
  isWinner: boolean;
}

export interface VoterData {
  weight: string;
  voted: string;
  delegate: string;
  vote: string;
}

export function useBallot(
  contract: Contract | null,
  signer: JsonRpcSigner | null,
  setStatus: (value: string) => void
) {
  const [chairperson, setChairperson] = useState<string>("-");
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [winnerName, setWinnerName] = useState<string>("-");
  const [winnerIndex, setWinnerIndex] = useState<string>("-");

  const [voterData, setVoterData] = useState<VoterData>({
    weight: "-",
    voted: "-",
    delegate: "-",
    vote: "-"
  });

  const nameMap: Record<string, string> = {
    "FC Barcelona": "FC Barcelona",
    "Real Madrid": "Real Madrid",
    "Villarreal CF": "Villarreal CF",
    "Atletico Madrid": "Atletico Madrid"
  };

  function decodeBytes32(value: string): string {
    try {
      return ethers.decodeBytes32String(value);
    } catch {
      return value;
    }
  }

  function normalizeErrorMessage(error: unknown): string {
    if (!(error instanceof Error)) return "Ошибка транзакции";

    const raw = error.message.toLowerCase();

    if (raw.includes("already voted")) return "Вы уже голосовали (already voted)";
    if (raw.includes("has no right to vote")) return "У адреса нет права голоса";
    if (raw.includes("chairperson")) return "Только председатель может выполнить это действие";

    return error.message;
  }

  async function loadChairperson(): Promise<void> {
    if (!contract) return;
    const chair = await contract.chairperson();
    setChairperson(chair);
  }

  async function loadVoterStatus(): Promise<void> {
    if (!contract || !signer) return;

    const currentAccount = await signer.getAddress();
    const voter = await contract.voters(currentAccount);

    setVoterData({
      weight: voter.weight.toString(),
      voted: voter.voted ? "Aa" : "HeT",
      delegate: voter.delegate === ethers.ZeroAddress ? "-" : voter.delegate,
      vote: voter.voted ? voter.vote.toString() : "-",
    });
  }

  async function loadProposals(): Promise<void> {
    if (!contract) return;

    let winner: number | null = null;

    try {
      winner = Number(await contract.winningProposal());
    } catch {
      winner = null;
    }

    const loaded: ProposalData[] = [];
    let index = 0;

    while (true) {
      try {
        const proposal = await contract.proposals(index);

        const rawName = decodeBytes32(proposal.name);

        loaded.push({
          index,

          name: nameMap[rawName] ?? rawName,
          voteCount: proposal.voteCount.toString(),
          isWinner: winner !== null && winner === index,
        });

        index++;
      } catch {
        break;
      }
    }

    setProposals(loaded);
  }

  async function loadWinner(): Promise<void> {
    if (!contract) return;

    const winner = await contract.winnerName();
    const winnerProposal = await contract.winningProposal();

    const rawWinner = decodeBytes32(winner);
    setWinnerName(nameMap[rawWinner] ?? rawWinner);
    setWinnerIndex(winnerProposal.toString());
  }

  async function loadAll(): Promise<void> {
    try {
      await loadChairperson();
      await loadVoterStatus();
      await loadProposals();
      await loadWinner();
      setStatus("Данные загружены");
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Ошибка загрузки";
      setStatus(message);
    }
  }

  async function giveRightToVote(address: string): Promise<void> {
    if (!contract) return;

    if (!ethers.isAddress(address)) {
      setStatus("Некорректный адрес");
      return;
    }

    try {
      setStatus("Отправка транзакции ... ");
      const tx = await contract.giveRightToVote(address);
      await tx.wait();

      setStatus("Право голоса выдано");
      await loadAll();
    } catch (error) {
      setStatus(normalizeErrorMessage(error));
    }
  }

  async function delegateVote(address: string): Promise<void> {
    if (!contract) return;

    if (!ethers.isAddress(address)) {
      setStatus("Некорректный адрес делегата");
      return;
    }

    try {
      setStatus("Отправка транзакции ... ");
      const tx = await contract.delegate(address);
      await tx.wait();

      setStatus("Голос делегирован");
      await loadAll();
    } catch (error) {
      setStatus(normalizeErrorMessage(error));
    }
  }

  async function voteForProposal(index: number): Promise<void> {
    if (!contract) return;

    try {
      setStatus("Отправка транзакции ... ");
      const tx = await contract.vote(index);
      await tx.wait();

      setStatus("Голос учтен");
      await loadAll();
    } catch (error) {
      setStatus(normalizeErrorMessage(error));
    }
  }

  useEffect(() => {
    if (!contract || !signer) return;
    void loadAll();
  }, [contract, signer]);

  return {
    chairperson,
    proposals,
    winnerName,
    winnerIndex,
    voterData,
    loadAll,
    giveRightToVote,
    delegateVote,
    voteForProposal,
  };
}
