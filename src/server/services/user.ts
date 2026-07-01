import { db } from "@/lib/db";

export async function ensureDevUser() {
  const id = process.env.DEV_USER_ID ?? "dev-user-local";
  const email = process.env.DEV_USER_EMAIL ?? "professor@localhost.dev";
  const name = process.env.DEV_USER_NAME ?? "Local Professor";

  return db.user.upsert({
    where: { id },
    update: { email, name },
    create: { id, email, name },
  });
}
