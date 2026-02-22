const cron = require('node-cron');
const db = require('../config/database');
const blockchain = require('./blockchainService');

/**
 * Memproses antrian distribusi token
 */
async function processDistributionQueue() {
    try {
        // Ambil transaksi yang sudah diverifikasi tapi belum didistribusi
        const { rows: pendingTx } = await db.query(
            `SELECT t.*, tk.contract_address
             FROM transactions t
             JOIN tokens tk ON t.token_id = tk.id
             WHERE t.status = 'verified'
             LIMIT 10`
        );

        if (pendingTx.length === 0) return;

        console.log(`Processing ${pendingTx.length} distributions...`);

        for (const tx of pendingTx) {
            try {
                const result = await blockchain.distributeTokens(
                    tx.contract_address,
                    tx.user_address,
                    tx.amount_token
                );

                if (result.success) {
                    // Update status transaksi
                    await db.query(
                        "UPDATE transactions SET status = 'distributed' WHERE id = $1",
                        [tx.id]
                    );

                    // Catat di distribution logs
                    await db.query(
                        "INSERT INTO distribution_logs (transaction_id, distribution_tx_hash, status) VALUES ($1, $2, 'success')",
                        [tx.id, result.txHash]
                    );

                    console.log(`Success: Distributed tokens for TX ${tx.tx_hash}. DistHash: ${result.txHash}`);
                } else {
                    console.error(`Failed to distribute for TX ${tx.tx_hash}: ${result.error}`);

                    // Catat error di logs
                    await db.query(
                        "INSERT INTO distribution_logs (transaction_id, status, error_message) VALUES ($1, 'failed', $2)",
                        [tx.id, result.error]
                    );

                    // Opsional: set kembali ke verified agar dicoba lagi nanti atau set failed
                    // Di sini kita biarkan 'verified' agar dicoba lagi, kecuali logic tertentu
                }
            } catch (err) {
                console.error(`Error processing distribution for TX ${tx.id}:`, err);
            }
        }
    } catch (error) {
        console.error('Queue processing error:', error);
    }
}

/**
 * Task untuk verifikasi transaksi otomatis (opsional jika frontend tidak trigger)
 */
async function processVerificationQueue() {
    try {
        const { rows: pendingVerify } = await db.query(
            `SELECT t.*, tk.receive_wallet
             FROM transactions t
             JOIN tokens tk ON t.token_id = tk.id
             WHERE t.status = 'pending'
             LIMIT 10`
        );

        for (const tx of pendingVerify) {
            const result = await blockchain.verifyPayment(tx.tx_hash, {
                receiveWallet: tx.receive_wallet,
                userAddress: tx.user_address,
                amountPaxi: tx.amount_paxi
            });

            if (result.success) {
                await db.query("UPDATE transactions SET status = 'verified' WHERE id = $1", [tx.id]);
                console.log(`TX ${tx.tx_hash} verified successfully.`);
            } else if (result.error && result.error.includes('failed')) {
                await db.query("UPDATE transactions SET status = 'failed' WHERE id = $1", [tx.id]);
            }
        }
    } catch (error) {
        console.error('Verification queue error:', error);
    }
}

// Jalankan setiap 1 menit
cron.schedule('* * * * *', () => {
    processDistributionQueue();
    processVerificationQueue();
});

module.exports = {
    start: () => console.log('Queue service started'),
    processDistributionQueue,
    processVerificationQueue
};
