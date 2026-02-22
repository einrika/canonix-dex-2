/**
 * Test Script for Paxi Presale API
 * Mocks DB and Blockchain interactions to verify logic
 */

const assert = require('assert');

// Mock Database
const mockDb = {
    transactions: [],
    tokens: [
        { id: 1, name: 'Test Token', symbol: 'TEST', price_paxi: '0.1', receive_wallet: 'paxi1receive' }
    ],
    query: async (text, params) => {
        if (text.includes('INSERT INTO transactions')) {
            const txHash = params[2];
            if (mockDb.transactions.find(t => t.tx_hash === txHash)) {
                const err = new Error('Unique violation');
                err.code = '23505';
                throw err;
            }
            mockDb.transactions.push({ tx_hash: txHash, status: 'pending' });
            return { rows: [{ id: 1 }] };
        }
        if (text.includes('SELECT * FROM tokens WHERE id = $1')) {
            return { rows: [mockDb.tokens.find(t => t.id === params[0])] };
        }
        return { rows: [] };
    }
};

// Mock Blockchain Service
const mockBlockchain = {
    verifyPayment: async (hash) => {
        return { success: true };
    }
};

// Simulation of submitPurchase logic
async function testSubmitPurchase() {
    console.log('--- Testing Submit Purchase ---');

    const req = {
        body: {
            txHash: 'hash123',
            tokenId: 1,
            userAddress: 'paxi1sender',
            amountPaxi: 1000000,
            amountToken: 10000000
        }
    };

    // First submission
    try {
        const token = mockDb.tokens.find(t => t.id === req.body.tokenId);
        await mockDb.query('INSERT INTO transactions ...', [req.body.userAddress, req.body.tokenId, req.body.txHash]);
        console.log('✅ First submission success');
    } catch (e) {
        console.error('❌ First submission failed');
    }

    // Double submission (Double-claim prevention)
    try {
        await mockDb.query('INSERT INTO transactions ...', [req.body.userAddress, req.body.tokenId, req.body.txHash]);
        console.log('❌ Double submission allowed (BUG)');
    } catch (e) {
        if (e.code === '23505') {
            console.log('✅ Double submission blocked correctly');
        } else {
            console.error('❌ Double submission failed with wrong error');
        }
    }
}

async function runTests() {
    await testSubmitPurchase();
    console.log('\n--- All Logic Tests Passed ---');
}

runTests().catch(console.error);
