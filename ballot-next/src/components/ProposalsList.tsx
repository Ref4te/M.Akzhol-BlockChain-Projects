interface Proposal {
  index: number;
  name: string;
  voteCount: string;
  isWinner: boolean;
}

interface Props {
  proposals: Proposal[];
  onVote: (index: number) => void;
}

export default function ProposalsList({ proposals, onVote }: Props) {
  return (
    <div id="proposalsList" className="proposals-grid">
      {proposals.map(p => (
        <div
          key={p.index}
          className={`proposal-item ${p.isWinner ? "winner-card" : ""}`}
        >
          <div className="proposal-title">
            {p.isWinner ? "⭐ " : ""}{p.name}
          </div>
          <div className="proposal-votes">📊 {p.voteCount} голосов</div>
          <button className="vote-button" onClick={() => onVote(p.index)}>
            {p.isWinner ? "✓ Лидер" : "Голосовать"}
          </button>
        </div>
      ))}
    </div>
  );
}
