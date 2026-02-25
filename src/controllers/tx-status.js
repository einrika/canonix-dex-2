const fetch = require('node-fetch');
const { sendResponse, checkRateLimit, secureLogger } = require('../utils/common');

const txStatusHandler = async (req, res) => {
    const ip = req.headers['client-ip'] || req.headers['x-forwarded-for'] || req.ip || 'unknown';
    if (!checkRateLimit(ip)) return sendResponse(res, false, null, 'Too many requests', 429);

    const { hash } = req.query;
    if (!hash) return sendResponse(res, false, null, 'Hash required', 400);

    // Ensure hash is formatted correctly for RPC (some might have 0x prefix already)
    const cleanHash = hash.startsWith('0x') ? hash.slice(2) : hash;
    const rpcUrl = 'https://mainnet-rpc.paxinet.io';

    let attempts = 0;
    const maxAttempts = 20; // Allow up to 20 seconds for finality

    while (attempts < maxAttempts) {
        try {
            const response = await fetch(`${rpcUrl}/tx?hash=0x${cleanHash}`);
            if (response.ok) {
                const data = await response.json();
                if (data.result && data.result.tx_result) {
                    const txResult = data.result.tx_result;
                    const isSuccess = txResult.code === 0;

                    if (isSuccess) {
                        return sendResponse(res, true, {
                            hash: cleanHash,
                            height: data.result.height,
                            code: txResult.code,
                            log: txResult.log,
                            gas_used: txResult.gas_used,
                            gas_wanted: txResult.gas_wanted,
                            tx_result: txResult
                        });
                    } else {
                        // Return structured error for failed transaction
                        return sendResponse(res, false, { hash: cleanHash }, {
                            code: 'TX_FAILED',
                            message: `Blockchain transaction failed: ${txResult.log || 'Unknown error'}`,
                            txHash: cleanHash,
                            status: 'failed'
                        }, 200); // 200 because we found the result, but the TX itself failed
                    }
                }
            }
        } catch (e) {
            secureLogger.error('TX Status Fetch Error:', e.message);
        }
        attempts++;
        await new Promise(r => setTimeout(r, 1000));
    }

    return sendResponse(res, false, { hash: cleanHash }, {
        code: 'TX_TIMEOUT',
        message: 'Transaction result timeout. It might still be processing on-chain.',
        txHash: cleanHash,
        status: 'pending'
    }, 408);
};

module.exports = txStatusHandler;
