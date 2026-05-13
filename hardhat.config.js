import "dotenv/config";
import "@nomicfoundation/hardhat-node-test-runner";
import "@nomicfoundation/hardhat-ethers";

export default {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    baseSepolia: {
      type: "http",
      url: "https://sepolia.base.org",
      chainId: 84532,
    },
  },
  test: {
    type: "node",
  },
};
