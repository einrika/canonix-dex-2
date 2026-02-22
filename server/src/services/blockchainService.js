const fetch = require('node-fetch');
const { SigningCosmWasmClient } = require('@cosmjs/cosmwasm-stargate');
const { DirectSecp256k1HdWallet, DirectSecp256k1Wallet } = require('@cosmjs/proto-signing');
const { GasPrice } = require('@cosmjs/stargate');
require('dotenv').config();

const LCD_URL = process.env.LCD_URL || 'https://mainnet-lcd.paxinet.io';
const RPC_URL = process.env.RPC_URL || 'https://mainnet-rpc.paxinet.io';
const DENOM = process.env.DENOM || 'upaxi';

/**
 * Verifikasi pembayaran native PAXI dari user
 */
async function verifyPayment(txHash, expectedData) {
    try {
        console.log(`Verifying transaction: ${txHash}`);
        const response = await fetch(`${LCD_URL}/cosmos/tx/v1beta1/txs/${txHash}`);

        if (!response.ok) {
            const error = await response.json();
            console.error('LCD Error:', error);
            return { success: false, error: 'Transaction not found or network error' };
        }

        const data = await response.json();
        const txResponse = data.tx_response;

        if (txResponse.code !== 0) {
            return { success: false, error: 'Transaction failed on-chain' };
        }

        // Cari MsgSend di dalam transaction
        const messages = data.tx.body.messages;
        const sendMsg = messages.find(msg => msg['@type'] === '/cosmos.bank.v1beta1.MsgSend');

        if (!sendMsg) {
            return { success: false, error: 'Not a native transfer transaction' };
        }

        const amountObj = sendMsg.amount.find(a => a.denom === DENOM);
        const amount = amountObj ? amountObj.amount : '0';

        // Validasi detail
        const isValidRecipient = sendMsg.to_address === expectedData.receiveWallet;
        const isValidSender = sendMsg.from_address === expectedData.userAddress;
        const isCorrectAmount = amount === expectedData.amountPaxi.toString();

        if (!isValidRecipient) return { success: false, error: 'Invalid recipient address' };
        if (!isValidSender) return { success: false, error: 'Sender address mismatch' };
        if (!isCorrectAmount) return { success: false, error: `Amount mismatch. Expected ${expectedData.amountPaxi}, got ${amount}` };

        return {
            success: true,
            data: {
                from: sendMsg.from_address,
                to: sendMsg.to_address,
                amount: amount,
                height: txResponse.height,
                timestamp: txResponse.timestamp
            }
        };
    } catch (error) {
        console.error('VerifyPayment Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Mengirim token PRC20 dari distribution wallet ke user
 */
async function distributeTokens(contractAddress, recipientAddress, amount) {
    try {
        let wallet;
        if (process.env.DISTRIBUTION_MNEMONIC) {
            wallet = await DirectSecp256k1HdWallet.fromMnemonic(process.env.DISTRIBUTION_MNEMONIC, { prefix: 'paxi' });
        } else if (process.env.DISTRIBUTION_PRIVATE_KEY) {
            const pk = Buffer.from(process.env.DISTRIBUTION_PRIVATE_KEY.replace('0x', ''), 'hex');
            wallet = await DirectSecp256k1Wallet.fromKey(pk, 'paxi');
        } else {
            throw new Error('Distribution wallet credentials not found in environment');
        }

        const [account] = await wallet.getAccounts();
        const client = await SigningCosmWasmClient.connectWithSigner(RPC_URL, wallet, {
            gasPrice: GasPrice.fromString('0.05upaxi')
        });

        const msg = {
            transfer: {
                recipient: recipientAddress,
                amount: amount.toString()
            }
        };

        console.log(`Distributing ${amount} tokens from ${account.address} to ${recipientAddress}`);

        const result = await client.execute(account.address, contractAddress, msg, "auto", "Presale Distribution");

        if (result.code === 0) {
            return { success: true, txHash: result.transactionHash };
        } else {
            return { success: false, error: result.rawLog };
        }
    } catch (error) {
        console.error('DistributeTokens Error:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    verifyPayment,
    distributeTokens
};
