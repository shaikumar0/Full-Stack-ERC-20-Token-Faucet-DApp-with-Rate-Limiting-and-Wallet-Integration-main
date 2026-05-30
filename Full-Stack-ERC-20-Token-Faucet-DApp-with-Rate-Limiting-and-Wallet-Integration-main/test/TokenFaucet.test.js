const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Token Faucet", function () {
  let token, faucet;
  let owner, user;

  beforeEach(async function () {
  [owner, user] = await ethers.getSigners();

  const Token = await ethers.getContractFactory("FaucetToken");
  token = await Token.deploy();
  await token.waitForDeployment();

  const Faucet = await ethers.getContractFactory("TokenFaucet");
  faucet = await Faucet.deploy(await token.getAddress());
  await faucet.waitForDeployment();

  // Tell token who the faucet is
  await token.setFaucet(await faucet.getAddress());
});


  it("should allow user to claim tokens", async function () {
    await faucet.connect(user).requestTokens();
    const balance = await token.balanceOf(user.address);
    expect(balance).to.equal(ethers.parseEther("100"));
  });

  it("should prevent claiming before cooldown", async function () {
    await faucet.connect(user).requestTokens();
    await expect(
      faucet.connect(user).requestTokens()
    ).to.be.revertedWith("Cooldown period not elapsed");
  });

  it("should enforce lifetime limit", async function () {
    for (let i = 0; i < 10; i++) {
      await faucet.connect(user).requestTokens();
      await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
      await ethers.provider.send("evm_mine");
    }

    // move time forward so cooldown is NOT the reason
    await ethers.provider.send("evm_increaseTime", [24 * 60 * 60]);
    await ethers.provider.send("evm_mine");

    await expect(
      faucet.connect(user).requestTokens()
    ).to.be.revertedWith("Lifetime claim limit reached");
  });


  it("should allow admin to pause faucet", async function () {
    await faucet.setPaused(true);
    await expect(
      faucet.connect(user).requestTokens()
    ).to.be.revertedWith("Faucet is paused");
  });
});
