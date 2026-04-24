interface Props {
  account: string;
  status: string;
  onConnect: () => void;
}

export default function Header({ account, status, onConnect }: Props) {

  function shortAddress(addr: string) {
    if (!addr || addr === "-") return addr;
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  }

  return (
    <header
      className="card"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div>
        <h2>Ballot.sol</h2>
        <p style={{ opacity: 0.6 }}>{status}</p>
      </div>

      {account === "-" ? (
        <button onClick={onConnect}>Подключить</button>
      ) : (
        <div style={{ fontSize: 14, fontFamily: "monospace" }}>
          {shortAddress(account)}
        </div>
      )}
    </header>
  );
}