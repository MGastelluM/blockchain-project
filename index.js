import { Chain } from "./functions/src/blockchain-core/chain.js";
import { getGenesisBlock, getLastBlock, sendBlockToServer, sendChainToServer, sendTransactionToServer, getBlockById } from "./functions/src/blockchain-core/database_logic.js";
import { Wallet } from "./functions/src/blockchain-core/wallet.js";
import * as readline from 'readline';
import { startNode, askPeerWalletInfo, setOnNodeChargingCallback, sendMessage, sendTransaction, setHandleMessageCallback, setOnNodeConnectedCallback, setOnNodeDisconnectedCallback, getCurrentNodes } from './libp2p-conexion/streamer.js';
import { Peer } from "./libp2p-conexion/peer.js";


let thisWallet = new Wallet()

let peers = []


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
    await sender.sendMoney(50, recipient.publicKey);
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

export async function getBlockByIdFromDatabase(id) {
    const idblock = await getBlockById(id);
    console.log(`Block with id ${id} from database blockchain:`, idblock);
}



export const getFunctionsFromDataBase = async () => {
    await getGenesisBlockFromDatabase();
    await getLastBlockFromDatabase();
}

function formatAndSummarizePublicKey(publicKey) {
    const keyLines = publicKey.split('\n');
    const firstLine = keyLines[0]; // Include the first line "-----BEGIN PUBLIC KEY-----"
    const lastLine = keyLines[keyLines.length - 1]; // Include the last line "-----END PUBLIC KEY-----"
    const firstChars = firstLine.slice(0, 4);
    const lastChars = lastLine.slice(-4);
    return `${firstLine}\n  ${firstChars}...${lastChars}\n${lastLine}`;
}

function displayBlockParts(block) {
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
function clearConsole() {
    // Clear the console based on the operating system
    const isWindows = process.platform === "win32";
    if (isWindows) {
        // For Windows
        process.stdout.write("\x1Bc");
    } else {
        // For other operating systems
        console.clear();
    }
}

setHandleMessageCallback((message) => {
    console.log("Received message from libp2p:", message);
    renderMenu();
});

setOnNodeDisconnectedCallback(() => {
    console.log("A node has disconnected. Disabling the menu.");
});

setOnNodeChargingCallback((message) => {
    console.log("Received transaction:");
    console.log("the previous valance of this wallet was=", thisWallet.balance)
    thisWallet.receiveMoney(message)
    console.log("the new balance of this wallet is =", thisWallet.balance)
    renderWallet(thisWallet)
    renderMenu();
});

setOnNodeConnectedCallback((peerId) => {
    console.log("A node has Connected. .");

    if (peerId in peers.peerId) {
        return true
    }
    else {
        //const inc = await askPeerWalletInfo(peerId);
        const inc = { peerId: peerId, balance: 100, publicKey: thisWallet.publicKey }
        const newPeer = new Peer(inc.peerId, inc.balance, inc.publicKey)
        peers.push(newPeer)
        console.log("new peer added to known peers:" + newPeer.peerId)
    }

});

const renderWallet = (thisWallet) => {
    // Clear the terminal screen (if needed)
    console.log("Welcome!")
    console.log("\nWallet Information:");
    console.log("Current Money: ", thisWallet.balance);
};

const renderMenu = () => {
    // Clear the terminal screen

    console.log("\nMenu:");
    console.log("1. See last block from chain");
    console.log("2. See last block from the database");
    console.log("3. Get genesis block from database");
    console.log("4. Send a generic transaction");
    console.log("5. Get block by ID");
    console.log("6. Enviar mensaje a otros nodos (por defecto broadcast)");
    console.log("7. Enviar transacción a otro nodo(por defecto unico otro nodo o broacast):");

    console.log("8. REFRESH F5 (be understanding is terminal based)):");
    console.log("9. Exit");
    // Display received messages


};

const main = async () => {
    try {
        await Chain.instance.initializeChain();
        await sendChainToServer(Chain.instance.chain);
        console.log("Initialization complete, WAITING for enough nodes...");
        const response = await startNode()

        console.clear();
        renderMenu();
        while (true) {

            renderWallet(thisWallet)
            renderMenu();
            const choice = await getUserInput("Choose an option (1-9): ");

            switch (choice) {
                case '1':
                    // Action to see the last block from the chain
                    const lastBlockFromChain = Chain.instance.lastBlock;
                    console.log("Last block from chain:", lastBlockFromChain);
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
                    break;
                case '6':
                    const message = await getUserInput('Enter the message to send: ');
                    await sendMessage(message)
                    console.log('Message sent.');
                    break;
                case '7':
                    const currentnodes = await getCurrentNodes()
                    console.log("Choose a node number:" + JSON.stringify(currentnodes))
                    const userNodeInput = await getUserInput("Enter the node ID(thiscase_use \"1 or 2\"): ");
                    const userMoneyToSend = await getUserInput("Enter amount of money:")
                    const sended = await sendTransaction(userNodeInput, userMoneyToSend)
                    if (sended) {
                        console.log("Successfull Transacction")
                    }
                    break;
                case '8':
                    break;
                case '9':
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
async function getUserInput(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}
main();
