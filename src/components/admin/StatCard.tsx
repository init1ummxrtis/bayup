export function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-muted">{label}</span>
        <span className="text-text-subtle">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-text">{value}</p>
    </div>
  );
}
