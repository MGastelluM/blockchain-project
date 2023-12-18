import * as crypto from "crypto";
export class Block {
    index;
    prevHash;
    transaction;
    ts;
    nonce;
    hash;
    constructor(index, prevHash, transaction, ts = Date.now()) {
        this.index = index;
        this.prevHash = prevHash;
        this.transaction = transaction;
        this.ts = ts;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }
    calculateHash() {
        const str = JSON.stringify(this);
        const hash = crypto.createHash("SHA256");
        hash.update(str).end();
        return hash.digest("hex");
    }
    mine(difficulty) {
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
                console.log(`🏁---> Solved transaction with difficulty: ${difficulty} ,solution: ${solution}. Block confirmed!\n`);
                return true;
            }
            solution++;
        }
    }
}
