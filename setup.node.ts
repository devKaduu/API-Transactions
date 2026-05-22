import { execSync } from "child_process";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, ".env.test") });
console.log("✅ Ambiente de testes carregado");

try {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
  console.log("✅ Migrations aplicadas com sucesso");
} catch (err) {
  console.error("❌ Erro ao aplicar migrations:", err);
  process.exit(1);
}
