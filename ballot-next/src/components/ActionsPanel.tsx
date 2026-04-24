"use client";
import { useState } from "react";

interface Props {
  onGive: (addr: string) => void;
  onDelegate: (addr: string) => void;
  onVote: (index: number) => void;
}

export default function ActionsPanel({ onGive, onDelegate, onVote }: Props) {
  const [giveAddr, setGiveAddr] = useState("");
  const [delegateAddr, setDelegateAddr] = useState("");

  return (
    <section className="card">
      <h2>⚡ Действия</h2>

      <div className="actions-grid">
        <div>
          <p>Выдать право</p>
          <input value={giveAddr} onChange={e => setGiveAddr(e.target.value)} />
          <button onClick={() => onGive(giveAddr)}>Выдать</button>
        </div>

        <div>
          <p>Делегировать</p>
          <input value={delegateAddr} onChange={e => setDelegateAddr(e.target.value)} />
          <button onClick={() => onDelegate(delegateAddr)}>Делегировать</button>
        </div>

        
      </div>
    </section>
  );
}