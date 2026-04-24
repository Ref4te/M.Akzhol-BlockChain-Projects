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
        <div className="action-block">
          <h3>👤 Выдать право голоса</h3>
          <p className="action-hint">Только председатель</p>
          <div className="action-row">
            <input
              type="text"
              placeholder="0x... адрес участника"
              value={giveAddr}
              onChange={e => setGiveAddr(e.target.value)}
            />
            <button onClick={() => onGive(giveAddr)}>✅ Выдать право</button>
          </div>
        </div>

        <hr />

        <div className="action-block">
          <h3>🔗 Делегировать голос</h3>
          <p className="action-hint">Передать голос другому</p>
          <div className="action-row">
            <input
              type="text"
              placeholder="0x... адрес получателя"
              value={delegateAddr}
              onChange={e => setDelegateAddr(e.target.value)}
            />
            <button onClick={() => onDelegate(delegateAddr)}>➡️ Делегировать</button>
          </div>
        </div>

      </div>
    </section>
  );
}
