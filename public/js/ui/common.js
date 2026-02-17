// ============================================
// UI.JS - UI Interactions & Modal Management
// ============================================

// ===== SHOW/HIDE CONNECT MODAL =====
window.showConnectModal = function() {
    window.removeClass('connectModal', 'hidden');
    window.addClass('connectModal', 'flex');
};

window.hideConnectModal = function() {
    window.addClass('connectModal', 'hidden');
    window.removeClass('connectModal', 'flex');
};


// ===== DONATION MODAL =====
window.showDonationModal = function() {
    window.removeClass('donationModal', 'hidden');
};

window.hideDonationModal = function() {
    window.addClass('donationModal', 'hidden');
};

// ===== FAQ MODAL =====
window.showFAQ = function() {
    window.removeClass('faqModal', 'hidden');
};

window.hideFAQ = function() {
    window.addClass('faqModal', 'hidden');
};

window.toggleFAQ = function(element) {
    if (!element) return;
    const answer = element.nextElementSibling;
    if (!answer) return;

    document.querySelectorAll('.faq-answer').forEach(el => {
        if (el !== answer) {
            el.style.maxHeight = null;
            window.removeClass(el, 'open');
            if (el.previousElementSibling) {
                window.removeClass(el.previousElementSibling, 'active');
            }
        }
    });
    if (answer.style.maxHeight) {
        answer.style.maxHeight = null;
        window.removeClass(answer, 'open');
        window.removeClass(element, 'active');
    } else {
        window.addClass(answer, 'open');
        answer.style.maxHeight = answer.scrollHeight + "px";
        window.addClass(element, 'active');
    }
};

// ===== TOKEN SELECTOR MODAL =====
window.showTokenSelector = function() {
    window.removeClass('tokenModal', 'hidden');
    window.addClass('tokenModal', 'flex');
    window.renderTokenList();
};

window.hideTokenSelector = function() {
    window.addClass('tokenModal', 'hidden');
    window.removeClass('tokenModal', 'flex');
};

window.filterTokens = function() {
    window.renderTokenList(document.getElementById('tokenSearch')?.value);
};

window.renderTokenList = function(filter = '') {
    const container = document.getElementById('tokenList');
    const filtered = window.tokenAddresses.filter(addr => {
        const detail = window.tokenDetails.get(addr);
        const lowerFilter = filter.toLowerCase();
        return addr.toLowerCase().includes(lowerFilter) || 
               (detail && (detail.name.toLowerCase().includes(lowerFilter) || 
                          detail.symbol.toLowerCase().includes(lowerFilter)));
    });
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-400 py-8">No tokens found</div>';
        return;
    }
    
    container.innerHTML = filtered.map(addr => {
        const detail = window.tokenDetails.get(addr);
        const shortAddr = addr.slice(0, 8) + '...' + addr.slice(-6);
        
        if (!detail) {
            return `<div class="token-detail-item" onclick="window.selectPRC20('${addr}')">
                <div class="token-logo bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">?</div>
                <div class="flex-1">
                    <div class="font-mono text-sm text-gray-300">${shortAddr}</div>
                    <div class="text-xs text-gray-500 mt-1">Loading...</div>
                </div>
                <i class="fas fa-chevron-right text-gray-500"></i>
            </div>`;
        }
        
        return `<div class="token-detail-item" onclick="window.selectPRC20('${addr}')">
            ${detail.logo ? 
                `<img src="${detail.logo}" class="token-logo" alt="${detail.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" loading="lazy">
                <div class="token-logo bg-gradient-to-br from-purple-500 to-pink-500 items-center justify-center text-white font-bold text-lg" style="display:none;">${detail.symbol.charAt(0)}</div>` : 
                `<div class="token-logo bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">${detail.symbol.charAt(0)}</div>`
            }
            <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                    <span class="font-semibold text-sm">${detail.name}</span>
                    <span class="px-2 py-0.5 bg-purple-600/30 text-purple-300 rounded text-xs font-mono">${detail.symbol}</span>
                </div>
                <div class="flex items-center gap-2">
                    <code class="text-xs text-gray-400 font-mono">${shortAddr}</code>
                    <button onclick="window.copyAddress(event, '${addr}')" class="copy-btn flex-shrink-0">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button onclick="window.showTokenDetail(event, '${addr}')" class="copy-btn flex-shrink-0">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </div>
            </div>
            <i class="fas fa-chevron-right text-gray-500"></i>
        </div>`;
    }).join('');
};


window.txHistory = [];

window.renderTransactionHistory = async function() {
    const container = document.getElementById('tabContent') || document.getElementById('txHistoryList');
    if (!container) return;

    if (!window.wallet) {
        container.innerHTML = '<div class="text-center py-12 text-gray-500 text-[10px] font-black uppercase tracking-widest">Connect wallet to view history</div>';
        return;
    }

    container.innerHTML = '<div class="text-center py-12"><div class="spinner mx-auto scale-75"></div></div>';

    const history = await window.loadTransactionHistory(window.wallet.address);

    if (history.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-400 py-8 text-xs">No transactions found</div>';
        return;
    }
    
    container.innerHTML = history.map(tx => {
        const timeStr = new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const shortHash = tx.hash.slice(0, 10) + '...';
        const typeColor = tx.type === 'Swap' ? 'text-up' : (tx.type === 'Transfer' ? 'text-blue-400' : 'text-gray-400');
        
        return `<div class="border-b border-border p-3 hover:bg-card/30 cursor-pointer flex items-center justify-between" onclick="window.open('https://winscan.winsnip.xyz/tx/${tx.hash}', '_blank')">
            <div>
                <div class="text-[10px] font-bold ${typeColor}">${tx.type.toUpperCase()}</div>
                <div class="text-xs font-mono text-gray-300">${tx.amount.toFixed(4)} ${tx.denom === 'upaxi' ? 'PAXI' : tx.denom}</div>
            </div>
            <div class="text-right">
                <div class="text-[10px] text-gray-500 font-mono">${shortHash}</div>
                <div class="text-[9px] text-gray-600">${timeStr}</div>
            </div>
        </div>`;
    }).join('');
};

// ===== SWAP SIDEBAR TOGGLE (CROSS-BROWSER) =====
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;

    body.addEventListener('click', (e) => {
        const sidebar = document.getElementById('swapSidebar');
        if (!sidebar) return;

        // Toggle button clicked
        if (e.target.closest('.swap-toggle')) {
            e.stopPropagation();
            
            // Cross-browser compatible toggle
            if (sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                body.classList.remove('no-scroll');
            } else {
                sidebar.classList.add('open');
                body.classList.add('no-scroll');
            }
            return;
        }

        // Click outside sidebar → close
        if (sidebar.classList.contains('open') && !e.target.closest('#swapSidebar')) {
            sidebar.classList.remove('open');
            body.classList.remove('no-scroll');
        }
    });

    // ESC key to close sidebar
    document.addEventListener('keydown', (e) => {
        const sidebar = document.getElementById('swapSidebar');
        if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            body.classList.remove('no-scroll');
        }
    });
});

// ===== ERROR MODAL =====
window.showError = function(message) {
    const modal = document.getElementById('errorModal');
    if (modal) {
        window.setText('errorText', message);
        modal.classList.remove('hidden');
    } else {
            }
};

// ===== UPDATE DASHBOARD =====
window.updateDashboard = function(detail) {
    if (!detail) return;
    const address = window.currentPRC20;

    // Header Info
    window.setText('selectedPair', `${detail.symbol}/PAXI`);
    window.setText('currentPrice', window.formatPrice(detail.price_paxi) + ' PAXI');

    const changeEl = document.getElementById('priceChange');
    if (changeEl) {
        const val = (detail.price_change_24h * 100).toFixed(2);
        window.setText(changeEl, (val >= 0 ? '+' : '') + val + '%');
        changeEl.className = `text-xs font-bold px-1.5 py-0.5 rounded ${val >= 0 ? 'bg-up/10 text-up' : 'bg-down/10 text-down'}`;
    }

    // Header Stats
    window.setText('mcapVal', window.formatAmount(detail.market_cap) + ' PAXI');
    window.setText('liqVal', window.formatAmount(detail.liquidity) + ' PAXI');
    window.setText('volVal', window.formatAmount(detail.volume_24h) + ' PAXI');
    window.setText('high24h', window.formatPrice(detail.high_24h || detail.price_paxi));
    window.setText('low24h', window.formatPrice(detail.low_24h || detail.price_paxi));

    // Trade Signal Logic
    const signalEl = document.getElementById('tradeSignal');
    if (signalEl) {
        const change = detail.price_change_24h;
        if (change >= 0.05) {
            window.setText(signalEl, 'Strong Buy');
            signalEl.className = 'text-[10px] font-black uppercase tracking-tighter text-up';
        } else if (change > 0) {
            window.setText(signalEl, 'Bullish');
            signalEl.className = 'text-[10px] font-black uppercase tracking-tighter text-up opacity-80';
        } else if (change <= -0.05) {
            window.setText(signalEl, 'Strong Sell');
            signalEl.className = 'text-[10px] font-black uppercase tracking-tighter text-down';
        } else if (change < 0) {
            window.setText(signalEl, 'Bearish');
            signalEl.className = 'text-[10px] font-black uppercase tracking-tighter text-down opacity-80';
        } else {
            window.setText(signalEl, 'Neutral');
            signalEl.className = 'text-[10px] font-black uppercase tracking-tighter text-gray-500';
        }
    }

    // Trading Stats Panel
    window.setText('buyCount', detail.buys.toLocaleString());
    window.setText('sellCount', detail.sells.toLocaleString());
    window.setText('txCount', detail.txs_count.toLocaleString());

    const totalTrade = detail.buys + detail.sells;
    const buyRatio = totalTrade > 0 ? (detail.buys / totalTrade) * 100 : 50;
    const bar = document.getElementById('buyRatioBar');
    if (bar) bar.style.width = buyRatio + '%';

    // LP Stats Panel
    window.setText('resPaxi', window.formatAmount(detail.reserve_paxi / 1000000, 2));
    window.setText('resToken', window.formatAmount(detail.reserve_prc20 / Math.pow(10, detail.decimals), 2));
    window.setText('resTokenLabel', detail.symbol + ' Reserve');
    window.setText('holderCount', detail.holders.toLocaleString());

    // Token Info Panel
    window.setText('caAddr', address);
    const minter = document.getElementById('minterStatus');
    if (minter) {
        window.setText(minter, detail.minting_disabled ? 'Enabled' : 'Disabled');
        minter.className = detail.minting_disabled ? 'text-red-400 font-bold' : 'text-green-400 font-bold';
    }

    // Logo
    const logoEl = document.getElementById('tokenLogo');
    if (logoEl) {
        if (detail.logo) {
            window.setHtml(logoEl, `<img src="${detail.logo}" class="w-full h-full object-cover" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-coins text-gray-600\\'></i>'">`);
        } else {
            window.setHtml(logoEl, `<span class="text-gray-400">${detail.symbol.charAt(0)}</span>`);
        }
    }


    // Social Links
    const socials = document.getElementById('socialLinks');
    if (socials) {
        socials.innerHTML = '';
        if (detail.website) socials.innerHTML += `<a href="${detail.website}" target="_blank" class="w-6 h-6 flex items-center justify-center bg-card rounded border border-border hover:text-up"><i class="fas fa-globe"></i></a>`;
        if (detail.project) socials.innerHTML += `<a href="${detail.project}" target="_blank" class="w-6 h-6 flex items-center justify-center bg-card rounded border border-border hover:text-blue-400"><i class="fab fa-twitter"></i></a>`;
    }

    // Swap Panel Integration
    window.setText('recvTokenSymbol', detail.symbol);
    window.updateTradeBalances();
};

// ===== SWAP UI HELPERS =====
window.tradeType = 'buy'; // 'buy' or 'sell'

window.setTradeType = function(type) {
    window.tradeType = type;
    const buyTab = document.getElementById('buyTab');
    const sellTab = document.getElementById('sellTab');

    if (type === 'buy') {
        if (buyTab) buyTab.className = 'py-2 rounded-lg text-sm font-bold transition-all bg-up text-bg';
        if (sellTab) sellTab.className = 'py-2 rounded-lg text-sm font-bold transition-all text-gray-400 hover:text-white';
        window.setText('payTokenSymbol', 'PAXI');
        window.setText('recvTokenSymbol', window.currentTokenInfo?.symbol || 'TOKEN');
    } else {
        if (sellTab) sellTab.className = 'py-2 rounded-lg text-sm font-bold transition-all bg-down text-white';
        if (buyTab) buyTab.className = 'py-2 rounded-lg text-sm font-bold transition-all text-gray-400 hover:text-white';
        window.setText('payTokenSymbol', window.currentTokenInfo?.symbol || 'TOKEN');
        window.setText('recvTokenSymbol', 'PAXI');
    }
    window.updateTradeBalances();
};

window.updateTradeBalances = async function() {
    if (!window.wallet) return;

    // Fetch fresh PAXI balance dari blockchain
    const balData = await window.smartFetch(
        `${window.APP_CONFIG.LCD}/cosmos/bank/v1beta1/balances/${window.wallet.address}`
    );
    const paxiBalance = balData.balances.find(b => b.denom === 'upaxi');
    const paxiAmount = paxiBalance ? parseInt(paxiBalance.amount) / 1e6 : 0;

    // Fetch fresh PRC20 balance dari blockchain
    let prc20Amount = 0;
    if (window.currentPRC20) {
        const tokenDecimals = window.currentTokenInfo?.decimals || 6;
        const bal = await window.getPRC20Balance(window.wallet.address, window.currentPRC20);
        prc20Amount = bal / Math.pow(10, tokenDecimals);
    }

    if (window.tradeType === 'buy') {
        window.setText('payBalance', paxiAmount.toFixed(4));
        window.setText('recvBalance', prc20Amount.toFixed(4));
    } else {
        window.setText('payBalance', prc20Amount.toFixed(4));
        window.setText('recvBalance', paxiAmount.toFixed(4));
    }

    // Update Header Wallet Info
    window.setText('walletAddrShort', window.shortenAddress(window.wallet.address));
    window.setText('walletBalance', paxiAmount.toFixed(2) + ' PAXI');
    window.removeClass('walletInfo', 'hidden');

    // Mobile specific update
    window.setText('mobileWalletBalance', paxiAmount.toFixed(2) + ' PAXI');
    window.removeClass('mobileWalletInfo', 'hidden');
    window.addClass('mobileConnectBtn', 'hidden');
};


window.copyAddrText = function() {
    if (!window.currentPRC20) return;
    navigator.clipboard.writeText(window.currentPRC20);
    };

window.showSlippageModal = function() {
    window.removeClass('slippageModal', 'hidden');
    if (window.slippage) {
        window.setValue('customSlippage', window.slippage);
    }
};

window.setTab = function(name) {
    document.querySelectorAll('.tab-btn').forEach(b => window.removeClass(b, 'active'));
    const btn = document.getElementById('tab-' + name);
    if (btn) window.addClass(btn, 'active');

    if (name === 'holders') {
        window.loadTokenHolders();
    } else {
        window.renderTransactionHistory();
    }
};

// ===== UNIFIED SIDEBAR TAB MANAGEMENT =====
window.currentSidebarTab = 'wallet';

window.setSidebarTab = function(tab) {
    window.currentSidebarTab = tab;

    // Update tab styles
    const tabs = ['wallet', 'swap', 'history', 'lp', 'send', 'burn', 'donate'];
    tabs.forEach(t => {
        const btn = document.getElementById('side-tab-' + t);
        if (btn) {
            window.removeClass(btn, 'text-up');
            window.removeClass(btn, 'border-up');
            window.removeClass(btn, 'border-b-2');
            window.addClass(btn, 'text-gray-500');
        }
    });

    const activeBtn = document.getElementById('side-tab-' + tab);
    if (activeBtn) {
        window.addClass(activeBtn, 'text-up');
        window.addClass(activeBtn, 'border-up');
        window.addClass(activeBtn, 'border-b-2');
        window.removeClass(activeBtn, 'text-gray-500');
    }

    window.renderSidebarContent(tab);
};

window.renderSidebarContent = function(tab) {
    const container = document.getElementById('sidebarContent');
    if (!container) return;

    // Upgraded wallet handles its own 'no wallet' state
    if (!window.wallet && tab !== 'swap' && tab !== 'wallet') {
        container.innerHTML = `
            <div class="text-center py-20 text-gray-600">
                <i class="fas fa-wallet text-4xl mb-4 opacity-20"></i>
                <p class="text-xs font-bold uppercase tracking-widest">Connect wallet to view ${tab}</p>
                <button onclick="window.showConnectModal()" class="mt-6 px-6 py-2 bg-up/10 text-up border border-up/20 rounded-xl text-[10px] font-black uppercase">Connect Now</button>
            </div>
        `;
        return;
    }

    switch(tab) {
        case 'wallet':
            if (window.WalletUI) window.WalletUI.renderDashboard();
            break;
        case 'swap':
            window.renderSwapTerminal();
            break;
        case 'history':
            window.renderTransactionHistorySidebar();
            break;
        case 'lp':
            window.renderLPTerminal();
            break;
        case 'remove_lp':
            window.renderRemoveLPTerminal();
            break;
        case 'send':
            window.renderSendTerminal();
            break;
        case 'burn':
            window.renderBurnTerminal();
            break;
        case 'donate':
            window.renderDonateTerminal();
            break;
    }
};
