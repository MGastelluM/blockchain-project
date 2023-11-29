import { Block } from "./functions/src/blockchain-core/block";
import { Chain } from "./functions/src/blockchain-core/chain";
import { getGenesisBlock, getLastBlock, sendBlockToServer, sendChainToServer, sendTransactionToServer ,getBlockById} from "./functions/src/blockchain-core/database_logic";
import { Wallet } from "./functions/src/blockchain-core/wallet";




export const initializeGenesisBlock = async () => {
    console.log("Initializing genesis block OR retrieve of the last block from chaindb");
    
    
    try {
        
        const primaryBlock = Chain.instance.lastBlock;
        console.log(primaryBlock)
        await sendBlockToServer(primaryBlock);
        
        await sendTransactionToServer(Chain.instance.lastBlock.transaction);
        
        await sendChainToServer(Chain.instance.chain);
        
        console.log("Initialization complete");
    } catch (error) {
        console.error("Initialization error:", error);
    }
}


export const setSecondaryBlockInitialize = async () => {
    console.log("Initializing secondary block...");
    const sender = new Wallet();
    const recipient = new Wallet();
    await sender.sendMoney(50, recipient .publicKey);
    await sendChainToServer(Chain.instance.chain);
}

export const sendGenericTransaction = async () => {
    console.log("Sending a generic transaction...");
  
    // Generate random values for the transaction
    const amount = Math.floor(Math.random() * 100); // Random amount (0 to 99)
    const sender = new Wallet();
    const recipient = new Wallet();
  
    // Send the random transaction
    await sender.sendMoney(amount, recipient.publicKey);
  

    await sendChainToServer(Chain.instance.chain);
  
    console.log("Generic transaction sent successfully!");
  };

  
export async function getGenesisBlockFromDatabase() {
    const genesisBlock = await getGenesisBlock();
    console.log("Get genesis block from database:", genesisBlock);
}

export async function getLastBlockFromDatabase() {
    const lastBlock = await getLastBlock();
    console.log("Get last block from database blockchain:", lastBlock);
}

export async function getBlockByIdFromDatabase(id : string) {
  const idblock = await getBlockById(id);
  console.log(`Block with id ${id} from database blockchain:`, idblock);
}



export const getFunctionsFromDataBase = async () => {
    await getGenesisBlockFromDatabase();
    await getLastBlockFromDatabase();
}

function formatAndSummarizePublicKey(publicKey: string) {
    const keyLines = publicKey.split('\n');
    const firstLine = keyLines[0]; // Include the first line "-----BEGIN PUBLIC KEY-----"
    const lastLine = keyLines[keyLines.length - 1]; // Include the last line "-----END PUBLIC KEY-----"
    const firstChars = firstLine.slice(0, 4);
    const lastChars = lastLine.slice(-4);
    return `${firstLine}\n  ${firstChars}...${lastChars}\n${lastLine}`;
  }
  
function displayBlockParts(block:Block) {
console.log("Block Details:");
console.log(`Index: ${block.index}`);
console.log(`Previous Hash: ${block.prevHash}`);
console.log("Transaction:");
console.log(`  Amount: ${block.transaction.amount}`);
console.log(`  Payer: ${formatAndSummarizePublicKey(block.transaction.payer)}`);
console.log(`  Payee: ${formatAndSummarizePublicKey(block.transaction.payee)}`);
console.log(`Timestamp: ${block.ts}`);
console.log(`Nonce: ${block.nonce}`);
console.log(`Hash: ${block.hash}`);
}

const main = async () => {
    try {
      await Chain.instance.initializeChain();
      await sendChainToServer(Chain.instance.chain);
      console.log("Initialization complete");
  
      while (true) {
        console.log("\nMenu:");
        console.log("1. See last block from chain");
        console.log("2. See last block from the database");
        console.log("3. Get genesis block from database");
        console.log("4. Send a generic transaction");
        console.log("5. Get block by ID");
        console.log("6. <test> ");
        console.log("7. Exit");
  
        const choice = await getUserInput("Choose an option (1-7): ");
  
        switch (choice) {
          case '1':
            // Action to see the last block from the chain
            const lastBlockFromChain = Chain.instance.lastBlock;
            console.log("Last block from chain:",lastBlockFromChain);
            //console.log("Last block from chain:");
            //displayBlockParts(lastBlockFromChain)
            break;
          case '2':
            await getLastBlockFromDatabase()
            break;
          case '3':
            await getGenesisBlockFromDatabase()
            break;
          case '4':
            await sendGenericTransaction(); // Use 'await' here
            console.log("Generic transaction completed.");
            break;
            case '5':
              const userInput = await getUserInput("Enter the block ID: ");
              const blockId = String(userInput); // Ensure blockId is a string
              await getBlockByIdFromDatabase(blockId);
          case '6':
            console.log("test.");
            break;
          case '7':
            console.log("Exiting the menu.");
            process.exit(0);
          default:
            console.log("Invalid choice. Please select an option from 1 to 5.");
        }
      }
    } catch (error) {
      console.error("Initialization error:", error);
    }
  };
  
  async function getUserInput(question:any) {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  
    return new Promise((resolve) => {
      readline.question(question, (answer:any) => {
        readline.close();
        resolve(answer);
      });
    });
  }
  
  main();
  