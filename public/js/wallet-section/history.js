// =============================================================
// TX HISTORY — unified, no conflicts
// =============================================================

window.WalletHistory = {
    init: function() {},
    loadHistory: function() {
        if (window.renderTransactionHistory) window.renderTransactionHistory();
    }
};

// ── cache: diisi setiap kali loadTransactionHistory dipanggil ──
window._txCache = window._txCache || [];

// ── Patch loadTransactionHistory agar mengisi cache ───────────
(function() {
    const _orig = window.loadTransactionHistory;
    window.loadTransactionHistory = async function(address, page) {
        const result = await _orig(address, page);
        if (Array.isArray(result)) {
            // merge ke cache (hindari duplikat)
            result.forEach(tx => {
                if (!window._txCache.find(c => c.hash === tx.hash)) {
                    window._txCache.push(tx);
                }
            });
        }
        return result;
    };
})();

// =============================================================
// ICON & AMOUNT HELPERS
// =============================================================
function _txIcon(type) {
    switch ((type || '').toLowerCase()) {
        case 'receive':           return { char: '↙', color: '#4ade80' };
        case 'send':              return { char: '↗', color: '#f43f5e' };
        case 'swap':              return { char: '⇄', color: '#4ade80' };
        case 'provide_liquidity': return { char: '⇄', color: '#4ade80' };
        case 'withdraw_liquidity':return { char: '⇄', color: '#4ade80' };
        default:                  return { char: '↗', color: '#f43f5e' };
    }
}

function _fmtNum(n) {
    return Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 4 });
}
function _fmtNum6(n) {
    return Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 6 });
}

// Untuk list row
function _txAmountHtml(tx) {
    const amounts = tx.amounts || [];
    const t = (tx.type || '').toLowerCase();

    if (t === 'swap' && amounts.length >= 2) {
        const give = amounts.find(a => a.amount < 0);
        const recv = amounts.find(a => a.amount > 0);
        const gs = give ? `${_fmtNum(give.amount)} ${give.token}` : '';
        const rs = recv ? `${_fmtNum(recv.amount)} ${recv.token}` : '';
        return `<span style="color:#4ade80;font-weight:700">${gs} ⇄ ${rs}</span>`;
    }

    if ((t === 'provide_liquidity' || t === 'withdraw_liquidity') && amounts.length) {
        const parts = amounts.map(a => `${_fmtNum(a.amount)} ${a.token}`).join(' ⇄ ');
        return `<span style="color:#4ade80;font-weight:700">${parts}</span>`;
    }

    if (amounts.length) {
        const a = amounts[0];
        const pos = a.amount >= 0;
        const c = pos ? '#4ade80' : '#f43f5e';
        const s = pos ? '+' : '-';
        return `<span style="color:${c};font-weight:700">${s} ${_fmtNum(a.amount)} ${a.token}</span>`;
    }

    return `<span style="color:#6b7280">—</span>`;
}

// Untuk modal amount
function _txAmountHtmlModal(tx) {
    const amounts = tx.amounts || [];
    const t = (tx.type || '').toLowerCase();

    if (t === 'swap' && amounts.length >= 2) {
        const give = amounts.find(a => a.amount < 0);
        const recv = amounts.find(a => a.amount > 0);
        const gs = give ? `${_fmtNum6(give.amount)} ${give.token}` : '';
        const rs = recv ? `${_fmtNum6(recv.amount)} ${recv.token}` : '';
        return `<span style="color:#4ade80">${gs} ⇄ ${rs}</span>`;
    }

    if (amounts.length) {
        return amounts.map(a => {
            const pos = a.amount >= 0;
            const c = pos ? '#4ade80' : '#f43f5e';
            const s = pos ? '+' : '-';
            return `<span style="color:${c}">${s} ${_fmtNum6(a.amount)} ${a.token}</span>`;
        }).join('<br>');
    }

    return `<span style="color:#6b7280">—</span>`;
}

function _txCounterpart(tx) {
    const addr = (tx.type === 'receive' ? tx.from : tx.to) || tx.from || tx.to || '';
    if (!addr) return '';
    return `${addr.slice(0, 8)}...${addr.slice(-5)}`;
}

function _txDate(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
}

function _txDateFull(ts) {
    if (!ts) return '—';
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} ${pad(d.getHours())}.${pad(d.getMinutes())}.${pad(d.getSeconds())}`;
}

// =============================================================
// SIDEBAR TX HISTORY
// =============================================================
window.renderTransactionHistorySidebar = async function() {
    const container = document.getElementById('sidebarContent');
    if (!container || !window.wallet) return;

    container.innerHTML = `
        <div class="flex flex-col h-full">
            <div class="flex justify-between items-center px-1 pb-3 border-b border-white/10 flex-shrink-0">
                <h4 class="text-[11px] font-black text-secondary-text uppercase tracking-widest">Recent Transactions</h4>
                <button onclick="window.renderTransactionHistorySidebar()"
                    class="text-muted-text hover:text-primary-text transition-colors p-1">
                    <i class="fas fa-sync-alt text-[10px]"></i>
                </button>
            </div>
            <div id="sidebar-tx-list" class="flex-1 overflow-y-auto no-scrollbar">
                <div class="py-16 flex justify-center">
                    <div class="w-7 h-7 border-[3px] border-meme-green border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
            <div id="tx-load-more" class="flex-shrink-0 flex items-center justify-center py-3"></div>
        </div>`;

    window.historyPage = 1;
    window.historyIsEnd = false;
    await window.renderTxHistoryItems(true);
};

window.renderTxHistoryItems = async function(isInitial = false) {
    const listEl = document.getElementById('sidebar-tx-list');
    const moreEl = document.getElementById('tx-load-more');
    if (!listEl || !window.wallet) return;

    const history = await window.loadTransactionHistory(window.wallet.address, window.historyPage);

    if (isInitial) listEl.innerHTML = '';

    if (!history.length && isInitial) {
        listEl.innerHTML = `
            <div class="py-16 text-center text-muted-text text-[10px] font-black uppercase tracking-widest">
                No transactions found
            </div>`;
        if (moreEl) moreEl.innerHTML = '';
        return;
    }

    const rows = history.map(tx => {
        const icon       = _txIcon(tx.type);
        const amtHtml    = _txAmountHtml(tx);
        const counterpart= _txCounterpart(tx);
        const dateStr    = _txDate(tx.timestamp);
        const block      = tx.block ? `#${tx.block}` : '';

        // escape hash untuk onclick
        const safeHash = (tx.hash || '').replace(/'/g, "\\'");

        return `
        <div onclick="window.showTransactionDetailModal('${safeHash}')"
            class="flex items-center gap-3 px-1 py-[14px] border-b border-white/[0.06] cursor-pointer
                   hover:bg-white/[0.025] active:bg-white/[0.04] transition-colors select-none">

            <!-- Arrow icon -->
            <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                <span style="color:${icon.color};font-size:20px;font-weight:900;line-height:1">${icon.char}</span>
            </div>

            <!-- Center: amount + address + date -->
            <div class="flex-1 min-w-0 overflow-hidden">
                <div class="text-[13px] leading-snug truncate">${amtHtml}</div>
                <div class="text-[11px] text-muted-text mt-[3px] font-mono truncate">
                    ${counterpart ? `${counterpart}&nbsp;&nbsp;` : ''}${dateStr}
                </div>
            </div>

            <!-- Right: block -->
            <div class="flex-shrink-0 pl-2">
                <div class="text-[11px] text-muted-text font-mono">${block}</div>
            </div>
        </div>`;
    }).join('');

    if (isInitial) {
        listEl.innerHTML = rows;
    } else {
        listEl.insertAdjacentHTML('beforeend', rows);
    }

    if (moreEl) {
        moreEl.innerHTML = window.historyIsEnd
            ? `<span class="text-[9px] text-muted-text uppercase font-black tracking-widest">End of transactions</span>`
            : `<button onclick="window.loadMoreHistory()"
                class="px-5 py-1.5 bg-card border border-border text-[9px] font-black uppercase tracking-widest hover:border-up transition-all">
                Load More
               </button>`;
    }
};

window.loadMoreHistory = async function() {
    window.historyPage++;
    await window.renderTxHistoryItems(false);
};

// =============================================================
// HISTORY PAGE (non-sidebar, jika ada history-container)
// =============================================================
window.txHistory = [];

window.renderTransactionHistory = async function(page = 1) {
    const container = document.getElementById('history-container');
    if (!container) return;

    if (!window.wallet?.address) {
        container.innerHTML = `
            <div class="text-center py-20 font-bold text-secondary-text uppercase text-sm">
                Wallet Not Connected
            </div>`;
        return;
    }

    container.innerHTML = `
        <div class="py-20 flex justify-center">
            <div class="w-8 h-8 border-4 border-meme-green border-t-transparent rounded-full animate-spin"></div>
        </div>`;

    try {
        const history = await window.loadTransactionHistory(window.wallet.address, page);
        if (!history?.length) {
            container.innerHTML = `
                <div class="text-center py-20 text-secondary-text font-bold uppercase text-sm">
                    No transaction history found
                </div>`;
            return;
        }
        container.innerHTML = `<div class="flex flex-col">${history.map(_renderTxRow).join('')}</div>`;
    } catch {
        container.innerHTML = `
            <div class="text-center py-20 text-red-500 font-bold text-sm">
                Failed to load transaction history
            </div>`;
    }
};

function _renderTxRow(tx) {
    const icon   = _txIcon(tx.type);
    const amtHtml= _txAmountHtml(tx);
    const cp     = _txCounterpart(tx);
    const date   = _txDate(tx.timestamp);
    const block  = tx.block ? `#${tx.block}` : '';
    const safeHash = (tx.hash || '').replace(/'/g, "\\'");

    return `
    <div onclick="window.showTransactionDetailModal('${safeHash}')"
        class="flex items-center gap-3 px-2 py-[14px] border-b border-white/[0.06] cursor-pointer
               hover:bg-white/[0.025] transition-colors">
        <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center">
            <span style="color:${icon.color};font-size:20px;font-weight:900;line-height:1">${icon.char}</span>
        </div>
        <div class="flex-1 min-w-0 overflow-hidden">
            <div class="text-[13px] leading-snug">${amtHtml}</div>
            <div class="text-[11px] text-muted-text mt-[3px] font-mono">
                ${cp ? `${cp}&nbsp;&nbsp;` : ''}${date}
            </div>
        </div>
        <div class="flex-shrink-0 pl-2">
            <div class="text-[11px] text-muted-text font-mono">${block}</div>
        </div>
    </div>`;
}

// =============================================================
// TRANSACTION DETAIL MODAL
// =============================================================
window.showTransactionDetailModal = async function(hash) {
    // Cari dari cache dulu untuk render instan
    const cached = window._txCache.find(t => t.hash === hash);

    // Buat modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-[600] flex items-end sm:items-center justify-center';
    modal.style.background = 'rgba(8,10,14,0.88)';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    modal.innerHTML = `
        <div style="background:#0f1217;max-height:90vh"
            class="w-full sm:max-w-[420px] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden
                   border border-white/[0.08] shadow-2xl">

            <!-- Header -->
            <div class="flex items-center justify-between px-5 py-[14px] border-b border-white/[0.08] flex-shrink-0">
                <button onclick="this.closest('.fixed').remove()"
                    class="w-8 h-8 flex items-center justify-center text-muted-text hover:text-primary-text transition-colors -ml-1">
                    <i class="fas fa-arrow-left text-sm"></i>
                </button>
                <span class="text-[14px] font-semibold text-primary-text">Transaction Details</span>
                <div class="w-8"></div>
            </div>

            <!-- Body -->
            <div id="_txmb_${hash.slice(0,8)}" class="flex-1 overflow-y-auto no-scrollbar">
                <div class="py-16 flex justify-center">
                    <div class="w-7 h-7 border-[3px] border-meme-green border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        </div>`;

    document.body.appendChild(modal);

    const bodyId = `_txmb_${hash.slice(0,8)}`;
    const getBody = () => document.getElementById(bodyId);

    // Render dari cache dulu jika ada
    if (cached) _paintModal(getBody(), cached, hash);

    // Fetch RPC untuk data lengkap (fee, memo, dll)
    try {
        const rpc = await window.fetchTxDetail(hash);
        if (rpc) {
            const enriched = _buildTxFromRpc(rpc, hash, cached);
            _paintModal(getBody(), enriched, hash);
        }
    } catch(e) {
        console.warn('fetchTxDetail error:', e);
        if (!cached) {
            const b = getBody();
            if (b) b.innerHTML = `<div class="p-8 text-center text-[#f43f5e] text-[12px]">Failed to load transaction</div>`;
        }
    }
};

function _buildTxFromRpc(rpc, hash, fallback) {
    const tr   = rpc.tx_response || {};
    const body = rpc.tx?.body    || {};

    let fee = null;
    try {
        const coins = rpc.tx?.auth_info?.fee?.amount || [];
        if (coins.length) {
            const c = coins[0];
            fee = `${parseInt(c.amount) / 1e6} ${c.denom === 'upaxi' ? 'PAXI' : c.denom.replace(/^u/, '').toUpperCase()}`;
        }
    } catch(_) {}

    return {
        hash,
        status:          tr.code === 0 ? 'success' : 'failed',
        type:            fallback?.type            || 'send',
        block:           tr.height                || fallback?.block,
        timestamp:       tr.timestamp             || fallback?.timestamp,
        from:            fallback?.from           || null,
        to:              fallback?.to             || null,
        contractAddress: fallback?.contractAddress || null,
        amounts:         fallback?.amounts         || [],
        fee,
        memo:   body.memo || fallback?.memo || null,
        raw_log: tr.code !== 0 ? tr.raw_log : null,
    };
}

function _paintModal(bodyEl, tx, hash) {
    if (!bodyEl) return;

    const ok      = tx.status !== 'failed';
    const scColor = ok ? '#4ade80' : '#f43f5e';
    const scText  = ok ? 'Success' : 'Failed';

    const typeLabel = (tx.type || 'send')
        .split('_').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');

    const amtHtml = _txAmountHtmlModal(tx);
    const dateStr = _txDateFull(tx.timestamp);
    const safeHash = hash || '';

    // row helper
    const row = (label, val, isHtml = false) => {
        if (val === null || val === undefined || val === '') return '';
        const valStr = isHtml ? val : _esc(String(val));
        return `
        <div class="flex items-start gap-4 py-[15px] border-b border-white/[0.06]">
            <span class="text-[13px] text-[#5a6070] flex-shrink-0" style="min-width:110px">${label}</span>
            <span class="text-[13px] text-[#d1d5db] text-right flex-1 break-all font-sans leading-snug">${valStr}</span>
        </div>`;
    };

    const hashRow = safeHash ? `
        <div class="flex items-start gap-4 py-[15px] border-b border-white/[0.06]">
            <span class="text-[13px] text-[#5a6070] flex-shrink-0" style="min-width:110px">Hash</span>
            <div class="flex items-start gap-2 flex-1 justify-end">
                <span class="text-[13px] text-[#d1d5db] text-right break-all leading-snug font-mono"
                    style="word-break:break-all">
                    ${safeHash.slice(0,16)}<br>${safeHash.slice(16,32)}<br>${safeHash.slice(32)}
                </span>
                <button onclick="window.copyAddress(event,'${safeHash}')"
                    class="flex-shrink-0 mt-[2px] text-[#5a6070] hover:text-[#d1d5db] transition-colors">
                    <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                </button>
            </div>
        </div>` : '';

    const amountRow = `
        <div class="flex items-start gap-4 py-[15px] border-b border-white/[0.06]">
            <span class="text-[13px] text-[#5a6070] flex-shrink-0" style="min-width:110px">Amount</span>
            <span class="text-[13px] text-right flex-1 leading-snug">${amtHtml}</span>
        </div>`;

    bodyEl.innerHTML = `
        <div class="px-5 pt-1 pb-4">
            ${row('Status', `<span style="color:${scColor}">${scText}</span>`, true)}
            ${row('Type', typeLabel)}
            ${hashRow}
            ${tx.block ? row('Height', String(tx.block)) : ''}
            ${tx.from  ? row('From', tx.from) : ''}
            ${tx.to    ? row('To',   tx.to)   : ''}
            ${tx.contractAddress ? `
            <div class="flex items-start gap-4 py-[15px] border-b border-white/[0.06]">
                <span class="text-[13px] text-[#5a6070] flex-shrink-0" style="min-width:110px">Contract<br>Address</span>
                <span class="text-[13px] text-[#d1d5db] text-right flex-1 break-all leading-snug">${_esc(tx.contractAddress)}</span>
            </div>` : ''}
            ${amountRow}
            ${tx.fee  ? row('Fee', tx.fee)   : ''}
            ${tx.memo ? row('Memo', tx.memo) : ''}
            ${row('Timestamp', dateStr)}
            ${tx.raw_log ? `
            <div class="mt-3 p-4 rounded-xl border border-[#f43f5e]/20 bg-[#f43f5e]/[0.04]">
                <div class="text-[10px] text-[#f43f5e] font-black uppercase mb-1">Error</div>
                <div class="text-[11px] font-mono text-[#f43f5e]/70 break-all">${_esc(tx.raw_log)}</div>
            </div>` : ''}
        </div>

        <div class="px-5 pb-5 flex-shrink-0">
            <a href="https://winscan.winsnip.xyz/tx/${safeHash}" target="_blank"
                class="flex items-center justify-center w-full py-3 rounded-xl
                       border border-white/[0.1] text-[12px] font-semibold text-[#8a9099]
                       hover:text-[#d1d5db] hover:border-white/25 transition-all">
                View on Explorer
            </a>
        </div>`;
}

function _esc(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;');
}

// =============================================================
// Compat: openTxDetailModal lama → redirect ke yang baru
// =============================================================
window.openTxDetailModal = function(hash) {
    window.showTransactionDetailModal(hash);
};

// Bind ke WalletUI jika ada
if (window.WalletUI) {
    window.WalletUI.loadHistory = function() {
        window.renderTransactionHistory();
    };
}
