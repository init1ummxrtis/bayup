import { Link } from "@/i18n/navigation";
import { gameGradient } from "@/lib/gameTheme";
import { ArrowUpRight } from "lucide-react";

interface GameCardProps {
  slug: string;
  name: string;
  description: string;
}

export function GameCard({ slug, name, description }: GameCardProps) {
  return (
    <Link
      href={`/browse/${slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:border-border-strong hover:-translate-y-0.5"
    >
      <div
        className="relative h-36 w-full"
        style={{ backgroundImage: gameGradient(slug) }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
        <ArrowUpRight
          size={18}
          className="absolute right-3 top-3 text-white/70 opacity-0 transition-opacity group-hover:opacity-100"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-semibold text-text">{name}</h3>
        <p className="text-sm text-text-muted">{description}</p>
      </div>
    </Link>
  );
}
