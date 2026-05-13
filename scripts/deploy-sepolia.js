import hre from "hardhat";

const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const PLATFORM_WALLET = process.env.PLATFORM_WALLET || "0x0000000000000000000000000000000000000000";

async function main() {
  const conn = await hre.network.connect();
  const provider = conn.provider;
  const ethersProvider = new (await import("ethers")).BrowserProvider(provider);
  const deployer = await ethersProvider.getSigner(0);

  console.log("Deploying with:", deployer.address);

  // Deploy StableFlowEscrow
  const artifact = await hre.artifacts.readArtifact("StableFlowEscrow");
  const factory = new (await import("ethers")).ContractFactory(artifact.abi, artifact.bytecode, deployer);
  const escrow = await factory.deploy(USDC_ADDRESS, PLATFORM_WALLET);
  await escrow.waitForDeployment();
  const address = await escrow.getAddress();

  console.log("\n✅ StableFlowEscrow deployed to:", address);
  console.log("\nTo verify on Etherscan:");
  console.log(`npx hardhat verify --network baseSepolia ${address} "${USDC_ADDRESS}" "${PLATFORM_WALLET}"`);
  console.log("\nUpdate your .env.local:");
  console.log(`NEXT_PUBLIC_ESCROW_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
