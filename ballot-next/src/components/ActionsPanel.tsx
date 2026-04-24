"use client";
import { useState } from "react";

interface Props {
  onGive: (addr: string) => void;
  onDelegate: (addr: string) => void;
}

export default function ActionsPanel({ onGive, onDelegate }: Props) {
  const [giveAddr, setGiveAddr] = useState("");
  const [delegateAddr, setDelegateAddr] = useState("");

  return (
    <section>
      <h2>⚡ Действия</h2>

      <div className="input-group">
        <div>
          <h3>👤 Выдать право голоса</h3>
          <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '8px 0' }}>Только председатель</p>
          <input
            type="text"
            placeholder="0x... адрес участника"
            value={giveAddr}
            onChange={e => setGiveAddr(e.target.value)}
          />
          <button onClick={() => onGive(giveAddr)}>✅ Выдать право</button>
        </div>

        <hr />

        <div>
          <h3>🔗 Делегировать голос</h3>
          <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '8px 0' }}>Передать голос другому</p>
          <input
            type="text"
            placeholder="0x... адрес получателя"
            value={delegateAddr}
            onChange={e => setDelegateAddr(e.target.value)}
          />
          <button onClick={() => onDelegate(delegateAddr)}>➡️ Делегировать</button>
        </div>

      </div>
    </section>
  );
}
