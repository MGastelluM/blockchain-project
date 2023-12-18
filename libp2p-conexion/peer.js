import { Wallet } from "../functions/src/blockchain-core/wallet.js"

export class Peer {
    constructor(peerId, balance, publickey) {
        this.publickey = publickey
        this.balance = balance
        this.peerId = peerId
    }

    async updatePeerId(peerId) {
        this.peerId = await peerId
    }

    getPeerId() {
        return this.peerId;
    }

    // Other useful methods can be added based on your requirements
}

