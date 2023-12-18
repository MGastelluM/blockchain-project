export async function sendChainToServer(chain) {
    try {
        const dataToSend = {
            key: 'chain',
            data: chain,
        };
        const response = await fetch('http://localhost:3000/storeData', {
            method: 'POST',
            body: JSON.stringify(dataToSend),
            headers: { 'Content-Type': 'application/json' },
        });
        if (response.status === 200) {
            console.log('Chain sent to server:', chain);
            return response.json();
        }
        else {
            console.error('Error sending chain to server:', response.statusText);
        }
    }
    catch (error) {
        console.error('Error sending chain to server:', error.message);
    }
}
export async function sendBlockToServer(block) {
    try {
        const dataToSend = {
            key: block.hash, // Usar el hash del bloque como clave única
            data: block.index,
        };
        const response = await fetch('http://localhost:3000/storeData', {
            method: 'POST',
            body: JSON.stringify(dataToSend),
            headers: { 'Content-Type': 'application/json' },
        });
        if (response.status === 200) {
            console.log('Block sent to server:', block.hash);
        }
        else {
            console.error('Error sending block to server:', response.statusText);
        }
    }
    catch (error) {
        console.error('Error sending block to server:', error.message);
    }
}
export async function sendTransactionToServer(transaction) {
    try {
        const dataToSend = {
            key: transaction.payee, // Usar el ID de la transacción como clave única
            data: transaction.payer,
        };
        const response = await fetch('http://localhost:3000/storeData', {
            method: 'POST',
            body: JSON.stringify(dataToSend),
            headers: { 'Content-Type': 'application/json' },
        });
        if (response.status === 200) {
            console.log('Transaction sent to server:', transaction.payee);
        }
        else {
            console.error('Error sending transaction to server:', response.statusText);
        }
    }
    catch (error) {
        console.error('Error sending transaction to server:', error.message);
    }
}
export const getGenesisBlock = async () => {
    try {
        const response = await fetch(`http://localhost:3000/getGenesisBlock`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (response.status === 200) {
            return response.json();
        }
        else {
            console.error('Error on genesis block request:', response.statusText);
            return null;
        }
    }
    catch (error) {
        console.error('Error on genesis block request', error.message);
    }
};
export const getBlockchain = async () => {
    try {
        const response = await fetch(`http://localhost:3000/getBlockchain`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (response.status === 200) {
            console.log('Blockchain received:');
            return response.json();
        }
        else {
            console.error('Error on genesis block request:', response.statusText);
            return null;
        }
    }
    catch (error) {
        console.error('Error on genesis block request', error.message);
    }
};
export const getLastBlock = async () => {
    try {
        const response = await fetch(`http://localhost:3000/getLastBlock`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (response.status === 200) {
            return response.json();
        }
        else {
            console.error('Error on genesis block request:', response.statusText);
            return null;
        }
    }
    catch (error) {
        console.error('Error on genesis block request', error.message);
    }
};
export const getBlockById = async (id) => {
    try {
        const response = await fetch(`http://localhost:3000/getBlockById/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (response.status === 200) {
            return response.json();
        }
        else {
            console.error('Error on index block request:', response.statusText);
            return null;
        }
    }
    catch (error) {
        console.error('Error on index block request', error.message);
    }
};
