// ============================================
// UTILS.JS - Utility & Helper Functions (ES Module)
// ============================================

import { APP_CONFIG } from './config.js';

// ===== SECURITY: ESCAPE HTML =====
export const escapeHtml = (unsafe) => {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const toMicroAmount = (amount, decimals) => {
    if (amount === undefined || amount === null || amount === '') return "0";
    let str = String(amount).trim();
    if (str.includes('e')) str = Number(amount).toFixed(decimals);
    const isNegative = str.startsWith('-');
    if (isNegative) str = str.slice(1);
    let [int, frac = ""] = str.split('.');
    frac = frac.padEnd(decimals, '0').slice(0, decimals);
    let combined = (int.replace(/^0+/, '') || "0") + frac;
    combined = combined.replace(/^0+/, '') || "0";
    return combined;
};

export const formatAmount = (num, decimals = 2) => {
    if (num === undefined || num === null) return '-';
    const val = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(val)) return '-';
    return val.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
        useGrouping: true
    });
};

export const formatPrice = (price) => {
    if (price === undefined || price === null) return '-';
    const num = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(num)) return '-';
    return num.toLocaleString('en-US', {
        minimumFractionDigits: 8,
        maximumFractionDigits: 8,
        useGrouping: true
    });
};

// ===== SERVERLESS SECURE FETCH =====
export const fetchDirect = async (url, options = {}) => {
    const BACKEND_API = APP_CONFIG.BACKEND_API;
    
    if (url.startsWith(BACKEND_API) || url.startsWith('/api/')) {
        try {
            const fullUrl = url.startsWith('/api/') ? `${BACKEND_API}${url}` : url;
            const res = await fetch(fullUrl, {
                method: options.method || 'GET',
                headers: { 'Content-Type': 'application/json', ...options.headers },
                body: options.body
            });
            const result = await res.json();
            if (result.success) return result.data;
            throw new Error(result.error || 'Backend API error');
        } catch (e) {
            console.error(`❌ Backend API fetch failed: ${url}`, e);
            throw e;
        }
    }

    // Routing to specialized backend endpoints
    let apiEndpoint = '';
    const params = new URLSearchParams();

    try {
        const parsedUrl = new URL(url, window.location.origin);

        if (url.includes('prc20/get_contract_prices')) {
            const addr = parsedUrl.searchParams.get('address');
            apiEndpoint = `${BACKEND_API}/api/token-price`;
            params.append('address', addr);
        } else if (url.includes('prc20/search')) {
            const query = parsedUrl.searchParams.get('name');
            apiEndpoint = `${BACKEND_API}/api/token-list`;
            params.append('query', query);
        } else if (url.includes('prc20/contracts')) {
            const page = parsedUrl.searchParams.get('page') || 0;
            const type = parsedUrl.searchParams.get('type') || 'all';
            apiEndpoint = `${BACKEND_API}/api/token-list`;
            params.append('page', page);
            params.append('type', type);
        } else if (url.includes('prc20/contract')) {
            const addr = parsedUrl.searchParams.get('address');
            apiEndpoint = `${BACKEND_API}/api/token-detail`;
            params.append('address', addr);
        } else if (url.startsWith('http')) {
            apiEndpoint = `${BACKEND_API}/api/proxy`;
            params.append('url', url);
        } else {
            const res = await fetch(url, options);
            return await res.json();
        }

        const finalUrl = `${apiEndpoint}?${params.toString()}`;
        const fetchOptions = {
            method: options.method || 'GET',
            headers: { 'Content-Type': 'application/json', ...options.headers },
            cache: options.cache || 'default'
        };
        if (options.body) fetchOptions.body = options.body;

        const response = await fetch(finalUrl, fetchOptions);
        const result = await response.json();

        if (result.success) return result.data;
        throw new Error(result.error || 'Backend service error');
    } catch (error) {
        console.error(`❌ fetchDirect failed for ${url}:`, error);
        throw error;
    }
};

export const formatBalance = (balance, decimals = 6) => {
  if (balance === undefined || balance === null || balance === '-' || balance === 'Loading...') return balance;
  const raw = typeof balance === 'string' ? Number(balance) : balance;
  if (!Number.isFinite(raw)) return '-';
  const value = raw / Math.pow(10, decimals);
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  }).replace(/\.?0+$/, '');
};

export const formatBalanceFull = (balance, decimals = 6) => {
  if (balance === undefined || balance === null || balance === '-') return balance;
  const raw = typeof balance === 'string' ? Number(balance) : balance;
  if (!Number.isFinite(raw)) return '-';
  const value = raw / Math.pow(10, decimals);
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

export const normalizeLogoUrl = (url) => {
    if (!url || typeof url !== 'string') return '';
    url = url.trim();
    if (url.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${url.replace('ipfs://', '')}`;
    if (url.startsWith('https://ipfs//')) return `https://ipfs.io/ipfs/${url.replace('https://ipfs//', '')}`;
    if (url.includes('pinata.cloud/ipfs/')) return url;
    if (url.includes('/ipfs/')) return url.startsWith('/ipfs/') ? `https://ipfs.io${url}` : url;
    if (url.startsWith('ar://')) return `https://arweave.net/${url.replace('ar://', '')}`;
    if (url.match(/^[a-zA-Z0-9]{46,}$/)) return `https://ipfs.io/ipfs/${url}`;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return 'https://' + url;
};

export const shortenAddress = (address, chars = 7) => {
    if (!address) return '';
    let start = chars;
    let end = chars === 7 ? 6 : chars;
    if (address.length <= start + end) return address;
    return `${address.slice(0, start)}....${address.slice(-end)}`;
};

export const setText = (idOrEl, text) => {
    const el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    if (el) el.textContent = text;
};

export const setHtml = (idOrEl, html) => {
    const el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    if (el) el.innerHTML = html;
};

export const setValue = (idOrEl, value) => {
    const el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    if (el) el.value = value;
};

// Logger
export const log = (msg, type = 'info') => {
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warn: '⚠️' };
  const time = new Date().toLocaleTimeString();
  if (msg instanceof Error) {
    console.error(`${icons[type] || 'ℹ️'} [${time}] ${msg.message}\nStack: ${msg.stack}`);
  } else {
    console.log(`${icons[type] || 'ℹ️'} [${time}] ${msg}`);
  }
};
