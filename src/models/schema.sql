-- Migration Schema for Paxi Token Indexer

-- Tokens table
CREATE TABLE IF NOT EXISTS tokens (
    address TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    decimals INTEGER DEFAULT 6,
    total_supply NUMERIC,
    logo_url TEXT,
    description TEXT,
    website TEXT,
    official_verified BOOLEAN DEFAULT FALSE,
    is_pump BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Token Metadata table (extended info)
CREATE TABLE IF NOT EXISTS token_metadata (
    address TEXT PRIMARY KEY REFERENCES tokens(address) ON DELETE CASCADE,
    marketing_address TEXT,
    mintable BOOLEAN,
    owner_address TEXT,
    data JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Token Prices table (current and historical)
CREATE TABLE IF NOT EXISTS token_prices (
    id BIGSERIAL PRIMARY KEY,
    address TEXT REFERENCES tokens(address) ON DELETE CASCADE,
    price_paxi NUMERIC NOT NULL,
    market_cap_paxi NUMERIC,
    liquidity_paxi NUMERIC,
    volume_24h NUMERIC,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for price lookups
CREATE INDEX IF NOT EXISTS idx_token_prices_address_timestamp ON token_prices(address, timestamp DESC);

-- Token Price Changes table
CREATE TABLE IF NOT EXISTS token_price_changes (
    address TEXT PRIMARY KEY REFERENCES tokens(address) ON DELETE CASCADE,
    change_1h NUMERIC,
    change_24h NUMERIC,
    change_7d NUMERIC,
    ath NUMERIC,
    atl NUMERIC,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wallets table
CREATE TABLE IF NOT EXISTS wallets (
    address TEXT PRIMARY KEY,
    name TEXT,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wallet Holdings table
CREATE TABLE IF NOT EXISTS wallet_holdings (
    id BIGSERIAL PRIMARY KEY,
    wallet_address TEXT REFERENCES wallets(address) ON DELETE CASCADE,
    token_address TEXT REFERENCES tokens(address) ON DELETE CASCADE,
    balance NUMERIC NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(wallet_address, token_address)
);

-- Sync Logs table
CREATE TABLE IF NOT EXISTS sync_logs (
    id BIGSERIAL PRIMARY KEY,
    sync_type TEXT NOT NULL,
    status TEXT NOT NULL,
    message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER
);
