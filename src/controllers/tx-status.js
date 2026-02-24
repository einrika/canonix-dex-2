const fetch = require('node-fetch');
const { sendResponse, checkRateLimit } = require('../utils/common');

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
                    // Success or Failed result found on chain
                    return sendResponse(res, true, {
                        hash: cleanHash,
                        height: data.result.height,
                        code: data.result.tx_result.code,
                        log: data.result.tx_result.log,
                        gas_used: data.result.tx_result.gas_used,
                        gas_wanted: data.result.tx_result.gas_wanted,
                        tx_result: data.result.tx_result
                    });
                }
            }
        } catch (e) {
            // Ignore fetch errors during polling
        }
        attempts++;
        await new Promise(r => setTimeout(r, 1000));
    }

    return sendResponse(res, false, { hash: cleanHash }, 'Transaction result timeout. It might still be processing.', 408);
};

module.exports = txStatusHandler;
