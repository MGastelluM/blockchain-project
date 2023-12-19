# <CheloCoin> BlockChain UDP proyect
[![Node Version 16.5.0](https://cdn.iconscout.com/icon/free/png-256/free-node-js-1-1174935.png)](https://nodejs.org/en/blog/release/v16.5.0)

<CheloCoin> is based on a group proyect to create a real functional distributed blockchain with amazing improvements. 
Basically it is a small-sized cryptocurrency that uses DB-Level as a DBB, typescript for the main code and front console.

This starting proyect of a blockchain fetches via POST to the database, always refreshing the chain as a whole. 


## Installation

To get started with this project, follow these steps:

1. Clone the repository:

```bash
git clone https://github.com/MGastelluM/blockchain-project.git
cd blockchain-project
```

2. Initialize and start the database:

```bash
    cd db-level
    npm install
    npm start
```
3.  Initialize and start the Chain and create a node 1 in a *NEW* terminal:

```bash
 cd blockchain-project
 npm install
 npm start 1
```
4.  Create a node 2 in a *NEW* terminal:

```bash
 cd blockchain-project
 npm install
 npm start 2
```

## Usage

The main usage of the chain is based on a simple menu by console. Upon initialization the code creates a genesis block and updates the database, next if the genesis already exists on the database as a chain in the dataBase folder inside db-level, the chain will be retrieved from the DBB. 

The first (1) option "prints" the last block from chain 
The second (2) option "gets" and prints the last block from the database stored chain
the other options works as intended, with a CRUD behavior.
The last two added features have implemented (6-7) to test p2p protocol using libp2p module. Option 6 broadcast a message to the whole network and option 7 send a transaction to another node.

```bash
 Menu:
 1. See last block from chain
 2. See last block from the database
 3. Get genesis block from database
 4. Send a generic transaction
 5. Get block by ID
 6. Broadcast a message
 7. Send a transaction to another node by ID:
 8. Exit
 Choose an option (1-8):
```


## Firts approach to Blockchain

Our first version uses objects oriented programming to apply the principles of Blockchain in a small scale, storing the data to a key/value database. The main features are blocks reading and writting, chain implementation with a genesis block, transactions logic and database operations to store and get data, data hashing, etc.

`index.ts` is the entrypoint of our project, and shows a command interface that allows to genertae transactions, display blockchain data and get database information.

The code logic is based in four clases: `transaction`,`wallet`,`block` and `chain`.



## Transaction Class
Transaction Class describes a monetary transactions and to create a transaction object we consider the currency amount, payer and payee information. Next, we include a method to serialise the data as a string to apply cryptographic algorithms more easier.  

```javascript
export class Transaction {
  constructor(
    public amount: number,
    public payer: string,
    public payee: string
  ) {}

  // Serialise transaction as a string
  toString() {
    return JSON.stringify(this);
  }
}

```

## Transaction Class
First, we import `crypto` module to get hash a value in order to get the connections between blocks. Next, we need import the transaction class to code the block logic.

To get a block we consider a `transaction` object, a `nonce` used in mining process, and `prevhash`, to get the connection between a block and its previous block. Also, we need a `index` value and `timestamp`.


## Libp2p setup



### Collaborators

* [MGastelluM](https://github.com/MGastelluM) -
  **Matías Gastellu** <<matias.gastellu@mail.udp.com>> 
* [mxrchelo](https://github.com/mxrchelo) -
  **Marcelo Quiñones** <<marcelo.quinones@mail.udp.com>> 
* [Esgarothh](https://github.com/Esgarothh) -
  **Sebastian Arroyo** <<sebastian.arroyo@mail.udp.com>> 
* [Victor](https://github.com/Victorn) -
  **Victor Fuentes** <<Victor.fuentes@mail.udp.cl>>

  
## License

[MIT](https://choosealicense.com/licenses/mit/)
