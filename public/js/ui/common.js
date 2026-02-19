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
            el.classList.add('hidden');
            window.removeClass(el, 'open');
            if (el.previousElementSibling) {
                window.removeClass(el.previousElementSibling, 'active');
            }
        }
    });

    if (!answer.classList.contains('hidden')) {
        answer.classList.add('hidden');
        window.removeClass(answer, 'open');
        window.removeClass(element, 'active');
    } else {
        answer.classList.remove('hidden');
        window.addClass(answer, 'open');
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
    if (!container) return;

    const filtered = window.tokenAddresses.filter(addr => {
        const detail = window.tokenDetails.get(addr);
        const lowerFilter = filter.toLowerCase();
        return addr.toLowerCase().includes(lowerFilter) || 
               (detail && (detail.name.toLowerCase().includes(lowerFilter) || 
                          detail.symbol.toLowerCase().includes(lowerFilter)));
    });
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="text-center font-display text-2xl text-gray-700 py-12 uppercase italic">No Trash Detected</div>';
        return;
    }
    
    container.innerHTML = filtered.map(addr => {
        const detail = window.tokenDetails.get(addr);
        const shortAddr = addr.slice(0, 8) + '...' + addr.slice(-6);
        
        if (!detail) {
            return `
                <div class="p-6 border-b-2 border-black flex items-center gap-6 hover:bg-meme-surface cursor-pointer group transition-colors" onclick="window.selectPRC20('${addr}')">
                    <div class="w-14 h-14 bg-meme-card border-4 border-black shadow-brutal flex items-center justify-center font-display text-2xl text-gray-700 rotate-[-5deg]">?</div>
                    <div class="flex-1 min-w-0">
                        <div class="font-mono text-xs text-gray-500 font-bold truncate uppercase">${addr}</div>
                        <div class="font-display text-lg text-gray-700 italic uppercase">SYNCING...</div>
                    </div>
                    <i class="fas fa-chevron-right text-gray-800"></i>
                </div>`;
        }
        
        return `
            <div class="p-6 border-b-2 border-black flex items-center gap-6 hover:bg-meme-surface cursor-pointer group transition-colors" onclick="window.selectPRC20('${addr}')">
                <div class="relative rotate-[-5deg] group-hover:rotate-0 transition-transform">
                    <div class="w-16 h-16 bg-meme-card border-4 border-black shadow-brutal flex items-center justify-center font-display text-3xl overflow-hidden">
                        ${detail.logo ? `<img src="${detail.logo}" class="w-full h-full object-cover">` : `<span>${detail.symbol.charAt(0)}</span>`}
                    </div>
                    ${detail.verified ? `<div class="absolute -bottom-2 -right-2 w-6 h-6 bg-meme-green border-2 border-black flex items-center justify-center text-black text-[10px]"><i class="fas fa-check"></i></div>` : ''}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-3 mb-1">
                        <span class="font-display text-2xl text-white italic uppercase tracking-tighter">${detail.name}</span>
                        <span class="px-2 py-0.5 bg-black border border-black text-meme-cyan font-mono text-[9px] font-bold uppercase">${detail.symbol}</span>
                    </div>
                    <div class="flex items-center gap-4">
                        <code class="font-mono text-[10px] text-gray-600 uppercase font-bold truncate">${shortAddr}</code>
                        <div class="flex gap-2">
                            <button onclick="window.copyAddress(event, '${addr}')" class="text-meme-yellow hover:scale-125 transition-transform"><i class="fas fa-copy"></i></button>
                            <button onclick="window.showTokenDetail(event, '${addr}')" class="text-meme-cyan hover:scale-125 transition-transform"><i class="fas fa-info-circle"></i></button>
                        </div>
                    </div>
                </div>
                <i class="fas fa-chevron-right text-gray-800 group-hover:translate-x-2 transition-transform"></i>
            </div>`;
    }).join('');
};


window.txHistory = [];

window.renderTransactionHistory = async function() {
    const container = document.getElementById('tabContent') || document.getElementById('txHistoryList');
    if (!container) return;

    if (!window.wallet) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
                <div class="w-20 h-20 bg-meme-card border-4 border-black shadow-brutal flex items-center justify-center mb-8 rotate-[-10deg]">
                    <i class="fas fa-lock text-3xl text-gray-700"></i>
                </div>
                <p class="font-display text-2xl text-gray-600 uppercase italic">Connection Required</p>
                <button onclick="window.showConnectModal()" class="mt-6 px-8 py-3 bg-meme-cyan text-black font-display text-xl uppercase italic border-4 border-black shadow-brutal hover:shadow-none transition-all">CONNECT WALLET</button>
            </div>`;
        return;
    }

    container.innerHTML = '<div class="text-center py-20"><div class="w-12 h-12 border-4 border-meme-green border-t-transparent rounded-full animate-spin mx-auto"></div></div>';

    const history = await window.loadTransactionHistory(window.wallet.address);

    if (history.length === 0) {
        container.innerHTML = '<div class="text-center py-20 font-display text-2xl text-gray-700 uppercase italic">No transactions found</div>';
        return;
    }
    
    container.innerHTML = `
        <div class="overflow-x-auto no-scrollbar">
            <table class="w-full text-left border-collapse">
                <thead class="bg-black">
                    <tr class="font-display text-lg text-gray-500 uppercase italic border-b-4 border-black">
                        <th class="p-6">TYPE</th>
                        <th class="p-6">ASSET</th>
                        <th class="p-6">AMOUNT</th>
                        <th class="p-6">TIME</th>
                        <th class="p-6 text-right">ACTION</th>
                    </tr>
                </thead>
                <tbody class="divide-y-2 divide-black">
                    ${history.map(tx => {
                        const timeStr = new Date(tx.timestamp).toLocaleString();
                        const typeColor = tx.type === 'Swap' ? 'text-meme-green' : (tx.type === 'Transfer' ? 'text-meme-cyan' : 'text-white');
                        return `
                            <tr class="hover:bg-meme-card transition-colors group">
                                <td class="p-6"><span class="font-display text-2xl italic uppercase ${typeColor}">${tx.type}</span></td>
                                <td class="p-6"><span class="font-mono text-sm font-black text-meme-yellow uppercase tracking-tighter">${tx.symbol || 'PAXI'}</span></td>
                                <td class="p-6"><span class="font-mono text-sm font-bold text-white">${tx.amount.toFixed(4)}</span></td>
                                <td class="p-6"><span class="font-display text-lg text-gray-600 italic uppercase">${timeStr}</span></td>
                                <td class="p-6 text-right">
                                    <button onclick="window.showTransactionDetailModal('${tx.hash}')" class="px-4 py-2 bg-meme-surface border-2 border-black text-meme-cyan font-display text-lg italic uppercase shadow-brutal hover:shadow-none transition-all">HISTORY</button>
                                </td>
                            </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>`;
};

// ===== ERROR MODAL =====
window.showError = function(message) {
    const modal = document.getElementById('errorModal');
    if (modal) {
        window.setText('errorText', message);
        modal.classList.remove('hidden');
    } else {
        console.error("Critical Error:", message);
    }
};

// ===== UPDATE DASHBOARD =====
window.updateDashboard = function(detail) {
    if (!detail) return;
    const address = window.currentPRC20;

    window.setText('selectedPair', `${detail.symbol}/PAXI`);
    window.setText('currentPrice', window.formatPrice(detail.price_paxi) + ' PAXI');

    const changeEl = document.getElementById('priceChange');
    if (changeEl) {
        const val = (detail.price_change_24h * 100).toFixed(2);
        window.setText(changeEl, (val >= 0 ? '+' : '') + val + '%');
        changeEl.className = `font-display text-lg px-3 border-2 border-black italic ${val >= 0 ? 'bg-meme-green text-black' : 'bg-meme-pink text-white'}`;
    }

    window.setText('mcapVal', window.formatAmount(detail.market_cap) + ' PAXI');
    window.setText('liqVal', window.formatAmount(detail.liquidity) + ' PAXI');
    window.setText('volVal', window.formatAmount(detail.volume_24h) + ' PAXI');
    window.setText('high24h', window.formatPrice(detail.high_24h || detail.price_paxi));
    window.setText('low24h', window.formatPrice(detail.low_24h || detail.price_paxi));

    const signalEl = document.getElementById('tradeSignal');
    if (signalEl) {
        const change = detail.price_change_24h;
        if (change >= 0.05) {
            window.setText(signalEl, 'GIGA BULL');
            signalEl.className = 'font-display text-xl uppercase italic text-meme-green';
        } else if (change > 0) {
            window.setText(signalEl, 'MOONING');
            signalEl.className = 'font-display text-xl uppercase italic text-meme-green opacity-70';
        } else if (change <= -0.05) {
            window.setText(signalEl, 'TOTAL REKT');
            signalEl.className = 'font-display text-xl uppercase italic text-meme-pink';
        } else if (change < 0) {
            window.setText(signalEl, 'BLEEDING');
            signalEl.className = 'font-display text-xl uppercase italic text-meme-pink opacity-70';
        } else {
            window.setText(signalEl, 'STAGNANT');
            signalEl.className = 'font-display text-xl uppercase italic text-gray-500';
        }
    }

    window.setText('buyCount', detail.buys.toLocaleString());
    window.setText('sellCount', detail.sells.toLocaleString());
    window.setText('txCount', detail.txs_count.toLocaleString());

    const totalTrade = detail.buys + detail.sells;
    const buyRatio = totalTrade > 0 ? (detail.buys / totalTrade) * 100 : 50;
    const bar = document.getElementById('buyRatioBar');
    if (bar) {
        bar.className = `h-full bg-meme-green transition-all duration-500 w-[${buyRatio}%]`;
    }

    window.setText('resPaxi', window.formatAmount(detail.reserve_paxi / 1000000, 2));
    window.setText('resToken', window.formatAmount(detail.reserve_prc20 / Math.pow(10, detail.decimals), 2));
    window.setText('resTokenLabel', detail.symbol + ' STOCK');
    window.setText('holderCount', detail.holders.toLocaleString());

    window.setText('caAddr', address);
    const minter = document.getElementById('minterStatus');
    if (minter) {
        window.setText(minter, detail.minting_disabled ? 'OPENED' : 'RUG-PROOF');
        minter.className = detail.minting_disabled ? 'text-meme-pink font-display text-xl uppercase italic' : 'text-meme-green font-display text-xl uppercase italic';
    }

    const logoEl = document.getElementById('tokenLogo');
    if (logoEl) {
        if (detail.logo) {
            window.setHtml(logoEl, `<img src="${detail.logo}" class="w-full h-full object-cover">`);
        } else {
            window.setHtml(logoEl, `<span class="text-black font-display text-3xl">${detail.symbol.charAt(0)}</span>`);
        }
    }

    const socials = document.getElementById('socialLinks');
    if (socials) {
        socials.innerHTML = '';
        if (detail.website) socials.innerHTML += `<a href="${detail.website}" target="_blank" class="w-10 h-10 flex items-center justify-center bg-black border-2 border-black text-white hover:text-meme-green shadow-brutal hover:shadow-none transition-all"><i class="fas fa-globe"></i></a>`;
        if (detail.project) socials.innerHTML += `<a href="${detail.project}" target="_blank" class="w-10 h-10 flex items-center justify-center bg-black border-2 border-black text-white hover:text-meme-cyan shadow-brutal hover:shadow-none transition-all"><i class="fab fa-twitter"></i></a>`;
    }

    window.setText('recvTokenSymbol', detail.symbol);
    window.updateTradeBalances();
};

// ===== SWAP UI HELPERS =====
window.tradeType = 'buy';

window.setTradeType = function(type) {
    window.tradeType = type;
    const buyTab = document.getElementById('buyTab');
    const sellTab = document.getElementById('sellTab');
    if (type === 'buy') {
        if (buyTab) buyTab.className = 'flex-1 py-3 font-display text-2xl bg-meme-green text-black shadow-brutal uppercase italic';
        if (sellTab) sellTab.className = 'flex-1 py-3 font-display text-2xl text-gray-600 uppercase italic';
        window.setText('payTokenSymbol', 'PAXI');
        window.setText('recvTokenSymbol', window.currentTokenInfo?.symbol || 'TOKEN');
    } else {
        if (sellTab) sellTab.className = 'flex-1 py-3 font-display text-2xl bg-meme-pink text-white shadow-brutal uppercase italic';
        if (buyTab) buyTab.className = 'flex-1 py-3 font-display text-2xl text-gray-600 uppercase italic';
        window.setText('payTokenSymbol', window.currentTokenInfo?.symbol || 'TOKEN');
        window.setText('recvTokenSymbol', 'PAXI');
    }
    window.updateTradeBalances();
};

window.updateTradeBalances = async function() {
    const activeWallet = window.WalletManager?.getActiveWallet();
    const walletAddress = activeWallet?.address || window.wallet?.address;
    if (!walletAddress) return;

    try {
        const balData = await window.smartFetch(`${window.APP_CONFIG.LCD}/cosmos/bank/v1beta1/balances/${walletAddress}`);
        const balances = balData.balances || [];
        const paxiBalance = balances.find(b => b.denom === 'upaxi');
        const paxiRaw = paxiBalance ? paxiBalance.amount : '0';
        const paxiAmount = parseInt(paxiRaw) / 1e6;

        let prc20Amount = 0; let prc20Raw = '0';
        if (window.currentPRC20) {
            const tokenDecimals = window.currentTokenInfo?.decimals || 6;
            const bal = await window.getPRC20Balance(walletAddress, window.currentPRC20);
            prc20Raw = bal.toString(); prc20Amount = bal / Math.pow(10, tokenDecimals);
        }

        const payBalEl = document.getElementById('payBalance');
        const recvBalEl = document.getElementById('recvBalance');

        if (window.tradeType === 'buy') {
            if (payBalEl) { window.setText(payBalEl, paxiAmount.toFixed(4)); payBalEl.setAttribute('data-raw', paxiRaw); }
            if (recvBalEl) { window.setText(recvBalEl, prc20Amount.toFixed(4)); recvBalEl.setAttribute('data-raw', prc20Raw); }
        } else {
            if (payBalEl) { window.setText(payBalEl, prc20Amount.toFixed(4)); payBalEl.setAttribute('data-raw', prc20Raw); }
            if (recvBalEl) { window.setText(recvBalEl, paxiAmount.toFixed(4)); recvBalEl.setAttribute('data-raw', paxiRaw); }
        }

        window.setText('walletAddrShort', window.shortenAddress(walletAddress));
        window.setText('walletBalance', paxiAmount.toFixed(2) + ' PAXI');
        window.removeClass('walletInfo', 'hidden');
        window.setText('mobileWalletBalance', paxiAmount.toFixed(2) + ' PAXI');
        window.removeClass('mobileWalletInfo', 'hidden'); window.addClass('mobileConnectBtn', 'hidden');

        const sidebarPaxi = document.getElementById('sidebar-paxi-bal');
        if (sidebarPaxi) window.setText(sidebarPaxi, paxiAmount.toFixed(2));
        const portfolioUSD = document.getElementById('portfolio-usd');
        if (portfolioUSD) { const usdValue = paxiAmount * (window.paxiPriceUSD || 0.05); window.setText(portfolioUSD, `$${usdValue.toFixed(2)} USD`); }
    } catch (e) { console.error('❌ Balance update failed:', e); }
};

window.copyAddrText = function() {
    if (!window.currentPRC20) return;
    navigator.clipboard.writeText(window.currentPRC20);
};

window.showSlippageModal = function() {
    window.removeClass('slippageModal', 'hidden');
    if (window.slippage) window.setValue('customSlippage', window.slippage);
};

window.setTab = function(name) {
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('text-meme-cyan', 'border-meme-cyan');
        b.classList.add('text-white', 'border-transparent');
    });
    const btn = document.getElementById('tab-' + name);
    if (btn) {
        btn.classList.add('text-meme-cyan', 'border-meme-cyan');
        btn.classList.remove('text-white', 'border-transparent');
    }
    if (name === 'holders') window.loadTokenHolders(); else window.renderTransactionHistory();
};

// ===== UNIFIED SIDEBAR TAB MANAGEMENT =====
window.currentSidebarTab = 'wallet';

window.setSidebarTab = function(tab) {
    window.currentSidebarTab = tab;
    const tabs = ['wallet', 'swap', 'history', 'lp', 'send', 'burn', 'donate'];
    tabs.forEach(t => {
        const btn = document.getElementById('side-tab-' + t);
        if (btn) {
            btn.classList.remove('bg-meme-card', 'text-meme-green', 'shadow-brutal');
            btn.classList.add('bg-black', 'text-gray-700');
        }
    });
    const activeBtn = document.getElementById('side-tab-' + tab);
    if (activeBtn) {
        activeBtn.classList.add('bg-meme-card', 'text-meme-green', 'shadow-brutal');
        activeBtn.classList.remove('bg-black', 'text-gray-700');
    }
    window.renderSidebarContent(tab);
};

window.renderSidebarContent = function(tab) {
    const container = document.getElementById('sidebarContent');
    if (!container) return;

    if (!window.wallet && tab !== 'swap' && tab !== 'wallet') {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
                <div class="w-20 h-20 bg-meme-card border-4 border-black shadow-brutal flex items-center justify-center mb-8 rotate-[-10deg]">
                    <i class="fas fa-lock text-3xl text-gray-700"></i>
                </div>
                <p class="font-display text-2xl text-gray-600 uppercase italic">Connect terminal to view ${tab}</p>
                <button onclick="window.showConnectModal()" class="mt-8 px-8 py-3 bg-meme-cyan text-black font-display text-xl uppercase italic border-4 border-black shadow-brutal hover:shadow-none transition-all">CONNECT WALLET</button>
            </div>`;
        return;
    }

    switch(tab) {
        case 'wallet': if (window.WalletUI) window.WalletUI.renderDashboard(); break;
        case 'swap': window.renderSwapTerminal(); break;
        case 'history': window.renderTransactionHistorySidebar(); break;
        case 'lp': window.renderLPTerminal(); break;
        case 'remove_lp': window.renderRemoveLPTerminal(); break;
        case 'send': window.renderSendTerminal(); break;
        case 'burn': window.renderBurnTerminal(); break;
        case 'donate': window.renderDonateTerminal(); break;
    }
};
