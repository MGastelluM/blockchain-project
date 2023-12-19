import { createLibp2p } from "libp2p";
import { WebSockets } from "@libp2p/websockets";
import { Noise } from "@chainsafe/libp2p-noise";
import { Mplex } from "@libp2p/mplex";
import { multiaddr } from "multiaddr";
import { Bootstrap } from "@libp2p/bootstrap";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import {
	createEd25519PeerId,
	exportToProtobuf,
	createFromProtobuf,
} from "@libp2p/peer-id-factory";
import * as lp from "it-length-prefixed";
import map from "it-map";
import { pipe } from "it-pipe";
import fs from "fs";
import _ from "lodash";
import crypto from "crypto";
import { Wallet } from "../functions/src/blockchain-core/wallet.js";
import { getWalletById, sendWalletDataToServer } from "../functions/src/blockchain-core/database_logic.js";

// Configure test from here
const time = 120; // Test time in seconds
const show = false; // show messages in console or not
const throttle = 10; // How many ms it will wait between one message and another
const protocol = "/echo/1.0.0"; // Protocol name
const size = 2048; // Size of exchanged random buffer

// Node variables
let node;
const bootstrapers = returnBootstrappers();
let relayed = [];
let received = [];

// Useful variables for testing
let started = false;
let starting = false;

let handleMessageCallback;

const MIN_NODES_REQUIRED = 1;
let connectedNodes = 0;
let onNodesConnectedCallback = null;
let onNodeDisconnectedCallback = null;


export function setHandleMessageCallback(callback) {
	handleMessageCallback = callback;
}

export function setOnNodesConnectedCallback(callback) {
	onNodesConnectedCallback = callback;
}

export function setOnNodeConnectedCallback(callback) {
	onNodesConnectedCallback = callback;
}

export function setOnNodeDisconnectedCallback(callback) {
	onNodeDisconnectedCallback = callback;
}
let handleChargingCallback;
export function setOnNodeChargingCallback(callback) {
	handleChargingCallback = callback;
	console.log("Callback set:", callback);
}

function handleStream(stream) {
	try {
		pipe(
			stream.source,
			lp.decode(),
			(source) => map(source, (buf) => uint8ArrayToString(buf.subarray())),
			async function (source) {
				for await (const msg of source) {
					if (received.indexOf(msg.toString()) === -1) {
						received.push(msg.toString());
						if (show) {
							console.log(`> ${msg.toString().replace("\n", "")} > from: ${source}`);
						}
						if (relayed.indexOf(msg.toString()) === -1) {
							relayed.push(msg.toString());
							if (handleChargingCallback) {
								const amount = await handleTransaction(msg.toString())
								handleChargingCallback(amount.toString())
								console.log("was a transaction")
								break;
							}
							if (msg.includes('[WalletInfoRequesting]')) {
								console.log("was a wallet request")
								const info = await
									sendMessage('[WalletInfoRequested],')
								break;
							}
							if (handleMessageCallback) {
								console.log("was a message")
								handleMessageCallback(msg.toString());
							}
							await relayMessage(msg);
							break;
						}
					}
				}
			}
		);
	} catch (e) {
		console.log(e.message);
	}
}


async function handleTransaction(message) {
	const isTransaction = message.includes("[Transaction]");
	console.log("the message was==" + message + " and transacion is true=" + message.includes("[Transaction]"))
	if (!isTransaction) { return false }
	if (isTransaction) {
		// Extract relevant information from the transaction message
		const [, destinyNode, amount] = /To: (.+), Amount: (.+)/.exec(message) || [];

		// Process the transaction as needed
		console.log("Received Transaction:");
		console.log("Destiny Node:", destinyNode);
		console.log("Amount:", amount);

		return (amount)
	}
}


export async function sendTransaction(destinyNode, amount) {
	/*const wallet = await getWalletById(`${destinyNode}`);
	if (!wallet) {
		console.log('Wallet not found');
		return false;
	}
	const initialValue = wallet.balance;*/
	const transactionMessage = `[Transaction] To: ${destinyNode}, Amount: ${amount}`;
	const response = await sendMessage(transactionMessage);
	if (response) {
		console.log(`Transaction sent successfully: ${transactionMessage}`);
	}
	return true
}

export async function askPeerWalletInfo(peerId) {
	try {
		//const stream = await dialPeer(peerId); // Implement dialPeer function accordingly
		const walletInfoRequestMsg = '[WalletInfoRequest]'; // This is the message to request wallet information
		const responde = await sendMessage(walletInfoRequestMsg)
		//await stream.write(uint8ArrayFromString(walletInfoRequestMsg));
	} catch (error) {
		console.error(`Failed to ask for wallet info from peer ${peerId}: ${error.message}`);
	}
}


async function relayMessage(message) {
	return new Promise(async (response) => {
		let success = true;
		const active = returnBootstrappers();
		for (let k in active) {
			try {
				const ma = multiaddr(active[k]);
				const stream = await node.dialProtocol(ma, protocol);
				pipe(
					[uint8ArrayFromString(message)],
					(source) => map(source, (string) => uint8ArrayFromString(string)),
					lp.encode(),
					stream.sink
				);
				setTimeout(async function () {
					try {
						await stream.abort();
					} catch (e) {
						console.log("Can't reset stream..");
					}
				}, throttle / 3);
			} catch (e) {
				// Uncomment next line to see why stream failed
				if (show == "2") {
					console.log("[STREAM FAILED]", e.message);
				}
				await node.hangUp(multiaddr(active[k]));
				success = false;
			}
		}
		setTimeout(function () {
			response(success);
		}, throttle / 2);
	});
}

function startStreaming() {
	const bytes = _.random(size, size, 0);
	crypto.randomBytes(bytes, async (err, buffer) => {
		if (err) {
			// Prints error
			console.log(err);
			return;
		}
		const message =
			"[" +
			new Date().getTime() +
			"] [" +
			process.argv[2] +
			"] " +
			"holaaa nodo";
		let sending = true;
		while (sending) {
			let response = await relayMessage(message);
			if (response) {
				exchanged += bytes;
				successful++;
				sending = false;
				setTimeout(function () {
					startStreaming();
				}, throttle);
			}
		}
	});
}

function extractTransactionDetails(transactionMsg) {
	const match = transactionMsg.match(/\[Transaction\] To: (.+), Amount: (.+), Initial Value: (.+)/);
	if (match) {
		const [, destinyNode, amount, initialValue] = match;
		return { destinyNode, amount, initialValue };
	}
	return { destinyNode: null, amount: null, initialValue: null };
}


function returnBootstrappers() {
	const bootstrapers = [];
	const nodes = fs.readdirSync("./nodes");
	for (let k in nodes) {
		if (nodes[k] !== ".NODES_WILL_APPEAR_HERE") {
			const addresses = fs
				.readFileSync("./nodes/" + nodes[k])
				.toString()
				.split("\n");
			for (let j in addresses) {
				if (
					addresses[j].length > 0 &&
					nodes[k] !== process.argv[2] &&
					addresses[j].indexOf("/ip4/") !== -1
				) {
					// console.log('Found address:', addresses[j])
					bootstrapers.push(addresses[j]);
				}
			}
		}
	}
	return bootstrapers;
}
export async function sendMessage(str) {
	const bytes = _.random(size, size, 0);
	const message =
		"[" + new Date().getTime() + "] [" + process.argv[2] + "] " + str;

	// Send a single message
	let response = await relayMessage(message);
	if (response) {
		console.log(`Message sent successfully: ${message}`);
	}
}
export async function startNode() {
	if (!starting && !started) {
		starting = true;
		// Creating node
		let peerId;
		if (fs.existsSync("./nodes/" + process.argv[2] + "_id")) {
			const protobuf = fs
				.readFileSync("./nodes/" + process.argv[2] + "_id")
				.toString();
			peerId = await createFromProtobuf(Buffer.from(protobuf, "hex"));
		} else {
			peerId = await createEd25519PeerId();
			fs.writeFileSync(
				"./nodes/" + process.argv[2] + "_id",
				exportToProtobuf(peerId).toString("hex")
			);
		}

		//create wallet for the node if its not exist in database
		let walletIdInDatabase = await getWalletById(peerId);
		if (walletIdInDatabase === null) {
			console.log('walletIdInDatabase:', walletIdInDatabase);
			const nodeWallet = new Wallet()
			walletIdInDatabase = peerId;
			await sendWalletDataToServer(walletIdInDatabase, { publicKey: nodeWallet.publicKey, privateKey: nodeWallet.privateKey, balance: nodeWallet.balance });
			const walletId = await getWalletById(walletIdInDatabase);
			console.log('walletId:', walletId);
		}

		try {
			const port = "700" + parseInt(process.argv[2]);
			node = await createLibp2p({
				peerId: peerId,
				addresses: {
					listen: ["/ip4/127.0.0.1/tcp/" + port + "/ws"],
				},
				transports: [new WebSockets()],
				connectionEncryption: [new Noise()],
				streamMuxers: [new Mplex()],
				connectionManager: {
					autoDial: true,
				},
				peerDiscovery: [
					new Bootstrap({
						interval: 10e3,
						list: bootstrapers,
					}),
				],
			});

			// start libp2p
			await node.start();
			console.log("libp2p has started");

			node.connectionManager.addEventListener(
				"peer:connect",
				async (connection) => {
					connectedNodes++;
					if (
						connectedNodes >= MIN_NODES_REQUIRED &&
						onNodesConnectedCallback
					) {
						onNodesConnectedCallback();
						onNodesConnectedCallback(connection.detail.remotePeer)
					}
					if (show) {
						console.log("--");
						console.log("Connected to %s", connection.detail.remotePeer); // Log connected peer
					}
				}
			);

			node.connectionManager.addEventListener(
				"peer:disconnect",
				(connection) => {
					connectedNodes--;
					console.log(
						"A node has been disconnected from %s",
						connection.detail.remotePeer
					);
					if (
						connectedNodes < MIN_NODES_REQUIRED &&
						onNodeDisconnectedCallback
					) {
						console.log("NOT ENOUGH NODES - Waiting for connections...");
						onNodeDisconnectedCallback();
					}
				}
			);
			// print out listening addresses
			console.log("listening on addresses:");
			fs.writeFileSync("nodes/" + process.argv[2], "");
			let addresslist = "";
			node.getMultiaddrs().forEach((addr) => {
				console.log(addr.toString());
				addresslist += addr.toString() + "\n";
				fs.writeFileSync("nodes/" + process.argv[2], addresslist);
			});

			// Handle incoming stream
			await node.handle(protocol, async ({ stream }) => handleStream(stream), {
				maxInboundStreams: 500000,
				maxOutboundStreams: 500000,
			});

			started = true;
			starting = false;
		} catch (e) {
			started = false;
			console.log("--");
			console.log(e.message);
			console.log("--");
		}
	}
	return new Promise((resolve) => {
		setOnNodesConnectedCallback(() => {
			console.log(
				`Connected to ${MIN_NODES_REQUIRED} nodes. Starting the menu.`
			);
			resolve();
		});
	});

}

export async function getCurrentNodes() {
	if (started) {
		return bootstrapers;
	} else {
		throw new Error("Node is not started yet");
	}
}
/*
setTimeout(function () {
	startNode();
}, Math.floor(Math.random() * 1000));
*/
