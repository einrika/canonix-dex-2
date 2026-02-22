const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const blockchain = require('../services/blockchainService');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';

/**
 * Admin Login
 */
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Simpel check via env jika belum ada user di DB
        if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1d' });
            return res.json({ success: true, token });
        }

        const { rows } = await db.query("SELECT * FROM admins WHERE username = $1", [username]);
        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const admin = rows[0];
        const isMatch = await bcrypt.compare(password, admin.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ success: true, token });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Token Management (CRUD)
 */
exports.createToken = async (req, res) => {
    try {
        const {
            contract_address, name, symbol, decimals, initial_supply,
            total_supply_presale, hardcap, price_paxi, receive_wallet,
            start_date, end_date, status
        } = req.body;

        const { rows } = await db.query(
            `INSERT INTO tokens (
                contract_address, name, symbol, decimals, initial_supply,
                total_supply_presale, hardcap, price_paxi, receive_wallet,
                start_date, end_date, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [contract_address, name, symbol, decimals || 6, initial_supply,
             total_supply_presale, hardcap, price_paxi, receive_wallet,
             start_date, end_date, status || 'upcoming']
        );

        res.status(201).json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateToken = async (req, res) => {
    try {
        const { id } = req.params;
        const fields = req.body;
        const keys = Object.keys(fields);
        if (keys.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });

        const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
        const values = Object.values(fields);
        values.push(id);

        const { rows } = await db.query(
            `UPDATE tokens SET ${setClause} WHERE id = $${values.length} RETURNING *`,
            values
        );

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Transaction & Distribution Monitoring
 */
exports.getAllTransactions = async (req, res) => {
    try {
        const { rows } = await db.query(
            `SELECT t.*, tk.symbol, tk.name, dl.distribution_tx_hash, dl.status as dist_status, dl.error_message
             FROM transactions t
             JOIN tokens tk ON t.token_id = tk.id
             LEFT JOIN distribution_logs dl ON t.id = dl.transaction_id
             ORDER BY t.created_at DESC`
        );
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Manual Approve / Retry Distribution
 */
exports.manualApprove = async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await db.query(
            "SELECT t.*, tk.contract_address FROM transactions t JOIN tokens tk ON t.token_id = tk.id WHERE t.id = $1",
            [id]
        );

        if (rows.length === 0) return res.status(404).json({ success: false, message: 'Transaction not found' });

        const tx = rows[0];

        // Coba distribusi langsung
        const result = await blockchain.distributeTokens(tx.contract_address, tx.user_address, tx.amount_token);

        if (result.success) {
            await db.query("UPDATE transactions SET status = 'distributed' WHERE id = $1", [id]);
            await db.query(
                "INSERT INTO distribution_logs (transaction_id, distribution_tx_hash, status) VALUES ($1, $2, 'success')",
                [id, result.txHash]
            );
            res.json({ success: true, message: 'Distributed successfully', txHash: result.txHash });
        } else {
            res.status(400).json({ success: false, message: 'Distribution failed', error: result.error });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
