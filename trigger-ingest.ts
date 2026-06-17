import "dotenv/config";
process.env.IS_SCRIPT = "true";
import { runIngestion } from "./src/services/ingestRunner";

async function main() {
  console.log("Starting manual ingestion with environment variables loaded...");
  const report = await runIngestion();
  console.log("Ingestion Report:", JSON.stringify(report, null, 2));
}

main();
