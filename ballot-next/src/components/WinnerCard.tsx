interface Props {
  winnerIndex: string;
  winnerName: string;
}

export default function WinnerCard({ winnerIndex, winnerName }: Props) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
      border: '2px solid #10b981',
      borderRadius: '18px',
      padding: '28px',
      marginBottom: '24px',
      boxShadow: '0 10px 30px rgba(16, 185, 129, 0.15)'
    }}>
      <h2>🏆 Победитель</h2>
      <p><strong>Название:</strong> <span className="info-label">{winnerName}</span></p>
      <p><strong>Индекс:</strong> <span className="info-label">{winnerIndex}</span></p>
    </div>
  );
}