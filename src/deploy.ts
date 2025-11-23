import { Perpetual } from './Perpetual.js';
import { Mina, PrivateKey, AccountUpdate } from 'o1js';
// ZEKO Devnet GraphQL Endpoint
const ZEKO_GRAPHQL = 'https://devnet.zeko.io/graphql';
async function deploy() {
  console.log('Deploying to ZEKO Devnet...');
  const Network = Mina.Network(ZEKO_GRAPHQL);
  Mina.setActiveInstance(Network);
  // NOTE: In a real scenario, you would load this from an env variable
  // const deployerKey = PrivateKey.fromBase58('YOUR_PRIVATE_KEY');
  
  // For this script to work, the user needs to provide a private key.
  // We will check for an environment variable or throw an error.
  const deployerKeyStr = process.env.DEPLOYER_KEY;
  if (!deployerKeyStr) {
    console.error('Error: DEPLOYER_KEY environment variable not set.');
    console.error('Please set DEPLOYER_KEY to your funded private key.');
    process.exit(1);
  }
  const deployerKey = PrivateKey.fromBase58(deployerKeyStr);
  const deployerAccount = deployerKey.toPublicKey();
  console.log('Deployer Account:', deployerAccount.toBase58());
  // Compile the contract
  console.log('Compiling Perpetual contract...');
  await Perpetual.compile();
  // Generate a new key pair for the zkApp
  const zkAppKey = PrivateKey.random();
  const zkAppAddress = zkAppKey.toPublicKey();
  console.log('zkApp Address:', zkAppAddress.toBase58());
  const zkApp = new Perpetual(zkAppAddress);
  // Create deployment transaction
  console.log('Creating deployment transaction...');
  const tx = await Mina.transaction({ sender: deployerAccount, fee: 0.1e9 }, async () => {
    AccountUpdate.fundNewAccount(deployerAccount);
    await zkApp.deploy();
    await zkApp.init(); // Initialize state
  });
  await tx.prove();
  await tx.sign([deployerKey, zkAppKey]).send();
  console.log('Successfully deployed!');
  console.log('zkApp Address:', zkAppAddress.toBase58());
}
deploy().catch((err) => {
  console.error(err);
  process.exit(1);
});
