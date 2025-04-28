const { 
  Client, 
  PrivateKey, 
  ContractExecuteTransaction, 
  ContractCallQuery, 
  Hbar 
} = require('@hashgraph/sdk');
const dotenv = require('dotenv');

dotenv.config();

// Check if we have the required environment variables
if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
  throw new Error('Environment variables for Hedera account ID and private key must be present');
}

// Create Hedera client
let client;

if (process.env.HEDERA_NETWORK === 'mainnet') {
  client = Client.forMainnet();
} else {
  client = Client.forTestnet(); // Default to testnet
}

// Set operator (the account that will pay for transactions)
client.setOperator(
  process.env.HEDERA_ACCOUNT_ID,
  process.env.HEDERA_PRIVATE_KEY
);

/**
 * Execute a contract transaction (modifies state)
 * @param {string} contractId - The contract ID
 * @param {string} functionName - The function to call
 * @param {Array} params - Parameters to pass to the function
 * @param {number} value - Amount of HBAR to send (for payable functions)
 * @returns {Object} Transaction result
 */
const executeContract = async (contractId, functionName, params = [], value = 0) => {
  try {
    let transaction = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(100000)
      .setFunction(functionName, params);
    
    // If value is provided, make it a payable transaction
    if (value > 0) {
      transaction.setPayableAmount(new Hbar(value));
    }
    
    // Submit the transaction
    const txResponse = await transaction.execute(client);
    
    // Get the receipt
    const receipt = await txResponse.getReceipt(client);
    
    // Get the record
    const record = await txResponse.getRecord(client);
    
    return {
      status: receipt.status.toString(),
      transactionId: txResponse.transactionId.toString(),
      record: record
    };
  } catch (error) {
    console.error(`Error executing contract function ${functionName}:`, error);
    throw error;
  }
};

/**
 * Call a contract function (read-only, doesn't modify state)
 * @param {string} contractId - The contract ID
 * @param {string} functionName - The function to call
 * @param {Array} params - Parameters to pass to the function
 * @returns {Object} Function result
 */
const callContract = async (contractId, functionName, params = []) => {
  try {
    const query = new ContractCallQuery()
      .setContractId(contractId)
      .setGas(100000)
      .setFunction(functionName, params);
    
    // Submit the query
    const response = await query.execute(client);
    
    return response;
  } catch (error) {
    console.error(`Error calling contract function ${functionName}:`, error);
    throw error;
  }
};

module.exports = {
  client,
  executeContract,
  callContract
};