const hre = require('hardhat');

// Returns the Ether balance of a given address
async function getBalance(address) {
  const balanceBigInt = await hre.ethers.provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt);
}

// Logs the Ether balances for a list of addresses
async function printBalances(addresses) {
  let idx = 0;
  for (const address of addresses) {
    console.log(`Address ${idx} balance: `, await getBalance(address));
    idx++;
  }
}

// Logs the memos stored on-chain from coffee purchases
async function printMemos(memos) {
  for (const memo of memos) {
    const { timestamp, name, from, message } = memo;
    console.log(`At ${timestamp}, ${name} (${from}) said: '${message}'`);
  }
}

async function main() {
  // Get sample accounts we'll be working with
  const [owner, tipper, tipper2, tipper3] = await hre.ethers.getSigners();

  // We get the contract to deploy
  const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee");
  const buyMeACoffee = await BuyMeACoffee.deploy();

  // Deploy the contract
  await buyMeACoffee.deployed();
  console.log('BuyMeACoffee deployed to:', buyMeACoffee.address);

  // Check balances before the coffee purchase
  const addresses = [owner.address, tipper.address, buyMeACoffee.address];
  console.log('== start ==');
  await printBalances(addresses);

  // Buy the owner a few coffees
  const tip = {value: hre.ethers.utils.parseEther('1')};
  await buyMeACoffee.connect(tipper).buyCoffee('Ashas', 'Because', tip);
  await buyMeACoffee.connect(tipper2).buyCoffee('Ole', 'I like tipping', tip);
  await buyMeACoffee.connect(tipper3).buyCoffee('Roeg', 'I also like tipping', tip);

  // Check balances after the coffee purchase
  console.log('== bought coffee ==');
  await printBalances(addresses);

  // Withdraw
  await buyMeACoffee.connect(owner).withdrawTips();

  // Check balances after withdrawal
  console.log('== withdrawed tips ==');
  await printBalances(addresses);

  // Check out the memos
  console.log('== memos ==');
  const memos = await buyMeACoffee.getMemos();
  printMemos(memos);
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.log(err);
    process.exit(1);
  });