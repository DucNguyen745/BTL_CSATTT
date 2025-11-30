const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Dang dung tai khoan deploy:", deployer.address);

  // 1. Deploy Pool (Ngân hàng)
  const FlashLoanPool = await ethers.getContractFactory("FlashLoanPool");
  const pool = await FlashLoanPool.deploy();
  await pool.waitForDeployment(); // Syntax moi
  const poolAddress = await pool.getAddress();
  console.log("FlashLoanPool deployed to:", poolAddress);

  // Nạp 1000 ETH vào Pool (lấy từ ví deployer)
  await deployer.sendTransaction({
    to: poolAddress,
    value: ethers.parseEther("1000.0") // Syntax moi: khong co .utils
  });
  console.log("-> Da nap 1000 ETH vao Pool");

  // 2. Deploy Governance (Nạn nhân)
  const VulnerableGovernance = await ethers.getContractFactory("VulnerableGovernance");
  const governance = await VulnerableGovernance.deploy();
  await governance.waitForDeployment();
  const govAddress = await governance.getAddress();
  console.log("VulnerableGovernance deployed to:", govAddress);

  // --- THAY ĐỔI SỐ TIỀN MUỐN CƯỚP TẠI ĐÂY ---
  // Ví dụ: Tăng lên 100 ETH (Thay vì 50 ETH như cũ)
  await deployer.sendTransaction({
    to: govAddress,
    value: ethers.parseEther("100.0") 
  });
  console.log("-> Da nap 100 ETH vao Governance (So tien nay se bi cuop)");

  // 3. Deploy Hacker
  // Lưu ý: Constructor của Hacker nhận vào 2 địa chỉ
  const FlashLoanAttack = await ethers.getContractFactory("FlashLoanAttack");
  const attack = await FlashLoanAttack.deploy(poolAddress, govAddress);
  await attack.waitForDeployment();
  const attackAddress = await attack.getAddress();
  console.log("FlashLoanAttack deployed to:", attackAddress);

  console.log("--- Deployment Complete ---");
  console.log("Hay copy 3 dia chi tren vao file HTML!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });