export function StockCell({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="font-bold text-[10px] px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded tracking-wider">
        OUT
      </span>
    );
  if (stock <= 5)
    return <span className="font-bold text-[#ff6b00] animate-pulse">{stock}</span>;
  if (stock <= 20)
    return <span className="font-bold text-amber-400">{stock}</span>;
  return <span className="font-bold text-[#c6c6c6]">{stock}</span>;
}
