import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.$queryRaw`SELECT 1`;
  console.log("Database connectivity smoke check passed.");
}

main()
  .catch((error: unknown) => {
    console.error("Database connectivity smoke check failed.");
    console.error(error instanceof Error ? error.message : "Unknown error");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
