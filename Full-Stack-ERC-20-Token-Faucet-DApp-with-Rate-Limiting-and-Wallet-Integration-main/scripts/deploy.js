const hre = require("hardhat");

async function main() {
  const Token = await hre.ethers.getContractFactory("FaucetToken");
  const token = await Token.deploy();
  await token.waitForDeployment();

  const Faucet = await hre.ethers.getContractFactory("TokenFaucet");
  const faucet = await Faucet.deploy(await token.getAddress());
  await faucet.waitForDeployment();

  await token.setFaucet(await faucet.getAddress());

  console.log("Token deployed to:", await token.getAddress());
  console.log("Faucet deployed to:", await faucet.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
