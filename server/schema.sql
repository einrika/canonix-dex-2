-- Paxi Presale Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(64) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tokens table (Presale Tokens)
CREATE TABLE IF NOT EXISTS tokens (
    id SERIAL PRIMARY KEY,
    contract_address VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    decimals INTEGER DEFAULT 6,
    initial_supply NUMERIC(78, 0) NOT NULL,
    total_supply_presale NUMERIC(78, 0) NOT NULL,
    hardcap NUMERIC(78, 0) NOT NULL,
    price_paxi NUMERIC(78, 18) NOT NULL, -- Price in PAXI (native) per token
    receive_wallet VARCHAR(64) NOT NULL,
    status VARCHAR(20) DEFAULT 'upcoming', -- upcoming, live, ended
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_address VARCHAR(64) NOT NULL,
    token_id INTEGER REFERENCES tokens(id),
    tx_hash VARCHAR(100) UNIQUE NOT NULL,
    amount_paxi NUMERIC(78, 0) NOT NULL, -- in upaxi
    amount_token NUMERIC(78, 0) NOT NULL, -- amount of PRC20 to receive
    status VARCHAR(20) DEFAULT 'pending', -- pending, verified, failed, distributed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Distribution Logs
CREATE TABLE IF NOT EXISTS distribution_logs (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions(id),
    distribution_tx_hash VARCHAR(100) UNIQUE,
    status VARCHAR(20) NOT NULL, -- success, failed
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT NOT NULL
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_address ON transactions(user_address);
CREATE INDEX IF NOT EXISTS idx_transactions_tx_hash ON transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_tokens_status ON tokens(status);
CREATE INDEX IF NOT EXISTS idx_distribution_status ON distribution_logs(status);
