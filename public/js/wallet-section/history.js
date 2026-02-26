/* global window, document, fetch */

window.WalletHistory = {
    init() {},
    async loadHistory() {
        const addr = window.selectedAddress || window.currentAddress || (window.wallet && window.wallet.address);
        if (addr && !window.historyIsLoading) {
            if (window.txHistory.length === 0 && !window.historyIsEnd) {
                window.historyIsLoading = true;
                window.renderTransactionHistory?.();
                try {
                    const result = await window.loadTransactionHistory(addr, 1);
                    if (Array.isArray(result)) {
                        window.txHistory = result;
                        window.historyPage = 1;
                    }
                } catch (e) {
                    console.error('[History] Load failed:', e);
                } finally {
                    window.historyIsLoading = false;
                }
            }
        }
        window.renderTransactionHistory?.();
    }
};

window.txHistory = [];
window._txCache = window._txCache || [];
window.historyPage = 1;
window.historyIsEnd = false;
window.historyIsLoading = false;

(function() {
    const _orig = window.loadTransactionHistory;
    if (!_orig || _orig._patched) return;
    
    window.loadTransactionHistory = async function(address, page) {
        const result = await _orig.call(this, address, page);
        
        if (Array.isArray(result)) {
            result.forEach(tx => {
                if (tx && tx.hash && !window._txCache.find(c => c.hash === tx.hash)) {
                    window._txCache.push(tx);
                }
            });
            
            if (result.length === 0) window.historyIsEnd = true;
        }
        
        return result;
    };
    
    window.loadTransactionHistory._patched = true;
})();


function _fmt(n, dec = 4) {
    return Number(Math.abs(n || 0)).toLocaleString(undefined, { maximumFractionDigits: dec });
}

function _esc(s) {
    return String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function _typeLabel(type) {
    const MAP = {
        send: 'Send',
        receive: 'Receive',
        swap: 'Swap',
        provide_liquidity: 'Add Liquidity',
        withdraw_liquidity: 'Remove Liquidity',
        burn: 'Burn'
    };
    return MAP[(type || '').toLowerCase()] || (type || 'unknown').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function _timeLabel(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const diff = Date.now() - d.getTime();
    const D3 = 3 * 86400000;
    if (diff < D3) {
        const s = Math.floor(diff / 1000);
        const m = Math.floor(s / 60);
        const h = Math.floor(m / 60);
        const day = Math.floor(h / 24);
        if (day > 0) return `${day}d ago`;
        if (h > 0) return `${h}h ago`;
        if (m > 0) return `${m}m ago`;
        return 'just now';
    }
    return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;
}

function _dateFull(ts) {
    if (!ts) return '—';
    const d = new Date(ts);
    const pad = n => String(n).padStart(2, '0');
    return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} ${pad(d.getHours())}.${pad(d.getMinutes())}.${pad(d.getSeconds())}`;
}

// FontAwesome required: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
function _txIcon(type) {
    switch ((type || '').toLowerCase()) {
        case 'receive':
            return { icon: 'fas fa-arrow-down', color: '#4ade80' };
        case 'send':
            return { icon: 'fas fa-arrow-up', color: '#f43f5e' };
        case 'swap':
            return { icon: 'fas fa-arrow-right-arrow-left', color: '#3b82f6' };
        case 'provide_liquidity':
            return { icon: 'fas fa-droplet', color: '#06b6d4' };
        case 'withdraw_liquidity':
            return { icon: 'fas fa-droplet-slash', color: '#8b5cf6' };
        case 'burn':
            return { icon: 'fas fa-fire-flame-curved', color: '#f97316' };
        default:
            return { icon: 'fas fa-circle-dot', color: '#94a3b8' };
    }
}

function _counterpart(tx) {
    const type = (tx.type || '').toLowerCase();
    if (['swap', 'provide_liquidity', 'withdraw_liquidity', 'burn'].includes(type)) return '';
    const addr = type === 'receive' ? tx.from : tx.to;
    if (!addr) return '';
    return `${addr.slice(0,8)}…${addr.slice(-5)}`;
}

function _amtRowHtml(tx) {
    const amounts = Array.isArray(tx.amounts) ? tx.amounts : [];
    const type = (tx.type || '').toLowerCase();
    
    if (!amounts.length) {
        return `<span style="color:#94a3b8;font-weight:700">${_typeLabel(tx.type)}</span>`;
    }
    
    if (type === 'swap') {
        const give = amounts.find(a => Number(a.amount) < 0);
        const receive = amounts.find(a => Number(a.amount) > 0);
        if (give && receive) {
            return `<span style="color:#4ade80;font-weight:700">
                ${_fmt(Math.abs(give.amount))} ${_esc(give.token)} &nbsp;⇄&nbsp; ${_fmt(receive.amount)} ${_esc(receive.token)}
            </span>`;
        }
        return `<span style="color:#4ade80;font-weight:700">${amounts.map(a => `${_fmt(a.amount)} ${_esc(a.token)}`).join(' ⇄ ')}</span>`;
    }
    
    if (type === 'provide_liquidity' || type === 'withdraw_liquidity') {
        const color = type === 'withdraw_liquidity' ? '#4ade80' : '#f43f5e';
        return `<span style="color:${color};font-weight:700">${amounts.map(a => `${_fmt(Math.abs(a.amount))} ${_esc(a.token)}`).join(' + ')}</span>`;
    }
    
    const total = amounts.reduce((s, a) => s + Number(a.amount || 0), 0);
    const token = amounts[0]?.token || '';
    const positive = total > 0;
    
    // Perbaikan: cek jika send ke alamat sendiri (from === to), maka hijau
    const isSelfSend = type === 'send' && tx.from && tx.to && tx.from.toLowerCase() === tx.to.toLowerCase();
    const displayColor = isSelfSend ? '#4ade80' : (positive ? '#4ade80' : '#f43f5e');
    const prefix = isSelfSend ? '' : (positive ? '+' : '-');
    
    return `<span style="color:${displayColor};font-weight:700">${prefix} ${_fmt(Math.abs(total))} ${_esc(token)}</span>`;
}

function _amtModalHtml(tx) {
    const amounts = Array.isArray(tx.amounts) ? tx.amounts : [];
    if (!amounts.length) return '<span style="color:#6b7280">—</span>';
    const type = (tx.type || '').toLowerCase();
    
    if (type === 'swap') {
        const give = amounts.find(a => Number(a.amount) < 0);
        const receive = amounts.find(a => Number(a.amount) > 0);
        if (give && receive) {
            return `<span style="color:#4ade80">
                ${_fmt(Math.abs(give.amount), 6)} ${_esc(give.token)}
                &nbsp;⇄&nbsp;
                ${_fmt(receive.amount, 6)} ${_esc(receive.token)}
            </span>`;
        }
    }
    
    return amounts.map(a => {
        const val = Number(a.amount || 0);
        const pos = val > 0;
        return `<span style="color:${pos ? '#4ade80' : '#f43f5e'}">${pos ? '+' : '-'} ${_fmt(Math.abs(val), 6)} ${_esc(a.token)}</span>`;
    }).join('<br>');
}

function _buildTxRowHtml(tx) {
    const icon = _txIcon(tx.type);
    const amt = _amtRowHtml(tx);
    const cp = _counterpart(tx);
    const time = _timeLabel(tx.timestamp);
    const block = tx.block ? `#${tx.block}` : '';
    const hash = (tx.hash || '').replace(/'/g, "\\'");
    
    return `
    <div onclick="window.showTransactionDetailModal('${hash}')"
         class="flex items-center gap-3 px-2 py-[14px]
                border-b border-white/[0.06]
                cursor-pointer hover:bg-white/[0.025]
                transition-colors select-none">

        <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center">
            <i class="${icon.icon}" style="color:${icon.color};font-size:18px"></i>
        </div>

        <div class="flex-1 min-w-0 overflow-hidden">
            <div class="text-[13px] leading-snug truncate">${amt}</div>
            <div class="text-[11px] font-mono mt-[3px] truncate" style="color:#6b7280">
                ${cp ? `${cp}&nbsp;&nbsp;` : ''}${time}
            </div>
        </div>

        <div class="flex-shrink-0 pl-1 text-right">
            <div class="text-[10px] font-mono" style="color:#5a6070">${block}</div>
        </div>
    </div>`;
}

window.renderTransactionHistory = function(customContainerId) {
    let cont = customContainerId ? document.getElementById(customContainerId) : (document.getElementById('history-container') || document.getElementById('transaction-history-container') || document.getElementById('tabContent'));
    if (!cont) return;

    const addr = window.selectedAddress || window.currentAddress || (window.wallet && window.wallet.address);
    if (!addr) {
        cont.innerHTML = `
        <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div class="w-12 h-12 bg-secondary border border-secondary shadow-brutal flex items-center justify-center text-muted-text text-xl mb-4 rotate-[-10deg]">
                <i class="fas fa-plug"></i>
            </div>
            <p class="font-display text-lg text-muted-text uppercase italic mb-4">Connect wallet to view history</p>
            <button onclick="showConnectModal()" class="px-6 py-2 bg-accent text-black font-display text-sm border border-secondary shadow-brutal hover:shadow-none transition-all uppercase italic">Connect Wallet</button>
        </div>`;
        return;
    }

    // Trigger initial load if empty
    if (window.txHistory.length === 0 && !window.historyIsLoading && !window.historyIsEnd) {
        window.WalletHistory.loadHistory();
    }
    
    if (window.historyIsLoading && window.txHistory.length === 0) {
        cont.innerHTML = `
        <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div style="color:#5a6070" class="text-[13px] mb-3 font-medium">Fetching transactions...</div>
            <div class="w-7 h-7 border-[2.5px] border-meme-green border-t-transparent rounded-full animate-spin"></div>
        </div>`;
        return;
    }
    
    if (window.txHistory.length === 0) {
        cont.innerHTML = `
        <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div style="color:#5a6070" class="text-[13px]">No transactions yet</div>
        </div>`;
        return;
    }
    
    const rows = window.txHistory.map(_buildTxRowHtml).join('');
    const loadBtn = window.historyIsEnd ?
        '' :
        `<div class="px-5 py-4">
            <button onclick="window.loadMoreHistory()" class="w-full py-3 rounded-xl text-[12px] font-semibold transition-all" style="border:1px solid rgba(255,255,255,0.08);color:#8a9099" onmouseover="this.style.borderColor='rgba(255,255,255,0.15)';this.style.color='#d1d5db'" onmouseout="this.style.borderColor='rgba(255,255,255,0.08)';this.style.color='#8a9099'">
                Load More
            </button>
        </div>`;
    
    cont.innerHTML = `
    <div style="max-height:calc(100vh - 300px);overflow-y:auto;-webkit-overflow-scrolling:touch" class="no-scrollbar">
        ${rows}
    </div>
    ${loadBtn}`;
};

window.loadMoreHistory = async function() {
    const addr = window.selectedAddress || window.currentAddress || (window.wallet && window.wallet.address);
    if (!addr || window.historyIsEnd || window.historyIsLoading) return;
    
    const btn = (window.event && window.event.target) || document.querySelector('[onclick="window.loadMoreHistory()"]');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-circle-notch animate-spin mr-2"></i>Loading...';
    }
    
    window.historyIsLoading = true;
    window.historyPage++;
    try {
        const result = await window.loadTransactionHistory(addr, window.historyPage);
        if (Array.isArray(result)) {
            window.txHistory = window.txHistory.concat(result);
            window.renderTransactionHistory();
        }
    } catch (e) {
        console.error('loadMoreHistory', e);
    } finally {
        window.historyIsLoading = false;
    }
    
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Load More';
    }
};

window.showTransactionDetailModal = async function(hash) {
    if (!hash) return;
    
    const cached = window._txCache.find(t => t.hash === hash) || window.txHistory.find(t => t.hash === hash);
    
    const modal = document.createElement('div');
    modal.className = '_tx_modal_wrap fixed inset-0 z-[600] flex items-end sm:items-center justify-center';
    modal.style.background = 'rgba(8,10,14,0.88)';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    
    const bodyId = `_txmb_${Math.random().toString(36).slice(2,8)}`;
    
    modal.innerHTML = `
    <div style="background:#0f1217;max-height:90vh;border:1px solid rgba(255,255,255,0.08)"
         class="w-full sm:max-w-[640px] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl">

        <div class="flex items-center justify-between px-5 py-[14px] flex-shrink-0"
             style="border-bottom:1px solid rgba(255,255,255,0.08)">
            <button onclick="this.closest('._tx_modal_wrap').remove()" class="w-8 h-8 flex items-center justify-center -ml-1" style="color:#6b7280">
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
    
    if (cached) _paintModal(getBody(), _enrichTx(null, hash, cached), hash);
    
    if (typeof window.fetchTxDetail === 'function') {
        try {
            const rpc = await window.fetchTxDetail(hash);
            if (rpc) _paintModal(getBody(), _enrichTx(rpc, hash, cached), hash);
        } catch (e) {
            console.warn('fetchTxDetail failed', e);
        }
    }
};

function _enrichTx(rpc, hash, fallback) {
    const tr = rpc?.tx_response || {};
    const txProto = rpc?.tx || {};
    let fee = null;
    try {
        const coins = txProto?.auth_info?.fee?.amount || [];
        if (coins.length) {
            const c = coins[0];
            fee = `${(Number(c.amount) || 0) / 1e6} ${c.denom === 'upaxi' ? 'PAXI' : (c.denom || '').replace(/^u/, '').toUpperCase()}`;
        }
    } catch (_) {}
    
    const fallbackAmounts = fallback?.amounts || [];
    
    const final = {
        hash,
        status: (tr.code === 0 || tr.code === undefined) ? 'success' : 'failed',
        type: (fallback?.type || (tr.tags && tr.tags.type) || 'unknown'),
        block: tr.height || fallback?.block || null,
        timestamp: tr.timestamp || fallback?.timestamp || null,
        from: fallback?.from || (tr?.tx?.body?.messages?.[0]?.from_address) || null,
        to: fallback?.to || (tr?.tx?.body?.messages?.[0]?.to_address) || null,
        contractAddress: fallback?.contractAddress || null,
        amounts: (fallbackAmounts.length ? fallbackAmounts : (rpc?.amounts || [])),
        fee,
        memo: txProto?.body?.memo || fallback?.memo || null,
        gas_used: tr.gas_used || null,
        gas_wanted: tr.gas_wanted || null,
        raw_log: tr.code !== 0 ? tr.raw_log : null,
    };
    
    final.amounts = (Array.isArray(final.amounts) ? final.amounts : []).map(a => {
        if (a == null) return null;
        if (typeof a.amount === 'undefined' && typeof a.raw !== 'undefined') {
            return { token: a.token || (a.symbol || 'PRC20'), amount: Number(a.raw || 0), contractAddress: a.contractAddress || a.contract || null };
        }
        return { token: a.token || (a.symbol || 'PRC20'), amount: Number(a.amount || 0), contractAddress: a.contractAddress || a.contract || null };
    }).filter(Boolean);
    
    return final;
}

function _paintModal(bodyEl, tx, hash) {
    if (!bodyEl) return;
    
    const ok = tx.status !== 'failed';
    const scColor = ok ? '#4ade80' : '#f43f5e';
    const scText = ok ? 'Success' : 'Failed';
    
    const row = (label, valHtml) => {
        if (valHtml == null || valHtml === '') return '';
        return `
        <div class="flex items-start gap-4 py-[15px]" style="border-bottom:1px solid rgba(255,255,255,0.06)">
            <span class="text-[13px] flex-shrink-0" style="color:#5a6070;min-width:140px">${label}</span>
            <span class="text-[13px] text-right flex-1 break-all leading-snug" style="color:#d1d5db">${valHtml}</span>
        </div>`;
    };
    
    const hashRow = hash ? `
        <div class="flex items-start gap-4 py-[15px]" style="border-bottom:1px solid rgba(255,255,255,0.06)">
            <span class="text-[13px] flex-shrink-0" style="color:#5a6070;min-width:140px">Hash</span>
            <div class="flex items-start gap-2 flex-1 justify-end">
                <span class="text-[12px] text-right break-all leading-snug font-mono" style="color:#60a5fa;word-break:break-all">${_esc(hash)}</span>
                <button onclick="window.copyAddress(event,'${_esc(hash)}')" class="flex-shrink-0 mt-[2px] transition-colors" style="color:#5a6070" onmouseover="this.style.color='#d1d5db'" onmouseout="this.style.color='#5a6070'">
                    <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <rect x="9" y="9" width="13" height="13" rx="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                </button>
            </div>
        </div>` : '';
    
    const amtRow = `
        <div class="flex items-start gap-4 py-[15px]" style="border-bottom:1px solid rgba(255,255,255,0.06)">
            <span class="text-[13px] flex-shrink-0" style="color:#5a6070;min-width:140px">Amount</span>
            <span class="text-[13px] text-right flex-1 leading-snug">${_amtModalHtml(tx)}</span>
        </div>`;
    
    let contractHtml = '';
    if (tx.contractAddress) {
        const tokenAmt = tx.amounts?.find(a => a.contractAddress === tx.contractAddress);
        const tokenName = tokenAmt?.token && tokenAmt.token !== 'PRC20' ? ` <span style="color:#6b7280;font-size:11px">(${_esc(tokenAmt.token)})</span>` : '';
        contractHtml = `
        <div class="flex items-start gap-4 py-[15px]" style="border-bottom:1px solid rgba(255,255,255,0.06)">
            <span class="text-[13px] flex-shrink-0 leading-tight" style="color:#5a6070;min-width:140px">Contract<br>Address</span>
            <span class="text-[12px] text-right flex-1 break-all leading-snug font-mono" style="color:#d1d5db">${_esc(tx.contractAddress)}${tokenName}</span>
        </div>`;
    }
    
    bodyEl.innerHTML = `
    <div class="px-5 pt-1 pb-4">
        ${row('Status', `<span style="color:${scColor};font-weight:700">${scText}</span>`)}
        ${row('Type', _typeLabel(tx.type))}
        ${hashRow}
        ${tx.block ? row('Height', _esc(String(tx.block))) : ''}
        ${tx.from ? row('From', `<span class="font-mono text-[12px]">${_esc(tx.from)}</span>`) : ''}
        ${tx.to ? row('To', `<span class="font-mono text-[12px]">${_esc(tx.to)}</span>`) : ''}
        ${contractHtml}
        ${amtRow}
        ${tx.fee ? row('Fee', _esc(tx.fee)) : ''}
        ${tx.gas_used ? row('Gas Used', `${_esc(String(tx.gas_used))} / ${_esc(String(tx.gas_wanted||'?'))}`) : ''}
        ${tx.memo ? row('Memo', _esc(tx.memo)) : ''}
        ${row('Timestamp', _dateFull(tx.timestamp))}
        ${tx.raw_log ? `
            <div class="mt-3 p-4 rounded-xl" style="border:1px solid rgba(244,63,94,0.2);background:rgba(244,63,94,0.04)">
                <div class="text-[10px] font-black uppercase mb-1" style="color:#f43f5e">Error Log</div>
                <div class="text-[11px] font-mono break-all" style="color:rgba(244,63,94,0.7)">${_esc(tx.raw_log)}</div>
            </div>` : ''}
    </div>

    <div class="px-5 pb-5 flex-shrink-0">
        <a href="https://explorer.paxinet.io/txs/${_esc(hash)}" target="_blank"
           class="flex items-center justify-center w-full py-3 rounded-xl transition-all text-[12px] font-semibold"
           style="border:1px solid rgba(255,255,255,0.1);color:#8a9099"
           onmouseover="this.style.color='#d1d5db';this.style.borderColor='rgba(255,255,255,0.25)'"
           onmouseout="this.style.color='#8a9099';this.style.borderColor='rgba(255,255,255,0.1)'">
            View on Explorer
        </a>
    </div>`;
    
    if (bodyEl.parentElement) bodyEl.parentElement.scrollTop = 0;
}

window.copyAddress = (ev, text) => {
    ev?.stopPropagation?.();
    if (!text) return;
    try {
        navigator.clipboard.writeText(text);
        const t = ev?.target || ev?.currentTarget;
        const old = t?.innerHTML;
        if (t) {
            t.innerHTML = 'Copied';
            setTimeout(() => { if (t) t.innerHTML = old; }, 1000);
        }
    } catch (e) {
        console.warn('copy failed', e);
    }
};

window.renderTransactionHistorySidebar = function() {
    window.renderTransactionHistory('sidebarContent');
    // Ensure history is loaded when sidebar tab is opened
    if (window.WalletHistory && window.WalletHistory.loadHistory) {
        window.WalletHistory.loadHistory();
    }
};

window.openTxDetailModal = (hash) => window.showTransactionDetailModal(hash);
if (window.WalletUI) window.WalletUI.loadHistory = () => window.WalletHistory.loadHistory();

// Reset history on wallet changes to prevent cross-wallet data leakage
// and ensure fresh load for the new address.
function resetWalletHistory() {
    console.log('[History] Resetting data for new wallet');
    window.txHistory = [];
    window._txCache = [];
    window.historyPage = 1;
    window.historyIsEnd = false;
    window.historyIsLoading = false;

    // If the history tab is currently active, trigger a reload
    if (window.currentSidebarTab === 'wallet') {
        const historySec = document.getElementById('wallet-history-section');
        if (historySec && !historySec.classList.contains('hidden')) {
            window.WalletHistory.loadHistory();
        }
    }
}

window.addEventListener('paxi_active_wallet_changed', resetWalletHistory);
window.addEventListener('paxi_wallet_connected', resetWalletHistory);