import hre from "hardhat";

async function main() {
  const USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Base Sepolia USDC
  const PLATFORM_WALLET = "0xA4f0000000000000000000000000000000dE91"; // Platform wallet

  const Escrow = await hre.ethers.getContractFactory("StableFlowEscrow");
  const escrow = await Escrow.deploy(USDC_ADDRESS, PLATFORM_WALLET);
  await escrow.waitForDeployment();

  const address = await escrow.getAddress();
  console.log("StableFlowEscrow deployed to:", address);

  // Wait for block confirmations
  const tx = escrow.deploymentTransaction();
  if (tx) {
    await tx.wait(3);
    console.log("Confirmed 3 blocks");
  }

  // Verify on Basescan (optional)
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [USDC_ADDRESS, PLATFORM_WALLET],
    });
    console.log("Contract verified on Basescan");
  } catch (e) {
    console.log("Verification failed (may already be verified):", e.message);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
