const fetch = require('node-fetch');
const { sendResponse, checkRateLimit } = require('../utils/common');
const { LCD: blockchainLcd } = require('../config/blockchain');

const txStatusHandler = async (req, res) => {
    const ip = req.headers['client-ip'] || req.headers['x-forwarded-for'] || req.ip || 'unknown';
    if (!checkRateLimit(ip)) return sendResponse(res, false, null, 'Too many requests', 429);

    const { hash } = req.query;
    if (!hash) return sendResponse(res, false, null, 'Hash required', 400);

    // Clean hash (remove 0x prefix if present and convert to uppercase)
    const cleanHash = hash.startsWith('0x') ? hash.slice(2).toUpperCase() : hash.toUpperCase();
    
    // Use LCD endpoint format from config
    const lcdUrl = blockchainLcd || 'https://mainnet-lcd.paxinet.io';
    const url = `${lcdUrl}/cosmos/tx/v1beta1/txs/${cleanHash}`;

    let attempts = 0;
    const maxAttempts = 20; // Allow up to 20 seconds for finality

    while (attempts < maxAttempts) {
        try {
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                
                // Check if transaction data exists
                if (data.tx_response) {
                    const txResp = data.tx_response;
                    
                    // Format response sesuai dengan yang diharapkan frontend (line 234-256)
                    return sendResponse(res, true, {
                        // Fields yang digunakan di frontend:
                        code: txResp.code,              // line 235: resultData.code === 0
                        hash: txResp.txhash,            // line 244: hash
                        height: txResp.height,          // line 247: height
                        gas_used: txResp.gas_used,      // line 248: gasUsed
                        gas_wanted: txResp.gas_wanted,  // line 249: gasWanted
                        log: txResp.raw_log,            // line 245, 253: log untuk error message
                        
                        // Additional useful fields
                        timestamp: txResp.timestamp,
                        codespace: txResp.codespace,
                        data: txResp.data,
                        logs: txResp.logs,
                        info: txResp.info,
                        events: txResp.events,
                        
                        // Full structures untuk keperluan lain
                        tx_response: txResp,
                        tx: data.tx
                    });
                }
            } else if (response.status === 404) {
                // Transaction not found yet, continue polling
            } else {
                // Other errors, log and continue
                const errorText = await response.text();
                console.warn(`LCD error ${response.status} for hash ${cleanHash}:`, errorText);
            }
        } catch (e) {
            // Ignore fetch errors during polling
            console.warn(`Fetch error for hash ${cleanHash}:`, e.message);
        }
        
        attempts++;
        if (attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    return sendResponse(res, false, { hash: cleanHash }, 'Transaction result timeout. It might still be processing.', 408);
};

module.exports = txStatusHandler;