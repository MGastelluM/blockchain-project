import * as crypto from "crypto";
import { Transaction } from "./transaction.js";
import { Chain } from "./chain.js";
export class Wallet {
    publicKey;
    privateKey;
    balance;
    constructor() {
        const keypair = crypto.generateKeyPairSync("rsa", {
            modulusLength: 2048,
            publicKeyEncoding: { type: "spki", format: "pem" },
            privateKeyEncoding: { type: "pkcs8", format: "pem" },
        });
        this.privateKey = keypair.privateKey;
        this.publicKey = keypair.publicKey;
        this.balance = 100 //hardcoded initial money
    }
    async sendMoney(amount, payeePublicKey) {
        const transaction = new Transaction(amount, this.publicKey, payeePublicKey);
        const sign = crypto.createSign("SHA256");
        sign.update(transaction.toString()).end();
        const signature = sign.sign(this.privateKey);
        await Chain.instance.addBlock(transaction, this.publicKey, signature);
    }

    async receiveMoney(amount) {
        return new Promise((resolve, reject) => {
            this.balance = parseInt(this.balance) + parseInt(amount);
            resolve();
        });
    }
}
