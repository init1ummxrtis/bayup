import { db } from "@/lib/db";
import { Link } from "@/i18n/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default async function AdminGamesPage() {
  const games = await db.game.findMany({
    include: { _count: { select: { products: true, categories: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-text">Games</h1>
        <ButtonLink href="/admin/games/new">New game</ButtonLink>
      </div>

      {games.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-text-muted">
          No games yet.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/admin/games/${game.id}/edit`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-border-strong"
            >
              <div>
                <p className="font-medium text-text">{game.name}</p>
                <p className="mt-1 text-xs text-text-subtle">
                  /{game.slug} · {game._count.categories} categories · {game._count.products} products
                </p>
              </div>
              <span
                className={cn(
                  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
                  game.isActive
                    ? "border-accent/30 bg-accent-soft text-accent"
                    : "border-border bg-border/30 text-text-muted"
                )}
              >
                {game.isActive ? "Active" : "Inactive"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
