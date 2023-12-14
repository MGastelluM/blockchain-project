const express = require("express");
const app = express();
const { Level } = require("level");

const db = new Level("dataBase", { valueEncoding: "json" });

app.use(express.json());

app.post("/storeData", async (req, res) => {
	try {
		const { key, data } = req.body;

		// Almacena los datos en la base de datos LevelDB
		await db.put(key, data);
		console.log("Data stored successfully", data);
		res.status(200).json({ message: "Data stored successfully" });
	} catch (error) {
		console.error("Error storing data:", error);
		res.status(500).json({ error: "Error storing data" });
	}
});

// Route to fetch the genesis block
app.get("/getGenesisBlock", async (req, res) => {
	try {
		const blocks = await db.get("chain");
		const genesisBlockKey = Object.keys(blocks)[0];
		const genesisBlockValue = blocks[genesisBlockKey];
		console.log("Genesis block fetched successfully", genesisBlockValue);
		res.status(200).json(genesisBlockValue);
	} catch (error) {
		if (error.notFound) {
			res.status(404).json({ error: "Genesis block not found" });
		} else {
			console.error("Error fetching genesis block:", error);
			res.status(500).json({ error: "Error fetching genesis block" });
		}
	}
});

app.get("/getBlockChain", async (req, res) => {
	try {
		const blocks = await db.get("chain");
		console.log("BlockChain fetched successfully", blocks);
		res.status(200).json(blocks);
	} catch (error) {
		if (error.notFound) {
			res.status(404).json({ error: "Genesis block not found" });
		} else {
			console.error("Error fetching genesis block:", error);
			res.status(500).json({ error: "Error fetching genesis block" });
		}
	}
});

app.get("/getLastBlock", async (req, res) => {
	try {
		const blocks = await db.get("chain");
		const keys = Object.keys(blocks);
		const lastBlockKey = keys[keys.length - 1];
		const lastBlockValue = blocks[lastBlockKey];
		console.log("Last block fetched successfully", lastBlockValue);
		res.status(200).json(lastBlockValue);
	} catch (error) {
		if (error.notFound) {
			res.status(404).json({ error: "Genesis block not found" });
		} else {
			console.error("Error fetching genesis block:", error);
			res.status(500).json({ error: "Error fetching genesis block" });
		}
	}
});

app.get("/getBlockById/:blockId", async (req, res) => {
	try {
		const blockId = parseInt(req.params.blockId, 10);

		// Retrieve the block with the specified ID from the database
		const blocks = await db.get("chain");
		const idBlock = blocks[blockId - 1];
		console.log("Last block fetched successfully", idBlock);

		res.status(200).json(idBlock);
	} catch (error) {
		console.error("Error retrieving block:", error);
		res.status(500).json({ error: "Error retrieving block" });
	}
});

app.get("/getWallet/:walletId", async (req, res) => {
	try {
		const walletHash = req.params.walletId;

		// Retrieve the block with the specified hash from the database
		const wallet = await db.get(walletHash);
		//const walletHashBlock = Object.values(blocks).find((block) => block.hash === blockHash);
		console.log("wallet fetched successfully", wallet);
		//console.log("wallet fetched successfully", wallet);

		res.status(200).json(wallet);
	} catch (error) {
		console.error("Error retrieving wallet:", error);
		res.status(500).json({ error: "Error retrieving wallet" });
	}
})

const port = 3000;
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
