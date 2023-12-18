export class Transaction {
    amount;
    payer;
    payee;
    constructor(amount, payer, payee) {
        this.amount = amount;
        this.payer = payer;
        this.payee = payee;
    }
    // Serialise transaction as a string
    toString() {
        return JSON.stringify(this);
    }
}
