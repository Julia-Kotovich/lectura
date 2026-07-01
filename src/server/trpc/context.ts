import { db } from "@/lib/db";
import { auth } from "@/auth";
import { ensureDevUser } from "../services/user";

export async function createContext() {
  const authDisabled = process.env.AUTH_DISABLED === "true";

  if (authDisabled) {
    const user = await ensureDevUser();
    return { db, user, session: null };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { db, user: null, session: null };
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  return { db, user, session };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
