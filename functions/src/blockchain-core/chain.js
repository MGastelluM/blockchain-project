import * as crypto from "crypto";
import { Block } from "./block.js";
import { Transaction } from "./transaction.js";
import { getBlockchain } from "./database_logic.js";
const DIFFICULTY = 4;
export class Chain {
    static instance = new Chain();
    chain = [];
    constructor() {
    }
    get lastBlock() {
        return this.chain[this.chain.length - 1];
    }
    getBlock(indexOrHash) {
        if (typeof indexOrHash === "number") {
            if (indexOrHash >= 0 && indexOrHash < this.chain.length) {
                return this.chain[indexOrHash];
            }
        }
        else if (typeof indexOrHash === "string") {
            for (const block of this.chain) {
                if (block.hash === indexOrHash) {
                    return block;
                }
            }
        }
        return null;
    }
    async addBlock(transaction, senderPublicKey, signature) {
        console.log("From<Chain> : 💰  New transaction! - awaiting verification...");
        const verifier = crypto.createVerify("SHA256");
        verifier.update(transaction.toString());
        const isValid = verifier.verify(senderPublicKey, signature);
        if (isValid) {
            console.log("From<Chain>: 🧾 Sender transaction valid!");
            const newBlock = new Block(this.chain.length + 1, this.lastBlock.hash, transaction, Date.now());
            if (newBlock.mine(DIFFICULTY)) {
                this.chain.push(newBlock);
                console.log("From<Chain>: 🧾 newBlockPushedToChain succesfully!");
            }
        }
    }
    async initializeChain() {
        console.log("From<Chain>: 🧾 Initializing chain...");
        //check chain on database
        //if chain is empty, initialize with genesis block
        //else, initialize with the chain in the database
        const blockchain = await getBlockchain();
        if (blockchain === null) {
            console.log("From<Chain>: 🧾 Initializing with genesis block...");
            this.chain = [new Block(1, "", new Transaction(100, "genesis", "Satoshi"))];
            return 1;
        }
        console.log("From<Chain>: 🧾 Initializing with chain from database...");
        this.chain = blockchain;
        console.log("actual chain is", this.chain);
    }
}
