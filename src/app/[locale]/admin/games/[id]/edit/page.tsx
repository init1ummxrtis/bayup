import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { GameForm } from "@/components/admin/GameForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGamePage({ params }: PageProps) {
  const { id } = await params;
  const game = await db.game.findUnique({
    where: { id },
    include: { categories: { orderBy: { sortOrder: "asc" } } },
  });
  if (!game) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-text">Edit game</h1>
      <GameForm
        game={{
          id: game.id,
          name: game.name,
          slug: game.slug,
          description: game.description,
          bannerUrl: game.bannerUrl,
          iconUrl: game.iconUrl,
          sortOrder: game.sortOrder,
          isActive: game.isActive,
          categories: game.categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
        }}
      />
    </div>
  );
}
