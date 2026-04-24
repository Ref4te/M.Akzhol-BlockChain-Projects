interface Props {
  winnerIndex: string;
  winnerName: string;
}

export default function WinnerCard({ winnerIndex, winnerName }: Props) {
  return (
    <section className="card winner-card">
      <h2>Победитель</h2>
      <p><strong>Индекс:</strong> {winnerIndex}</p>
      <p><strong>Имя:</strong> {winnerName}</p>
    </section>
  );
}