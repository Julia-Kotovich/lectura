import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Seed complete — no lecture templates configured.");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
