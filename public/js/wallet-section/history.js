// =============================================================
// TX HISTORY — complete unified version
// history-container (halaman) + sidebar + modal detail
// =============================================================

window.WalletHistory = {
    init: function() {},
    loadHistory: function() {
        if (window.renderTransactionHistory) window.renderTransactionHistory();
    }
};

window.txHistory = [];
window._txCache = window._txCache || [];
window.historyPage = 1;
window.historyIsEnd = false;

// ── Patch loadTransactionHistory agar otomatis isi cache ──────
(function() {
    const _orig = window.loadTransactionHistory;
    if (!_orig || _orig._patched) return;
    window.loadTransactionHistory = async function(address, page) {
        const result = await _orig.call(this, address, page);
        if (Array.isArray(result)) {
            result.forEach(tx => {
                if (tx.hash && !window._txCache.find(c => c.hash === tx.hash)) {
                    window._txCache.push(tx);
                }
            });
            if (result.length === 0) window.historyIsEnd = true;
        }
        return result;
    };
    window.loadTransactionHistory._patched = true;
})();

// =============================================================
// HELPERS
// =============================================================

function _txIcon(type) {
    switch ((type || '').toLowerCase()) {
        case 'receive':
            return { char: '↙', color: '#4ade80' };
        case 'send':
            return { char: '↗', color: '#f43f5e' };
        case 'swap':
            return { char: '⇄', color: '#4ade80' };
        case 'provide_liquidity':
            return { char: '+', color: '#4ade80' };
        case 'withdraw_liquidity':
            return { char: '-', color: '#4ade80' };
        default:
            return { char: '↗', color: '#f43f5e' };
    }
}

function _fmt(n, dec = 4) {
    return Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: dec });
}

// Amount HTML untuk LIST ROW
function _amtRowHtml(tx) {
    const amounts = tx.amounts || [];
    const t = (tx.type || '').toLowerCase();
    
    if (t === 'swap' && amounts.length >= 2) {
        const give = amounts.find(a => a.amount < 0);
        const recv = amounts.find(a => a.amount > 0);
        const gs = give ? `${_fmt(give.amount)} ${give.token}` : '';
        const rs = recv ? `${_fmt(recv.amount)} ${recv.token}` : '';
        return `<span style="color:#4ade80;font-weight:700">${gs} ⇄ ${rs}</span>`;
    }
    
    if ((t === 'provide_liquidity' || t === 'withdraw_liquidity') && amounts.length) {
        const parts = amounts.map(a => `${_fmt(a.amount)} ${a.token}`).join(' + ');
        const color = t === 'withdraw_liquidity' ? '#4ade80' : '#f43f5e';
        return `<span style="color:${color};font-weight:700">${parts}</span>`;
    }
    
    if (amounts.length) {
        const a = amounts[0];
        const pos = a.amount >= 0;
        const c = pos ? '#4ade80' : '#f43f5e';
        return `<span style="color:${c};font-weight:700">${pos?'+':'-'} ${_fmt(a.amount)} ${a.token}</span>`;
    }
    
    // fallback: tidak ada amounts, tampilkan type label saja
    const label = (tx.type || 'unknown').replace(/_/g, ' ')
        .split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
    return `<span style="color:#94a3b8;font-weight:700">${label}</span>`;
}

// Amount HTML untuk MODAL
function _amtModalHtml(tx) {
    const amounts = tx.amounts || [];
    const t = (tx.type || '').toLowerCase();
    
    if (t === 'swap' && amounts.length >= 2) {
        const give = amounts.find(a => a.amount < 0);
        const recv = amounts.find(a => a.amount > 0);
        const gs = give ? `${_fmt(give.amount,6)} ${give.token}` : '';
        const rs = recv ? `${_fmt(recv.amount,6)} ${recv.token}` : '';
        return `<span style="color:#4ade80">${gs} ⇄ ${rs}</span>`;
    }
    
    if (amounts.length) {
        return amounts.map(a => {
            const pos = a.amount >= 0;
            const c = pos ? '#4ade80' : '#f43f5e';
            return `<span style="color:${c}">${pos?'+':'-'} ${_fmt(a.amount,6)} ${a.token}</span>`;
        }).join('<br>');
    }
    
    return '<span style="color:#6b7280">—</span>';
}

function _counterpart(tx) {
    const addr = (tx.type === 'receive' ? tx.from : tx.to) || tx.from || tx.to || '';
    if (!addr) return '';
    return `${addr.slice(0,8)}...${addr.slice(-5)}`;
}

function _dateShort(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
}

function _dateFull(ts) {
    if (!ts) return '—';
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} ${pad(d.getHours())}.${pad(d.getMinutes())}.${pad(d.getSeconds())}`;
}

function _esc(s) {
    return String(s || '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _typeLabel(type) {
    return (type || 'unknown').replace(/_/g, ' ')
        .split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

// =============================================================
// SHARED ROW TEMPLATE
// =============================================================
function _buildTxRowHtml(tx) {
    const icon = _txIcon(tx.type);
    const amt = _amtRowHtml(tx);
    const cp = _counterpart(tx);
    const date = _dateShort(tx.timestamp);
    const block = tx.block ? `#${tx.block}` : '';
    const hash = (tx.hash || '').replace(/'/g, "\\'");
    
    return `
    <div onclick="window.showTransactionDetailModal('${hash}')"
        class="flex items-center gap-3 px-2 py-[14px] border-b border-white/[0.06]
               cursor-pointer hover:bg-white/[0.025] active:bg-white/[0.04]
               transition-colors select-none">

        <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center">
            <span style="color:${icon.color};font-size:22px;font-weight:900;line-height:1">${icon.char}</span>
        </div>

        <div class="flex-1 min-w-0 overflow-hidden">
            <div class="text-[13px] leading-snug truncate">${amt}</div>
            <div class="text-[11px] font-mono mt-[3px] truncate" style="color:#6b7280">
                ${cp ? `${cp}&nbsp;&nbsp;` : ''}${date}
            </div>
        </div>

        <div class="flex-shrink-0 pl-1 text-right">
            <div class="text-[11px] font-mono" style="color:#6b7280">${block}</div>
        </div>
    </div>`;
}

// =============================================================
// HISTORY PAGE  (history-container)
// =============================================================
window.renderTransactionHistory = async function(page = 1) {
    const container = document.getElementById('history-container');
    if (!container) return;
    
    if (!window.wallet?.address) {
        container.innerHTML = `
            <div class="py-20 text-center text-secondary-text font-bold uppercase text-sm">
                Wallet Not Connected
            </div>`;
        return;
    }
    
    container.innerHTML = `
        <div class="py-16 flex justify-center">
            <div class="w-8 h-8 border-4 border-meme-green border-t-transparent rounded-full animate-spin"></div>
        </div>`;
    
    try {
        const history = await window.loadTransactionHistory(window.wallet.address, page);
        if (!history?.length) {
            container.innerHTML = `
                <div class="py-20 text-center text-secondary-text font-bold uppercase text-sm">
                    No transaction history found
                </div>`;
            return;
        }
        container.innerHTML = `<div>${history.map(_buildTxRowHtml).join('')}</div>`;
    } catch (e) {
        console.error(e);
        container.innerHTML = `
            <div class="py-20 text-center font-bold text-sm" style="color:#f43f5e">
                Failed to load transaction history
            </div>`;
    }
};

// =============================================================
// SIDEBAR TX HISTORY  (sidebarContent)
// =============================================================
window.renderTransactionHistorySidebar = async function() {
    const container = document.getElementById('sidebarContent');
    if (!container || !window.wallet) return;
    
    container.innerHTML = `
        <div class="flex flex-col h-full">
            <div class="flex justify-between items-center px-1 pb-3 border-b border-white/10 flex-shrink-0">
                <h4 class="text-[11px] font-black text-secondary-text uppercase tracking-widest">
                    Recent Transactions
                </h4>
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
            <div class="py-16 text-center text-[10px] font-black uppercase tracking-widest"
                style="color:#6b7280">No transactions found</div>`;
        if (moreEl) moreEl.innerHTML = '';
        return;
    }
    
    const rows = history.map(_buildTxRowHtml).join('');
    isInitial ? (listEl.innerHTML = rows) : listEl.insertAdjacentHTML('beforeend', rows);
    
    if (moreEl) {
        moreEl.innerHTML = window.historyIsEnd ?
            `<span class="text-[9px] font-black uppercase tracking-widest" style="color:#6b7280">
                   End of transactions
               </span>` :
            `<button onclick="window.loadMoreHistory()"
                   class="px-5 py-1.5 bg-card border border-border text-[9px] font-black
                          uppercase tracking-widest hover:border-up transition-all">
                   Load More
               </button>`;
    }
};

window.loadMoreHistory = async function() {
    window.historyPage++;
    await window.renderTxHistoryItems(false);
};

// =============================================================
// TRANSACTION DETAIL MODAL
// =============================================================
window.showTransactionDetailModal = async function(hash) {
    document.querySelectorAll('._tx_modal_wrap').forEach(m => m.remove());
    
    const cached = window._txCache.find(t => t.hash === hash);
    
    const modal = document.createElement('div');
    modal.className = '_tx_modal_wrap fixed inset-0 z-[600] flex items-end sm:items-center justify-center';
    modal.style.background = 'rgba(8,10,14,0.88)';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    
    const bodyId = `_txmb_${Math.random().toString(36).slice(2,8)}`;
    
    modal.innerHTML = `
        <div style="background:#0f1217;max-height:90vh;border:1px solid rgba(255,255,255,0.08)"
            class="w-full sm:max-w-[440px] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl">

            <div class="flex items-center justify-between px-5 py-[14px] flex-shrink-0"
                style="border-bottom:1px solid rgba(255,255,255,0.08)">
                <button onclick="this.closest('._tx_modal_wrap').remove()"
                    class="w-8 h-8 flex items-center justify-center transition-colors -ml-1"
                    style="color:#6b7280">
                    <i class="fas fa-arrow-left text-sm"></i>
                </button>
                <span class="text-[14px] font-semibold text-primary-text">Transaction Details</span>
                <div class="w-8"></div>
            </div>

            <div id="${bodyId}" class="flex-1 overflow-y-auto no-scrollbar">
                <div class="py-16 flex justify-center">
                    <div class="w-7 h-7 border-[3px] border-meme-green border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        </div>`;
    
    document.body.appendChild(modal);
    
    const getBody = () => document.getElementById(bodyId);
    
    if (cached) _paintModal(getBody(), cached, hash);
    
    try {
        const rpc = await window.fetchTxDetail(hash);
        if (rpc) {
            const full = _enrichTx(rpc, hash, cached);
            _paintModal(getBody(), full, hash);
        }
    } catch (e) {
        console.warn('fetchTxDetail:', e);
        if (!cached) {
            const b = getBody();
            if (b) b.innerHTML = `
                <div class="p-8 text-center text-[12px]" style="color:#f43f5e">
                    Failed to load transaction
                </div>`;
        }
    }
};

function _enrichTx(rpc, hash, fallback) {
    const tr = rpc.tx_response || {};
    const body = rpc.tx?.body || {};
    
    let fee = null;
    try {
        const coins = rpc.tx?.auth_info?.fee?.amount || [];
        if (coins.length) {
            const c = coins[0];
            fee = `${parseInt(c.amount)/1e6} ${c.denom==='upaxi'?'PAXI':c.denom.replace(/^u/,'').toUpperCase()}`;
        }
    } catch (_) {}
    
    return {
        hash,
        status: tr.code === 0 ? 'success' : 'failed',
        type: fallback?.type || 'send',
        block: tr.height || fallback?.block,
        timestamp: tr.timestamp || fallback?.timestamp,
        from: fallback?.from || null,
        to: fallback?.to || null,
        contractAddress: fallback?.contractAddress || null,
        amounts: fallback?.amounts || [],
        fee,
        memo: body.memo || fallback?.memo || null,
        gas_used: tr.gas_used,
        gas_wanted: tr.gas_wanted,
        raw_log: tr.code !== 0 ? tr.raw_log : null,
    };
}

function _paintModal(bodyEl, tx, hash) {
    if (!bodyEl) return;
    
    const ok = tx.status !== 'failed';
    const scColor = ok ? '#4ade80' : '#f43f5e';
    const scText = ok ? 'Success' : 'Failed';
    
    const row = (label, valHtml) => {
        if (!valHtml && valHtml !== 0) return '';
        return `
        <div class="flex items-start gap-4 py-[15px]"
            style="border-bottom:1px solid rgba(255,255,255,0.06)">
            <span class="text-[13px] flex-shrink-0" style="color:#5a6070;min-width:120px">${label}</span>
            <span class="text-[13px] text-right flex-1 break-all leading-snug" style="color:#d1d5db">${valHtml}</span>
        </div>`;
    };
    
    const hashRow = hash ? `
        <div class="flex items-start gap-4 py-[15px]"
            style="border-bottom:1px solid rgba(255,255,255,0.06)">
            <span class="text-[13px] flex-shrink-0" style="color:#5a6070;min-width:120px">Hash</span>
            <div class="flex items-start gap-2 flex-1 justify-end">
                <span class="text-[12px] text-right break-all leading-snug font-mono"
                    style="color:#60a5fa;word-break:break-all">${hash}</span>
                <button onclick="window.copyAddress(event,'${hash}')"
                    class="flex-shrink-0 mt-[2px] transition-colors" style="color:#5a6070"
                    onmouseover="this.style.color='#d1d5db'" onmouseout="this.style.color='#5a6070'">
                    <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                </button>
            </div>
        </div>` : '';
    
    const amtRow = `
        <div class="flex items-start gap-4 py-[15px]"
            style="border-bottom:1px solid rgba(255,255,255,0.06)">
            <span class="text-[13px] flex-shrink-0" style="color:#5a6070;min-width:120px">Amount</span>
            <span class="text-[13px] text-right flex-1 leading-snug">${_amtModalHtml(tx)}</span>
        </div>`;
    
    const contractRow = tx.contractAddress ? `
        <div class="flex items-start gap-4 py-[15px]"
            style="border-bottom:1px solid rgba(255,255,255,0.06)">
            <span class="text-[13px] flex-shrink-0 leading-tight" style="color:#5a6070;min-width:120px">Contract<br>Address</span>
            <span class="text-[12px] text-right flex-1 break-all leading-snug font-mono" style="color:#d1d5db">${_esc(tx.contractAddress)}</span>
        </div>` : '';
    
    bodyEl.innerHTML = `
        <div class="px-5 pt-1 pb-4">
            ${row('Status',    `<span style="color:${scColor};font-weight:700">${scText}</span>`)}
            ${row('Type',      _typeLabel(tx.type))}
            ${hashRow}
            ${tx.block     ? row('Height',   _esc(String(tx.block))) : ''}
            ${tx.from      ? row('From',     `<span class="font-mono text-[12px]">${_esc(tx.from)}</span>`) : ''}
            ${tx.to        ? row('To',       `<span class="font-mono text-[12px]">${_esc(tx.to)}</span>`) : ''}
            ${contractRow}
            ${amtRow}
            ${tx.fee       ? row('Fee',      _esc(tx.fee)) : ''}
            ${tx.gas_used  ? row('Gas Used', `${_esc(String(tx.gas_used))} / ${_esc(String(tx.gas_wanted||'?'))}`) : ''}
            ${tx.memo      ? row('Memo',     _esc(tx.memo)) : ''}
            ${row('Timestamp', _dateFull(tx.timestamp))}
            ${tx.raw_log ? `
            <div class="mt-3 p-4 rounded-xl"
                style="border:1px solid rgba(244,63,94,0.2);background:rgba(244,63,94,0.04)">
                <div class="text-[10px] font-black uppercase mb-1" style="color:#f43f5e">Error Log</div>
                <div class="text-[11px] font-mono break-all" style="color:rgba(244,63,94,0.7)">${_esc(tx.raw_log)}</div>
            </div>` : ''}
        </div>

        <div class="px-5 pb-5 flex-shrink-0">
            <a href="https://winscan.winsnip.xyz/tx/${hash}" target="_blank"
                class="flex items-center justify-center w-full py-3 rounded-xl transition-all text-[12px] font-semibold"
                style="border:1px solid rgba(255,255,255,0.1);color:#8a9099"
                onmouseover="this.style.color='#d1d5db';this.style.borderColor='rgba(255,255,255,0.25)'"
                onmouseout="this.style.color='#8a9099';this.style.borderColor='rgba(255,255,255,0.1)'">
                View on Explorer
            </a>
        </div>`;
}

// =============================================================
// COMPAT
// =============================================================
window.openTxDetailModal = function(hash) {
    window.showTransactionDetailModal(hash);
};

if (window.WalletUI) {
    window.WalletUI.loadHistory = function() {
        window.renderTransactionHistory();
    };
}