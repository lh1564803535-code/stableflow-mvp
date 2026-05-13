import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const artifactPath = path.join(__dirname, "../artifacts/contracts/StableFlowEscrow.sol/StableFlowEscrow.json");
const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

const output = {
  address: "DEPLOYED_CONTRACT_ADDRESS", // Fill in after deployment
  abi: artifact.abi,
};

const outDir = path.join(__dirname, "../src");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, "contract-config.json"),
  JSON.stringify(output, null, 2)
);

console.log("ABI exported to src/contract-config.json");
