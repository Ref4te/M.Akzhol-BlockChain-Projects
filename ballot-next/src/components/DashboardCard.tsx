interface Props {
  title: string;
  value: string;
}

function shortAddress(value: string) {
  if (!value || value === "-") return value;
  if (value.length < 10) return value;
  return value.slice(0, 6) + "..." + value.slice(-4);
}

export default function DashboardCard({ title, value }: Props) {
  return (
    <div className="card dashboard-card">
      <p style={{ opacity: 0.6 }}>{title}</p>
      <h3 style={{ fontFamily: "monospace" }}>
        {shortAddress(value)}
      </h3>
    </div>
  );
}