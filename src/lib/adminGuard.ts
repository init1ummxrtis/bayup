import { auth } from "@/lib/auth";

export class AdminGuardError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Throws AdminGuardError if the current request isn't from a logged-in ADMIN. Use in every /api/admin/* route. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new AdminGuardError("Unauthorized", 401);
  if (session.user.role !== "ADMIN") throw new AdminGuardError("Forbidden", 403);
  return session;
}
