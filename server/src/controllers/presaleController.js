const db = require('../config/database');
const blockchain = require('../services/blockchainService');

/**
 * Get all active/upcoming/ended tokens
 */
exports.getTokens = async (req, res) => {
    try {
        const { rows } = await db.query(
            "SELECT * FROM tokens WHERE is_active = true ORDER BY start_date ASC"
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get single token detail with its progress
 */
exports.getTokenDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await db.query("SELECT * FROM tokens WHERE id = $1", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Token not found' });
        }

        // Hitung total raised
        const { rows: raisedRows } = await db.query(
            "SELECT SUM(amount_paxi) as total_raised FROM transactions WHERE token_id = $1 AND status IN ('verified', 'distributed')",
            [id]
        );

        const token = rows[0];
        token.total_raised = raisedRows[0].total_raised || '0';

        res.json({ success: true, data: token });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Submit purchase transaction
 * Implement double-claim prevention using UNIQUE constraint on tx_hash in DB
 */
exports.submitPurchase = async (req, res) => {
    try {
        const { txHash, tokenId, userAddress, amountPaxi, amountToken } = req.body;

        // 1. Cek apakah token ada dan aktif
        const { rows: tokenRows } = await db.query("SELECT * FROM tokens WHERE id = $1", [tokenId]);
        if (tokenRows.length === 0) {
            return res.status(404).json({ success: false, message: 'Token not found' });
        }
        const token = tokenRows[0];

        // 2. Simpan ke database dengan status pending
        // UNIQUE constraint pada tx_hash akan mencegah double submission
        try {
            await db.query(
                `INSERT INTO transactions (user_address, token_id, tx_hash, amount_paxi, amount_token, status)
                 VALUES ($1, $2, $3, $4, $5, 'pending')`,
                [userAddress, tokenId, txHash, amountPaxi, amountToken]
            );
        } catch (dbError) {
            if (dbError.code === '23505') { // Unique violation
                return res.status(400).json({ success: false, message: 'Transaction hash already submitted' });
            }
            throw dbError;
        }

        // 3. Trigger verifikasi secara asinkron (tidak menunggu hasil LCD agar respons cepat)
        blockchain.verifyPayment(txHash, {
            receiveWallet: token.receive_wallet,
            userAddress: userAddress,
            amountPaxi: amountPaxi
        }).then(async (result) => {
            if (result.success) {
                await db.query(
                    "UPDATE transactions SET status = 'verified' WHERE tx_hash = $1",
                    [txHash]
                );
                console.log(`Auto-verified purchase for ${txHash}`);
            } else {
                console.log(`Auto-verification failed for ${txHash}: ${result.error}`);
                // Tetap biarkan pending untuk dicek ulang oleh queue atau manual
            }
        }).catch(err => console.error('Async Verification Error:', err));

        res.status(201).json({
            success: true,
            message: 'Purchase submitted and is being verified',
            txHash
        });

    } catch (error) {
        console.error('SubmitPurchase Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get user transaction history
 */
exports.getUserHistory = async (req, res) => {
    try {
        const { address } = req.params;
        const { rows } = await db.query(
            `SELECT t.*, tk.symbol, tk.name, dl.distribution_tx_hash
             FROM transactions t
             JOIN tokens tk ON t.token_id = tk.id
             LEFT JOIN distribution_logs dl ON t.id = dl.transaction_id AND dl.status = 'success'
             WHERE t.user_address = $1
             ORDER BY t.created_at DESC`,
            [address]
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
