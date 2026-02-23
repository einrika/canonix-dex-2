// ============================================
// UNIFIEDSIDEBAR LOGIC
// ============================================

window.currentSidebarTab = 'wallet';

window.UIManager.registerLogic('UnifiedSidebar', (container) => {
    container.querySelectorAll('#sidebar-tabs button').forEach(btn => {
        btn.addEventListener('click', () => window.setSidebarTab(btn.dataset.tab));
    });

    // Initial content
    if (window.setSidebarTab) window.setSidebarTab(window.currentSidebarTab);
});

window.setSidebarTab = function(tab) {
    window.currentSidebarTab = tab;
    const tabs = ['wallet', 'swap', 'history', 'lp', 'send', 'burn', 'donate'];
    tabs.forEach(t => {
        const btn = document.getElementById('side-tab-' + t);
        if (btn) {
            btn.classList.remove('bg-meme-green', 'text-black', 'shadow-brutal');
            btn.classList.add('bg-surface', 'text-secondary-text');
        }
    });
    const activeBtn = document.getElementById('side-tab-' + tab);
    if (activeBtn) {
        activeBtn.classList.add('bg-meme-green', 'text-black', 'shadow-brutal');
        activeBtn.classList.remove('bg-surface', 'text-secondary-text');
    }
    window.renderSidebarContent(tab);
};

window.renderSidebarContent = function(tab) {
    const container = document.getElementById('sidebarContent');
    if (!container) return;

    if (!window.wallet && tab !== 'swap' && tab !== 'wallet') {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
                <div class="w-20 h-20 bg-card border-4 border-card shadow-brutal flex items-center justify-center mb-8 rotate-[-10deg]">
                    <i class="fas fa-lock text-3xl text-muted-text"></i>
                </div>
                <p class="font-display text-2xl text-muted-text uppercase italic">Connect terminal to view ${tab}</p>
                <button onclick="window.showConnectModal()" class="mt-8 px-8 py-3 bg-meme-cyan text-black font-display text-xl uppercase italic border-4 border-card shadow-brutal hover:shadow-none transition-all">CONNECT WALLET</button>
            </div>`;
        return;
    }

    switch(tab) {
        case 'wallet': if (window.WalletUI) window.WalletUI.renderDashboard(); break;
        case 'swap': if (window.renderSwapTerminal) window.renderSwapTerminal(); break;
        case 'history': window.renderTransactionHistorySidebar(); break;
        case 'lp': window.renderLPTerminal(); break;
        case 'remove_lp': window.renderRemoveLPTerminal(); break;
        case 'send': window.renderSendTerminal(); break;
        case 'burn': window.renderBurnTerminal(); break;
        case 'donate': window.renderDonateTerminal(); break;
    }
};

window.renderTransactionHistorySidebar = async function() {
    const container = document.getElementById('sidebarContent');
    if (!container || !window.wallet) return;
    container.innerHTML = `<div class="space-y-4">
        <h4 class="text-[10px] font-black text-secondary-text uppercase tracking-widest border-b border-border pb-2 flex justify-between items-center">RECENT TRANSACTIONS<button onclick="window.renderTransactionHistorySidebar()" class="hover:text-up"><i class="fas fa-sync-alt scale-75"></i></button></h4>
        <div id="sidebar-tx-list" class="divide-y divide-border/20"><div class="text-center py-20"><div class="w-8 h-8 border-4 border-meme-green border-t-transparent rounded-full animate-spin mx-auto"></div></div></div>
        <div id="tx-load-more" class="h-10 w-full flex items-center justify-center"></div>
    </div>`;
    window.historyPage = 1; window.historyIsEnd = false; await window.renderTxHistoryItems(true);
};

window.renderTxHistoryItems = async function(isInitial = false) {
    const listContainer = document.getElementById('sidebar-tx-list');
    const sentinelContainer = document.getElementById('tx-load-more');
    if (!listContainer || !window.wallet) return;
    const history = await window.loadTransactionHistory(window.wallet.address, window.historyPage);
    if (isInitial) listContainer.innerHTML = '';
    if (history.length === 0 && isInitial) {
        listContainer.innerHTML = '<div class="text-center py-20 text-muted-text text-[10px] font-black uppercase tracking-widest">No history found</div>';
        if (sentinelContainer) sentinelContainer.innerHTML = ''; return;
    }
    const html = history.map(tx => {
        const timeStr = new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const typeColor = tx.type === 'Swap' ? 'text-up' : (tx.type === 'Transfer' ? 'text-blue-400' : 'text-secondary-text');
        const icon = tx.type === 'Swap' ? 'fa-exchange-alt' : 'fa-paper-plane';
        return `<div class="p-4 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 flex items-center justify-between" onclick="window.showTransactionDetailModal('${tx.hash}')">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-card flex items-center justify-center ${typeColor}"><i class="fas ${icon} text-xs"></i></div>
                <div><div class="text-[10px] font-black ${typeColor} uppercase">${tx.type}</div><div class="text-xs font-mono text-gray-300 mt-0.5">${tx.amount.toFixed(4)} ${tx.denom === 'upaxi' ? 'PAXI' : tx.symbol || tx.denom}</div></div>
            </div>
            <div class="text-right">
                <div class="text-[9px] text-secondary-text font-mono">${tx.hash.slice(0, 10)}...</div>
                <div class="text-[8px] text-muted-text mt-0.5">${timeStr}</div>
            </div>
        </div>`;
    }).join('');
    if (isInitial) { listContainer.innerHTML = html; } else { listContainer.insertAdjacentHTML('beforeend', html); }
    if (sentinelContainer) {
        if (!window.historyIsEnd) {
            sentinelContainer.innerHTML = `<button onclick="window.loadMoreHistory()" class="px-4 py-1.5 bg-card border border-border rounded-lg text-[8px] font-black uppercase hover:border-up transition-all">Load More</button>`;
        } else {
            sentinelContainer.innerHTML = `<span class="text-[8px] text-muted-text uppercase font-black tracking-widest py-4">End of transactions</span>`;
        }
    }
};

window.loadMoreHistory = async function() {
    window.historyPage++;
    await window.renderTxHistoryItems(false);
};

window.renderLPTerminal = async function() {
    const container = document.getElementById('sidebarContent');
    if (!container) return;
    if (window.fetchPoolData) await window.fetchPoolData();
    const symbol = window.currentTokenInfo?.symbol || 'TOKEN';
    container.innerHTML = `
        <div class="space-y-4 animate-fade-in">
            <h4 class="text-[10px] font-black text-secondary-text uppercase tracking-widest border-b border-border pb-2">Liquidity Provision</h4>
            <div class="bg-card p-4 rounded-2xl border border-border space-y-4">
                <div>
                    <div class="flex justify-between text-[10px] text-secondary-text mb-1">PAXI Amount <span class="text-[9px]">Bal: <span id="lpPaxiBalance">0.00</span></span></div>
                    <input type="number" id="lpPaxiAmount" placeholder="0.0" class="bg-bg border border-border rounded-xl p-3 w-full text-primary-text font-bold outline-none focus:border-up" oninput="window.updateLPFromInput('paxi')">
                    <input type="range" id="lpPaxiSlider" min="0" max="100" step="1" value="0" class="w-full mt-3 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-up" oninput="window.updateLPFromSlider('paxi', this.value)">
                </div>
                <div class="text-center text-up"><i class="fas fa-plus scale-75"></i></div>
                <div>
                    <div class="flex justify-between text-[10px] text-secondary-text mb-1">${symbol} Amount <span class="text-[9px]">Bal: <span id="lpTokenBalance">0.00</span></span></div>
                    <input type="number" id="lpTokenAmount" placeholder="0.0" class="bg-bg border border-border rounded-xl p-3 w-full text-primary-text font-bold outline-none focus:border-up" oninput="window.updateLPFromInput('token')">
                    <input type="range" id="lpTokenSlider" min="0" max="100" step="1" value="0" class="w-full mt-3 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-up" oninput="window.updateLPFromSlider('token', this.value)">
                </div>
                <div id="estimatedLP" class="text-[10px] text-up font-black text-center h-4"></div>
                <button onclick="window.executeAddLP()" class="w-full py-4 btn-trade rounded-xl font-black text-xs uppercase tracking-widest shadow-brutal-sm">Add Liquidity</button>
            </div>
            <div class="bg-surface border border-border p-4 rounded-2xl space-y-2.5">
                <h5 class="text-[10px] font-black text-secondary-text uppercase tracking-widest mb-1">Your Position</h5>
                <div class="flex justify-between text-xs"><span class="text-secondary-text font-bold uppercase text-[9px]">LP Tokens</span><span id="yourLPTokens" class="font-black text-up">0.00</span></div>
                <div class="flex justify-between text-xs"><span class="text-secondary-text font-bold uppercase text-[9px]">Pool Ratio</span><span id="poolRatioDisplay" class="font-mono text-[9px] text-gray-300">-</span></div>
                <div id="yourPositionDetails"></div>
            </div>
            <div class="bg-down/5 p-4 rounded-2xl border border-down/10">
                <h5 class="text-[10px] font-black text-down uppercase mb-3 tracking-widest">Remove Liquidity</h5>
                <div class="flex justify-between text-[9px] text-secondary-text mb-2 font-bold">AMOUNT TO WITHDRAW</div>
                <input type="number" id="lpRemoveAmount" placeholder="0.00" class="bg-bg border border-border rounded-xl p-3 w-full text-primary-text font-bold mb-2 outline-none focus:border-down" oninput="window.updateRemoveLPFromInput()">
                <input type="range" id="lpRemoveSlider" min="0" max="100" step="1" value="0" class="w-full mb-4 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-down" oninput="window.updateRemoveLPFromSlider(this.value)">
                <button onclick="window.executeRemoveLP()" class="w-full py-3 bg-down/20 text-down border border-down/30 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-down hover:text-primary-text transition-all">Withdraw Assets</button>
            </div>
        </div>`;
    if (window.updateLPBalances) window.updateLPBalances();
};

window.renderRemoveLPTerminal = async function() {
    const container = document.getElementById('sidebarContent');
    if (!container) return;
    await window.fetchPoolData();
    const symbol = window.currentTokenInfo?.symbol || 'TOKEN';
    container.innerHTML = `
        <div class="space-y-4 animate-in slide-in-from-right duration-300">
            <div class="flex items-center justify-between mb-2">
                <h3 class="text-xs font-black uppercase tracking-tighter text-secondary-text">Remove Liquidity</h3>
                <div class="px-2 py-0.5 bg-down/10 text-down text-[9px] rounded-full border border-down/20 font-bold">BURN LP</div>
            </div>
            <div class="bg-card p-4 rounded-2xl border border-border space-y-4">
                <div>
                    <div class="flex justify-between text-[10px] text-secondary-text mb-1">LP Tokens to Remove <span class="text-[9px]">Max: <span id="maxLPTokens">0.00</span></span></div>
                    <div class="relative">
                        <input type="number" id="removeLPInput" placeholder="0.00" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm font-mono focus:border-down outline-none transition-all pr-12">
                        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-secondary-text">LP</span>
                    </div>
                </div>
            </div>
            <div class="bg-surface border border-border p-4 rounded-2xl space-y-2.5">
                <h5 class="text-[10px] font-black text-secondary-text uppercase tracking-widest mb-1">Estimated Return</h5>
                <div class="flex justify-between text-xs"><span class="text-secondary-text font-bold uppercase text-[9px]">PAXI</span><span id="estPaxiReturn" class="font-black text-primary-text">0.00</span></div>
                <div class="flex justify-between text-xs"><span class="text-secondary-text font-bold uppercase text-[9px]">${symbol}</span><span id="estTokenReturn" class="font-black text-primary-text">0.00</span></div>
            </div>
            <button onclick="window.removeLiquidity()" class="w-full py-4 bg-down/20 text-down border border-down/30 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-down hover:text-primary-text transition-all">
                Remove Liquidity
            </button>
            <div class="flex justify-center">
                <button onclick="setSidebarTab('lp')" class="text-[10px] font-black text-secondary-text hover:text-primary-text uppercase tracking-widest transition-colors">Switch to Add Liquidity</button>
            </div>
        </div>
    `;
    if (window.updateLPBalances) window.updateLPBalances();
};

window.renderSendTerminal = function() {
    const container = document.getElementById('sidebarContent');
    if (!container) return;
    container.innerHTML = `
        <div class="space-y-4">
            <h4 class="text-[10px] font-black text-secondary-text uppercase tracking-widest border-b border-border pb-2">Send Assets</h4>
            <div class="bg-card p-4 rounded-2xl border border-border space-y-4">
                <div>
                    <label class="text-[9px] text-secondary-text font-bold uppercase ml-1">Recipient Address</label>
                    <input type="text" id="sendRecipient" placeholder="paxi1..." class="bg-bg border border-border rounded-xl p-3 w-full text-primary-text font-mono text-xs mt-1">
                </div>
                <div class="flex gap-2">
                    <div class="flex-1">
                        <label class="text-[9px] text-secondary-text font-bold uppercase ml-1">Amount</label>
                        <input type="number" id="sendAmount" placeholder="0.0" class="bg-bg border border-border rounded-xl p-3 w-full text-primary-text font-bold mt-1">
                    </div>
                    <div class="w-24">
                        <label class="text-[9px] text-secondary-text font-bold uppercase ml-1">Asset</label>
                        <select id="sendTokenSelect" class="bg-bg border border-border rounded-xl p-3 w-full text-primary-text text-[10px] font-bold mt-1 outline-none"><option value="upaxi">PAXI</option></select>
                    </div>
                </div>
                <button onclick="window.executeSend()" class="w-full py-4 btn-trade rounded-xl font-black text-xs uppercase tracking-widest">Send Assets</button>
            </div>
        </div>`;
    if (window.populateSendTokens) window.populateSendTokens();
};

window.renderBurnTerminal = function() {
    const container = document.getElementById('sidebarContent');
    if (!container) return;
    const symbol = window.currentTokenInfo?.symbol || 'TOKEN';
    container.innerHTML = `
        <div class="space-y-4">
            <h4 class="text-[10px] font-black text-secondary-text uppercase tracking-widest border-b border-border pb-2">Burn Tokens</h4>
            <div class="bg-down/5 p-6 rounded-2xl border border-down/10 text-center">
                <i class="fas fa-fire text-4xl text-down mb-4 opacity-50"></i>
                <p class="text-[10px] text-secondary-text leading-relaxed mb-6">Burning tokens permanently removes them from circulation, increasing scarcity.</p>
                <div class="bg-bg border border-border rounded-xl p-4 mb-4 text-left">
                    <div class="flex justify-between text-[9px] text-secondary-text mb-1">Amount of ${symbol} to Burn <span id="burnBalance" class="text-[8px] opacity-60">Bal: 0.00</span></div>
                    <input type="number" id="burnAmount" placeholder="0.0" class="bg-transparent w-full text-primary-text font-bold outline-none" oninput="window.updateBurnSliderFromInput()">
                    <input type="range" id="burnSlider" min="0" max="100" step="1" value="0" class="w-full mt-3 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-down" oninput="window.setBurnPercent(this.value)">
                </div>
                <button onclick="window.executeBurn()" class="w-full py-4 bg-down text-primary-text rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(255,0,128,0.3)] hover:scale-[1.02] transition-all">Start The Fire</button>
            </div>
        </div>`;
    if (window.updateBurnBalanceDisplay) window.updateBurnBalanceDisplay();
};

window.renderDonateTerminal = function() {
    const container = document.getElementById('sidebarContent');
    if (!container) return;
    container.innerHTML = `
        <div class="space-y-4">
            <h4 class="text-[10px] font-black text-secondary-text uppercase tracking-widest border-b border-border pb-2">Support Development</h4>
            <div class="bg-up/5 p-6 rounded-2xl border border-up/10 text-center">
                <i class="fas fa-heart text-4xl text-up mb-4 opacity-50"></i>
                <p class="text-[10px] text-secondary-text leading-relaxed mb-6">Help us maintain and improve Canonix. Your donations keep the fire burning!</p>
                <div class="bg-bg border border-border rounded-xl p-4 mb-4 text-left">
                    <div class="flex justify-between text-[9px] text-secondary-text mb-1">Amount (PAXI)</div>
                    <input type="number" id="donationAmount" value="10" class="bg-transparent w-full text-primary-text font-bold outline-none">
                </div>
                <button onclick="window.executeDonation()" class="w-full py-4 btn-trade rounded-xl font-black text-xs uppercase tracking-widest shadow-brutal-sm">Donate PAXI</button>
            </div>
        </div>`;
};
