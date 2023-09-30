import * as crypto from "crypto";
import { Transaction } from "./transaction";

require('dotenv').config()
const transactionNumber:any=process.env.TRANSACTION_NUMBERS

export class Block {
  public nonce: number; 
  public hash: string; 

  constructor(
    public index: number,
    public prevHash: string,
    public transaction: Transaction,
    //public transaction: Transaction[]<Transaction,transactionNumber>,
    public ts = Date.now()
  ) 
  {
    this.nonce = 0; 
    this.hash = this.calculateHash(); 
  }

  calculateHash() {
    const str = JSON.stringify(this);
    const hash = crypto.createHash("SHA256");
    hash.update(str).end();
    return hash.digest("hex");
  }

  mine(difficulty: number) {
    console.log("From<Block>: 🛠 Mining process...!");
    let solution = 1;
    while (true) {
      this.nonce++;
      const currentHash = this.calculateHash();
      const prefix = currentHash.substring(0, difficulty); 
      const targetPrefix = "0".repeat(difficulty);

      if (prefix === targetPrefix) {
        this.hash = currentHash; 
        console.log(`From<Block>: 🛠 Block mined!: ${this.hash}`);
        console.log(
          `🏁---> Solved transaction with difficulty: ${difficulty} ,solution: ${solution}. Block confirmed!\n`
        );
        return true
      }
      solution++;
    }
  }


}
