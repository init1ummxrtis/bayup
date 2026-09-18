import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const games = await db.game.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ games });
}
