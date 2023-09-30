import * as crypto from "crypto";
import { Block } from "./block";
import { Transaction } from "./transaction";

require('dotenv').config()
const par:any = process.env.DIFFICULTY
const DIFFICULTY:number =parseInt(par)

export class Chain {
  public static instance = new Chain();
  chain: Block[];
  constructor() {
    this.chain = [new Block(42,"", new Transaction(100, "genesis", "Satoshi"))];
  }

  get lastBlock() {
    return this.chain[this.chain.length - 1];
  }

  getBlock(indexOrHash: number | string): Block | null {
    if (typeof indexOrHash === "number") {
      if (indexOrHash >= 0 && indexOrHash < this.chain.length) {
        return this.chain[indexOrHash];
      }
    } else if (typeof indexOrHash === "string") {
      for (const block of this.chain) {
        if (block.hash === indexOrHash) {
          return block;
        }
      }
    }
    return null;
  }
  
addBlock(
  transaction: Transaction,
  senderPublicKey: string,
  signature: Buffer
) {
  console.log("From<Chain> : 💰  New transaction! - awaiting verification...");
  const verifier = crypto.createVerify("SHA256");
  verifier.update(transaction.toString());

  const isValid = verifier.verify(senderPublicKey, signature);

  if (isValid) {
    console.log("From<Chain>: 🧾 Sender transaction valid!");
    const newBlock = new Block(this.chain.length+1,
      this.lastBlock.hash, 
      transaction,         
      Date.now()        
    );
  
    
    if(newBlock.mine(DIFFICULTY))
    {
      this.chain.push(newBlock);
      console.log("From<Chain>: 🧾 newBlockPushedToChain succesfully!");
    }
  }
}

}
