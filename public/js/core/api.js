// ============================================
// API.JS - Data Fetching
// ============================================

import { APP_CONFIG } from './config.js';
import { fetchDirect, log } from './utils.js';
import { State } from './state.js';

export const fetchPaxiPrice = async () => {
    try {
        const data = await fetchDirect(`${APP_CONFIG.BACKEND_API}/api/paxi-price`);
        if (data?.price) {
            State.set('paxiPrice', data.price);
            return data.price;
        }
    } catch (e) {
        log('Failed to fetch PAXI price', 'error');
    }
    return 0;
};

export const fetchPoolData = async (address) => {
    const addr = address || State.get('currentToken')?.address;
    if (!addr) return;
    try {
        const data = await fetchDirect(`${APP_CONFIG.BACKEND_API}/api/pool-data?address=${addr}`);
        State.set('poolData', data);
        return data;
    } catch (e) {
        log('Failed to fetch pool data', 'error');
    }
};

export const processTokenDetail = function(address, rawData) {
    return {
        address: address,
        name: rawData.name || 'Unknown',
        symbol: rawData.symbol || 'TOKEN',
        price_paxi: parseFloat(rawData.price_paxi) || 0,
        price_usd: (parseFloat(rawData.price_paxi) || 0) * (State.get('paxiPrice') || 0.05),
        liquidity: parseFloat(rawData.liquidity_paxi) || 0,
        volume_24h: parseFloat(rawData.volume_24h_paxi) || 0,
        price_change_24h: parseFloat(rawData.price_change_24h) || 0,
        supply: rawData.total_supply || '0',
        description: rawData.description || 'No description available.',
        mint_status: rawData.mint_status || 'Locked',
        is_official: !!rawData.is_official
    };
};
