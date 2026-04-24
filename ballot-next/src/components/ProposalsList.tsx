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
    <section className="card">
      <h2>Предложения</h2>

      <div className="proposals-grid">
        {proposals.map(p => (
          <div
            key={p.index}
            className={`proposal-item ${p.isWinner ? "winner-card" : ""}`}
          >
            <div className="proposal-title">
              {p.name}
            </div>

            <div className="proposal-votes">
              {p.voteCount} голосов
            </div>

            <button onClick={() => onVote(p.index)}>
              Голосовать
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}