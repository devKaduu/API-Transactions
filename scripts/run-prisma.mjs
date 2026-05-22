import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const schemaPath = path.join(root, "prisma/schema.prisma");

/** Aceita pg/postgres no Render; o Prisma só entende "postgresql" no schema. */
function normalizeProvider(value) {
  const raw = (value || "sqlite").toLowerCase().trim();
  if (raw === "pg" || raw === "postgres" || raw === "postgresql") {
    return "postgresql";
  }
  if (raw === "sqlite") {
    return "sqlite";
  }
  throw new Error(
    `DATABASE_PROVIDER inválido: "${value}". Use sqlite, pg ou postgresql.`,
  );
}

const provider = normalizeProvider(process.env.DATABASE_PROVIDER);

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Uso: node scripts/run-prisma.mjs <comando prisma...>");
  process.exit(1);
}

const originalSchema = fs.readFileSync(schemaPath, "utf8");

function setProvider(targetProvider) {
  const updated = originalSchema.replace(
    /provider\s*=\s*"(sqlite|postgresql)"/,
    `provider = "${targetProvider}"`,
  );
  fs.writeFileSync(schemaPath, updated);
}

function syncMigrations() {
  const migrationsDir = path.join(root, "prisma/migrations");
  const sourceDir =
    provider === "postgresql"
      ? path.join(root, "prisma/migrations-postgres")
      : path.join(root, "prisma/migrations-sqlite");

  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Pasta de migrations não encontrada: ${sourceDir}`);
  }

  fs.rmSync(migrationsDir, { recursive: true, force: true });
  fs.cpSync(sourceDir, migrationsDir, { recursive: true });
}

function restoreSchema() {
  fs.writeFileSync(schemaPath, originalSchema);
}

try {
  setProvider(provider);
  syncMigrations();

  console.log(`[prisma] provider=${provider}`);

  execSync(`npx prisma ${args.join(" ")}`, {
    stdio: "inherit",
    cwd: root,
    env: process.env,
  });
} finally {
  restoreSchema();
  const migrationsDir = path.join(root, "prisma/migrations");
  const sqliteDir = path.join(root, "prisma/migrations-sqlite");
  fs.rmSync(migrationsDir, { recursive: true, force: true });
  fs.cpSync(sqliteDir, migrationsDir, { recursive: true });
}
