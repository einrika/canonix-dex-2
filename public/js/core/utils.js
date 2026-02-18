// ============================================
// UTILS.JS - Utility & Helper Functions
// ============================================

// ===== SECURITY: ESCAPE HTML =====
window.escapeHtml = function(unsafe) {
  if (typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

window.toMicroAmount = function(amount, decimals) {
    if (amount === undefined || amount === null || amount === '') return "0";

    let str = String(amount);
    if (str.includes('e')) {
        str = Number(amount).toFixed(decimals);
    }

    let [int, frac = ""] = str.split('.');
    frac = frac.padEnd(decimals, '0').slice(0, decimals);

    const combined = (int.replace(/^-/, '').replace(/^0+/, '') || "0") + frac;
    return BigInt(combined.replace(/^0+/, '') || "0").toString();
};

window.formatAmount = function(num, decimals = 2) {
    if (num === undefined || num === null) return '-';
    const val = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(val)) return '-';

    // Rule: No abbreviations (K, M, B). Use full numeric with commas.
    return val.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
        useGrouping: true
    });
};

// Standard Price Formatter (Paxi Network Standard)
// Rule: Exactly 8 decimal places, rounded, no abbreviations or scientific notation
window.formatPrice = function(price) {
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
window.fetchDirect = async function(url, options = {}) {
    const BACKEND_API = window.APP_CONFIG.BACKEND_API;
    
    // 1. Handle already full backend API URLs
    if (url.startsWith(BACKEND_API)) {
        try {
            const res = await fetch(url, {
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

    // 2. Routing to specialized serverless functions
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
            apiEndpoint = `${BACKEND_API}/api/token-list`;
            params.append('page', page);
        } else if (url.includes('prc20/contract')) {
            const addr = parsedUrl.searchParams.get('address');
            apiEndpoint = `${BACKEND_API}/api/token-detail`;
            params.append('address', addr);
        } else if (url.startsWith('http')) {
            // Generic proxy for other external domains (whitelisted in backend)
            apiEndpoint = `${BACKEND_API}/api/proxy`;
            params.append('url', url);
        } else {
            // Regular local fetch for static files or other local routes
            const res = await fetch(url, options);
            return await res.json();
        }

        const finalUrl = `${apiEndpoint}?${params.toString()}`;
        const fetchOptions = {
            method: options.method || 'GET',
            headers: { 'Content-Type': 'application/json', ...options.headers }
        };
        if (options.body) fetchOptions.body = options.body;

        const response = await fetch(finalUrl, fetchOptions);
        const result = await response.json();

        if (result.success) {
            return result.data;
        } else {
            throw new Error(result.error || 'Serverless error');
        }
    } catch (error) {
        console.error(`❌ fetchDirect failed for ${url}:`, error);
        throw error;
    }
};

// ===== PROXY FETCH WITH FALLBACK =====
window.fetchWithProxy = async function(url, options = {}) {
    const PROXIES = window.APP_CONFIG.PROXIES || [];
    if (PROXIES.length === 0) {
        // No proxies configured, try direct fetch
        const response = await fetch(url, {
            method: options.method || 'GET',
            headers: options.headers || {},
            body: options.body
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }

    let lastError = null;

    // Try each proxy in order
    for (let i = 0; i < PROXIES.length; i++) {
        try {
            const proxyUrl = PROXIES[i] + encodeURIComponent(url);
            console.log(`🔄 Trying proxy ${i + 1}/${PROXIES.length}: ${PROXIES[i]}`);
            
            const response = await fetch(proxyUrl, {
                method: options.method || 'GET',
                headers: options.headers || {},
                body: options.body,
                signal: options.signal
            });

            if (!response.ok) {
                throw new Error(`Proxy returned status ${response.status}`);
            }

            const data = await response.json();
            console.log(`✅ Proxy ${i + 1} succeeded`);
            return data;

        } catch (error) {
            console.warn(`❌ Proxy ${i + 1} failed:`, error.message);
            lastError = error;
            
            // If this is not the last proxy, continue to next one
            if (i < PROXIES.length - 1) {
                console.log(`⏭️ Trying next proxy...`);
                continue;
            }
        }
    }

    // If all proxies failed, try direct fetch as last resort
    try {
        console.log('🔄 All proxies failed, trying direct fetch...');
        const response = await fetch(url, {
            method: options.method || 'GET',
            headers: options.headers || {},
            body: options.body,
            signal: options.signal
        });

        if (!response.ok) {
            throw new Error(`Direct fetch returned status ${response.status}`);
        }

        const data = await response.json();
        console.log('✅ Direct fetch succeeded');
        return data;

    } catch (directError) {
        console.error('❌ Direct fetch also failed:', directError.message);
        throw new Error(`All proxies and direct fetch failed. Last error: ${lastError?.message || directError.message}`);
    }
};

// ===== SIMPLE PROXY FETCH (Single Attempt) =====
window.fetchViaProxy = async function(url, proxyIndex = 0, options = {}) {
    const PROXIES = window.APP_CONFIG.PROXIES || [];
    if (PROXIES.length === 0) throw new Error('No proxies configured');
    
    const proxy = PROXIES[proxyIndex] || PROXIES[0];
    const proxyUrl = proxy + encodeURIComponent(url);
    
    try {
        const response = await fetch(proxyUrl, {
            method: options.method || 'GET',
            headers: options.headers || {},
            body: options.body
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Proxy fetch failed (${proxy}):`, error);
        throw error;
    }
};

// ===== RANDOM PROXY FETCH =====
window.fetchWithRandomProxy = async function(url, options = {}) {
    const PROXIES = window.APP_CONFIG.PROXIES || [];
    if (PROXIES.length === 0) throw new Error('No proxies configured');
    
    const randomIndex = Math.floor(Math.random() * PROXIES.length);
    const proxy = PROXIES[randomIndex];
    const proxyUrl = proxy + encodeURIComponent(url);
    
    console.log(`🎲 Using random proxy ${randomIndex + 1}: ${proxy}`);
    
    try {
        const response = await fetch(proxyUrl, {
            method: options.method || 'GET',
            headers: options.headers || {},
            body: options.body
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log(`✅ Random proxy fetch succeeded`);
        return data;

    } catch (error) {
        console.error(`❌ Random proxy fetch failed:`, error);
        throw error;
    }
};

// ===== FETCH WITH TIMEOUT & PROXY FALLBACK =====
window.fetchWithTimeout = async function(url, timeoutMs = 10000, useProxy = false) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        let response;
        
        if (useProxy) {
            // Use proxy with fallback
            response = await window.fetchWithProxy(url, { signal: controller.signal });
        } else {
            // Direct fetch
            const res = await fetch(url, { signal: controller.signal });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            response = await res.json();
        }

        clearTimeout(timeoutId);
        return response;

    } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
            console.error(`⏱️ Request timeout after ${timeoutMs}ms`);
            throw new Error(`Request timeout (${timeoutMs}ms)`);
        }
        
        throw error;
    }
};

// ===== SMART FETCH (Auto-detect CORS and use proxy if needed) =====
window.smartFetch = async function(url, options = {}) {
    try {
        // Try direct fetch first
        const response = await fetch(url, {
            method: options.method || 'GET',
            headers: options.headers || {},
            body: options.body
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        // If CORS error or network error, try with proxy
        if (error.message.includes('CORS') || error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            console.warn('⚠️ CORS/Network error detected, switching to proxy...');
            return await window.fetchWithProxy(url, options);
        }
        
        throw error;
    }
};

// ===== FORMATTING FUNCTIONS =====
window.formatBalance = function(balance, decimals = 6) {
  if (balance === undefined || balance === null || balance === '-' || balance === 'Loading...') {
    return balance;
  }
  const raw = typeof balance === 'string' ? Number(balance) : balance;
  if (!Number.isFinite(raw)) return '-';
  const value = raw / Math.pow(10, decimals);
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  }).replace(/\.?0+$/, '');
};

window.formatBalanceFull = function(balance, decimals = 6) {
  if (balance === undefined || balance === null || balance === '-') return balance;
  const raw = typeof balance === 'string' ? Number(balance) : balance;
  if (!Number.isFinite(raw)) return '-';
  const value = raw / Math.pow(10, decimals);
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

// ===== CACHE FUNCTIONS =====
window.getCachedData = function(key) {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    const data = JSON.parse(cached);
    if (Date.now() - data.timestamp > window.APP_CONFIG.CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }
    return data.value;
  } catch (e) {
    return null;
  }
};

window.setCachedData = function(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify({
      value: value,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.error('Cache storage failed:', e);
  }
};

// ===== NOTIFICATION SYSTEM =====
window.showTxResult = function(data) {
    const modal = document.getElementById('txResultModal');
    if (!modal) return;

    const { status, type, asset, amount, network, address, hash, error } = data;
    const isSuccess = status === 'success';

    // Status UI
    const statusEl = document.getElementById('txResultStatus');
    const iconEl = document.getElementById('txResultIcon');
    const typeEl = document.getElementById('txResultType');

    statusEl.textContent = isSuccess ? 'Success' : 'Failed';
    statusEl.className = `text-xl font-black uppercase italic tracking-widest mb-1 ${isSuccess ? 'text-up' : 'text-down'}`;

    iconEl.className = `w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 ${isSuccess ? 'bg-up/10 text-up' : 'bg-down/10 text-down'}`;
    iconEl.innerHTML = `<i class="fas ${isSuccess ? 'fa-check-circle' : 'fa-times-circle'} text-2xl"></i>`;

    typeEl.textContent = `${type} Details`;

    // Log Details
    document.getElementById('txResultTime').textContent = new Date().toLocaleTimeString();
    document.getElementById('logType').textContent = type || '--';
    document.getElementById('logAsset').textContent = asset || '--';
    document.getElementById('logAmount').textContent = amount || '0.00';
    document.getElementById('logAmount').className = `text-[10px] font-mono font-bold ${isSuccess ? 'text-up' : 'text-gray-400'}`;

    const activeNet = window.NetworkManager?.getActiveNetwork();
    document.getElementById('logNetwork').textContent = network || (activeNet?.name || 'Paxi Mainnet');

    const addrEl = document.getElementById('logAddress');
    addrEl.textContent = address || '--';
    document.getElementById('copyAddressBtn').onclick = () => {
        if (address) navigator.clipboard.writeText(address);
    };

    const hashEl = document.getElementById('logHash');
    const hashContainer = document.getElementById('logHashContainer');
    if (isSuccess && hash) {
        hashContainer.classList.remove('hidden');
        hashEl.textContent = hash;
        const explorer = activeNet?.explorer || 'https://explorer.paxinet.io';
        document.getElementById('viewHashBtn').onclick = () => window.open(`${explorer}/tx/${hash}`, '_blank');
    } else {
        hashContainer.classList.add('hidden');
    }

    // Error
    const errorContainer = document.getElementById('logErrorContainer');
    if (!isSuccess && error) {
        errorContainer.classList.remove('hidden');
        document.getElementById('logError').textContent = error;
    } else {
        errorContainer.classList.add('hidden');
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
};

window.closeTxResult = function() {
    const modal = document.getElementById('txResultModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
};

window.activeNotifs = [];
window.showNotif = function(msg, type = 'info') {
  if (!msg) return;
  const lowerMsg = msg.toLowerCase();

  // Strict Implementation: Only Loading, Success, Failed allowed.
  let finalMsg = '';
  if (lowerMsg.includes('loading') || lowerMsg.includes('process') || lowerMsg.includes('broadcasting') || lowerMsg.includes('building')) {
      finalMsg = 'Loading';
      type = 'info';
  } else if (lowerMsg.includes('success') || lowerMsg.includes('sent') || lowerMsg.includes('confirmed') || lowerMsg.includes('completed')) {
      finalMsg = 'Success';
      type = 'success';
  } else if (lowerMsg.includes('fail') || lowerMsg.includes('error') || lowerMsg.includes('reject')) {
      finalMsg = 'Failed';
      type = 'error';
  }

  if (!finalMsg) return; // Block all other notifications (Address copied, etc. per strict requirements)

  const safeMsg = finalMsg;

  // Ensure styles are present
  if (!document.getElementById('paxi-notif-styles')) {
    const style = document.createElement('style');
    style.id = 'paxi-notif-styles';
    style.innerHTML = `
      .paxi-notif {
        position: fixed; right: 16px; z-index: 10000;
        padding: 8px 12px; border-radius: 12px;
        background: rgba(15, 10, 30, 0.9); backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
        display: flex; align-items: center; gap: 10px;
        min-width: 200px; max-width: 320px; color: #fff;
        transform: translateX(120%); transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        overflow: hidden; pointer-events: auto;
      }
      .paxi-notif.show { transform: translateX(0); }
      .paxi-notif-progress {
        position: absolute; bottom: 0; left: 0; height: 2px;
        background: linear-gradient(90deg, #00f2fe, #ff0080);
        width: 100%; transition: width 3s linear;
      }
      .paxi-notif-icon {
        width: 24px; height: 24px; border-radius: 8px;
        display: flex; align-items: center; justify-content: center; font-size: 11px;
        flex-shrink: 0;
      }
      .paxi-notif-success .paxi-notif-icon { background: rgba(0, 242, 254, 0.15); color: #00f2fe; }
      .paxi-notif-error .paxi-notif-icon { background: rgba(255, 0, 128, 0.15); color: #ff0080; }
      .paxi-notif-info .paxi-notif-icon { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
      .paxi-notif-text { font-size: 11px; font-weight: 600; line-height: 1.3; color: rgba(255,255,255,0.95); }
    `;
    document.head.appendChild(style);
  }

  const icons = { success: 'check-circle', error: 'exclamation-circle', info: 'info-circle' };

  const notif = document.createElement('div');
  notif.className = `paxi-notif paxi-notif-${type}`;
  notif.innerHTML = `
    <div class="paxi-notif-icon"><i class="fas fa-${icons[type] || icons.info}"></i></div>
    <div class="paxi-notif-text">${safeMsg}</div>
    <div class="paxi-notif-progress" style="width: 100%"></div>
  `;

  document.body.appendChild(notif);

  // Stacking logic
  window.activeNotifs.push(notif);

  const updatePositions = () => {
    let currentTop = 16;
    window.activeNotifs.forEach((el) => {
      el.style.top = `${currentTop}px`;
      currentTop += el.offsetHeight + 8; // Height + spacing
    });
  };

  // Trigger animations
  requestAnimationFrame(() => {
    updatePositions();
    notif.classList.add('show');
    const progress = notif.querySelector('.paxi-notif-progress');
    setTimeout(() => { if (progress) progress.style.width = '0%'; }, 50);
  });

  // Remove
  setTimeout(() => {
    notif.classList.remove('show');
    setTimeout(() => {
      notif.remove();
      window.activeNotifs = window.activeNotifs.filter(n => n !== notif);
      updatePositions();
    }, 400);
  }, 3000);
};

// ===== LOGGER =====
window.log = function(msg, type = 'info') {
  const colors = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
    warn: '⚠️'
  };
  const time = new Date().toLocaleTimeString();
  
  if (msg instanceof Error) {
    console.error(`${colors[type] || 'ℹ️'} [${time}] ${msg.message}\nStack: ${msg.stack}`);
  } else {
    console.log(`${colors[type] || 'ℹ️'} [${time}] ${msg}`);
  }
};

// ===== URL HELPERS =====
window.normalizeLogoUrl = function(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  rawUrl = rawUrl.trim();
  if (rawUrl.startsWith('https://ipfs//')) rawUrl = rawUrl.replace('https://ipfs//', 'ipfs://');
  if (rawUrl.startsWith('ipfs://')) return 'https://ipfs.io/ipfs/' + rawUrl.slice(7);
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl;
  return 'https://' + rawUrl;
};

// ===== COPY TO CLIPBOARD =====
window.copyAddress = function(event, address) {
  event.stopPropagation();
  navigator.clipboard.writeText(address);
};

// ===== SHARE TOKEN =====
window.shareToken = function(address) {
  const url = window.location.origin + window.location.pathname + '?token=' + address;
  navigator.clipboard.writeText(url);
};

// ===== HELPER NUMERIC =====
window.numtokenlist = function(v, d = 0) {
  return typeof v === 'number' && !isNaN(v) ? v : d;
};

// ===== WAIT FOR LIBRARY =====
window.waitForLibrary = function(globalName, timeout = 10000) {
    return new Promise((resolve, reject) => {
        if (window[globalName]) return resolve(window[globalName]);
        let elapsed = 0;
        const interval = setInterval(() => {
            elapsed += 100;
            if (window[globalName]) {
                clearInterval(interval);
                resolve(window[globalName]);
            } else if (elapsed >= timeout) {
                clearInterval(interval);
                reject(new Error(`Library ${globalName} failed to load after ${timeout}ms`));
            }
        }, 100);
    });
};

// ===== SAFE DOM MANIPULATION =====
window.setText = function(idOrEl, text) {
    const el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    if (el) el.textContent = text;
};

window.shortenAddress = function(address, chars = 8) {
    if (!address) return '';
    if (address.length <= (chars * 2) + 3) return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

window.setHtml = function(idOrEl, html) {
    const el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    if (el) el.innerHTML = html;
};

window.setValue = function(idOrEl, value) {
    const el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    if (el) el.value = value;
};

window.addClass = function(idOrEl, className) {
    const el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    if (el && el.classList) el.classList.add(className);
};

window.removeClass = function(idOrEl, className) {
    const el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    if (el && el.classList) el.classList.remove(className);
};

window.toggleClass = function(idOrEl, className) {
    const el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    if (el && el.classList) el.classList.toggle(className);
};

window.hasClass = function(idOrEl, className) {
    const el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    return el && el.classList ? el.classList.contains(className) : false;
};

// ===== CRYPTO UTILITIES =====
window.cryptoUtils = {
    deriveKey: async function(pin, salt) {
        const encoder = new TextEncoder();
        const pinData = encoder.encode(pin);
        const baseKey = await crypto.subtle.importKey('raw', pinData, 'PBKDF2', false, ['deriveKey']);
        return crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt: salt, iterations: 100000, hash: 'SHA-256' },
            baseKey,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
    },
    encrypt: async function(text, pin) {
        const encoder = new TextEncoder();
        const data = encoder.encode(text);
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const key = await this.deriveKey(pin, salt);
        const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, data);
        const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
        combined.set(salt, 0);
        combined.set(iv, salt.length);
        combined.set(new Uint8Array(encrypted), salt.length + iv.length);
        return btoa(String.fromCharCode(...combined));
    },
    decrypt: async function(encodedData, pin) {
        try {
            const combined = Uint8Array.from(atob(encodedData), c => c.charCodeAt(0));
            const salt = combined.slice(0, 16);
            const iv = combined.slice(16, 28);
            const data = combined.slice(28);
            const key = await this.deriveKey(pin, salt);
            const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, data);
            return new TextDecoder().decode(decrypted);
        } catch (e) {
            throw new Error('Invalid PIN or corrupted data');
        }
    }
};
