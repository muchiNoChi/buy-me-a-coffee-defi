const hre = require('hardhat');
const abi = require('../artifacts/contracts/BuyMeACoffee.sol/BuyMeACoffee.json');

async function getBalance(provider, address) {
  const balanceBigInt = await provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt);
}

async function main() {
  // Get the contract that has been deployed to Sepolia
  const contractAddress = '0x49407BA992b20EdAEf140F30E8ab311F33d1faC6';
  const contractAbi = abi.abi;

  // Get the node connection and wallet connection
  const provider = new hre.ethers.providers.EtherscanProvider('sepolia', process.env.ETHERSCAN_API_KEY);

  // Ensure that signer is the SAME address as the original contract deployer,
  // or else this script will fail with an error
  const signer = new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // Instantiate connected contract
  const buyMeACoffee = new hre.ethers.Contract(contractAddress, contractAbi, signer);

  // Check starting balances
  console.log('current balance of owner: ', await getBalance(provider, signer.address), 'ETH');
  const contractBalance = await getBalance(provider, buyMeACoffee.address);
  console.log('current balance of contract: ', await getBalance(provider, buyMeACoffee.address), 'ETH');

  // Withdraw funds if there are funds to withdraw
  if (contractBalance !== '0.0') {
    console.log('withdrawing funds...');
    const withdrawTxn = await buyMeACoffee.withdrawTips();
    await withdrawTxn.wait();
  } else {
    console.log('no funds to withdraw.');
  }

  // Check ending balance
  console.log('current balance of owner: ', await getBalance(provider, signer.address), 'ETH');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });