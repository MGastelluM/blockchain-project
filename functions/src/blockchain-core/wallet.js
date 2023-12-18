import * as crypto from "crypto";
import { Transaction } from "./transaction.js";
import { Chain } from "./chain.js";
export class Wallet {
    publicKey;
    privateKey;
    money;
    // Generate key pair when a new wallet is created
    constructor() {
        const keypair = crypto.generateKeyPairSync("rsa", {
            modulusLength: 2048,
            publicKeyEncoding: { type: "spki", format: "pem" },
            privateKeyEncoding: { type: "pkcs8", format: "pem" },
        });
        this.privateKey = keypair.privateKey;
        this.publicKey = keypair.publicKey;
        this.money = 100 //hardcoded initial money
    }
    // Send money from users wallet to another
    async sendMoney(amount, payeePublicKey) {
        const transaction = new Transaction(amount, this.publicKey, payeePublicKey);
        const sign = crypto.createSign("SHA256");
        sign.update(transaction.toString()).end();
        const signature = sign.sign(this.privateKey);
        await Chain.instance.addBlock(transaction, this.publicKey, signature);
    }
}
