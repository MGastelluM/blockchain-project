require("esm-hook");

const fetch = require("node-fetch").default;
import { Transaction } from "./transaction";
import { Block } from './block'; // Import the Block type

// Función para enviar un bloque al servidor
export async function sendBlockToServer(block:Block) {
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
    } else {
      console.error('Error sending block to server:', response.statusText);
    }
  } catch (error:any) {
    console.error('Error sending block to server:', error.message);
  }
}

// Función para enviar una transacción al servidor
export async function sendTransactionToServer(transaction:Transaction) {
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
    } else {
      console.error('Error sending transaction to server:', response.statusText);
    }
  } catch (error:any) {
    console.error('Error sending transaction to server:', error.message);
  }
}
