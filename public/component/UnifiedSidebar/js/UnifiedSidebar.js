window.UIManager.registerUI('UnifiedSidebar', () => {
    return `
        <!-- Sidebar Navigation Tabs -->
        <div class="flex bg-secondary border-b border-secondary p-1 gap-1" id="sidebar-tabs">
            <button data-tab="wallet" id="side-tab-wallet" class="flex-1 py-1.5 bg-secondary border border-secondary text-accent font-display text-sm shadow-brutal-sm hover:shadow-none transition-all uppercase italic tracking-tight">Wallet</button>
            <button data-tab="swap" id="side-tab-swap" class="hidden"></button>
            <button data-tab="history" id="side-tab-history" class="hidden"></button>
            <button data-tab="lp" id="side-tab-lp" class="hidden"></button>
            <button data-tab="send" id="side-tab-send" class="hidden"></button>
            <button data-tab="burn" id="side-tab-burn" class="hidden"></button>
            <button data-tab="donate" id="side-tab-donate" class="hidden"></button>
        </div>

        <div id="sidebarContent" class="flex-1 overflow-y-auto p-4 no-scrollbar bg-bg">
            <!-- Content will be injected by JS based on tab -->
            <div class="text-center py-24 flex flex-col items-center">
                <div class="w-16 h-16 bg-secondary border border-secondary shadow-brutal flex items-center justify-center text-muted-text text-3xl mb-6 rotate-[-10deg]">
                    <i class="fas fa-lock"></i>
                </div>
                <p class="font-display text-xl text-muted-text uppercase italic tracking-tighter">Terminal Locked</p>
                <p class="font-mono text-[8px] text-muted-text mt-1.5 font-bold uppercase tracking-widest italic">Connect wallet to start</p>
            </div>
        </div>
    `;
});

// ============================================
// UNIFIEDSIDEBAR LOGIC (Merged with Wallet Section)
// ============================================

window.currentSidebarTab = 'wallet';

window.UIManager.registerLogic('UnifiedSidebar', (container) => {
    container.querySelectorAll('#sidebar-tabs button').forEach(btn => {
        btn.addEventListener('click', () => window.setSidebarTab(btn.dataset.tab));
    });

    if (window.setSidebarTab) window.setSidebarTab(window.currentSidebarTab);

    if (window.WalletUI && window.WalletUI.init) {
        window.WalletUI.init();
    }
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

window.showDonationModal = function() {
    window.removeClass('donationModal', 'hidden');
};

window.hideDonationModal = function() {
    window.addClass('donationModal', 'hidden');
};

// --- History Logic ---
window.renderTransactionHistorySidebar = async function() {
    const container = document.getElementById('sidebarContent');
    if (!container || !window.wallet) return;
    container.innerHTML = `<div class="space-y-4">
        <h4 class="text-[10px] font-black text-secondary-text uppercase tracking-widest border-b border-border pb-2 flex justify-between items-center">RECENT TRANSACTIONS<button id="refresh-history-btn" class="hover:text-up"><i class="fas fa-sync-alt scale-75"></i></button></h4>
        <div id="sidebar-tx-list" class="divide-y divide-border/20"><div class="text-center py-20"><div class="w-8 h-8 border-4 border-meme-green border-t-transparent rounded-full animate-spin mx-auto"></div></div></div>
        <div id="tx-load-more" class="h-10 w-full flex items-center justify-center"></div>
    </div>`;
    document.getElementById('refresh-history-btn')?.addEventListener('click', () => window.renderTransactionHistorySidebar());
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
            sentinelContainer.innerHTML = `<button id="load-more-history-btn" class="px-4 py-1.5 bg-card border border-border rounded-lg text-[8px] font-black uppercase hover:border-up transition-all">Load More</button>`;
            document.getElementById('load-more-history-btn')?.addEventListener('click', () => window.loadMoreHistory());
        } else {
            sentinelContainer.innerHTML = `<span class="text-[8px] text-muted-text uppercase font-black tracking-widest py-4">End of transactions</span>`;
        }
    }
};

window.loadMoreHistory = async function() {
    window.historyPage++;
    await window.renderTxHistoryItems(false);
};

// --- LP Terminals ---
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
                    <input type="number" id="lpPaxiAmount" placeholder="0.0" class="bg-bg border border-border rounded-xl p-3 w-full text-primary-text font-bold outline-none focus:border-up">
                    <input type="range" id="lpPaxiSlider" min="0" max="100" step="1" value="0" class="w-full mt-3 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-up">
                </div>
                <div class="text-center text-up"><i class="fas fa-plus scale-75"></i></div>
                <div>
                    <div class="flex justify-between text-[10px] text-secondary-text mb-1">${symbol} Amount <span class="text-[9px]">Bal: <span id="lpTokenBalance">0.00</span></span></div>
                    <input type="number" id="lpTokenAmount" placeholder="0.0" class="bg-bg border border-border rounded-xl p-3 w-full text-primary-text font-bold outline-none focus:border-up">
                    <input type="range" id="lpTokenSlider" min="0" max="100" step="1" value="0" class="w-full mt-3 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-up">
                </div>
                <div id="estimatedLP" class="text-[10px] text-up font-black text-center h-4"></div>
                <button id="add-lp-btn" class="w-full py-4 btn-trade rounded-xl font-black text-xs uppercase tracking-widest shadow-brutal-sm">Add Liquidity</button>
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
                <input type="number" id="lpRemoveAmount" placeholder="0.00" class="bg-bg border border-border rounded-xl p-3 w-full text-primary-text font-bold mb-2 outline-none focus:border-down">
                <input type="range" id="lpRemoveSlider" min="0" max="100" step="1" value="0" class="w-full mb-4 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-down">
                <button id="remove-lp-btn" class="w-full py-3 bg-down/20 text-down border border-down/30 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-down hover:text-primary-text transition-all">Withdraw Assets</button>
            </div>
        </div>`;

    document.getElementById('lpPaxiAmount')?.addEventListener('input', () => window.updateLPFromInput('paxi'));
    document.getElementById('lpTokenAmount')?.addEventListener('input', () => window.updateLPFromInput('token'));
    document.getElementById('lpPaxiSlider')?.addEventListener('input', (e) => window.updateLPFromSlider('paxi', e.target.value));
    document.getElementById('lpTokenSlider')?.addEventListener('input', (e) => window.updateLPFromSlider('token', e.target.value));
    document.getElementById('add-lp-btn')?.addEventListener('click', () => window.executeAddLP());
    document.getElementById('lpRemoveAmount')?.addEventListener('input', () => window.updateRemoveLPFromInput());
    document.getElementById('lpRemoveSlider')?.addEventListener('input', (e) => window.updateRemoveLPFromSlider(e.target.value));
    document.getElementById('remove-lp-btn')?.addEventListener('click', () => window.executeRemoveLP());

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
            <button id="execute-remove-lp-btn" class="w-full py-4 bg-down/20 text-down border border-down/30 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-down hover:text-primary-text transition-all">
                Remove Liquidity
            </button>
            <div class="flex justify-center">
                <button id="switch-to-add-lp" class="text-[10px] font-black text-secondary-text hover:text-primary-text uppercase tracking-widest transition-colors">Switch to Add Liquidity</button>
            </div>
        </div>
    `;
    document.getElementById('execute-remove-lp-btn')?.addEventListener('click', () => window.removeLiquidity());
    document.getElementById('switch-to-add-lp')?.addEventListener('click', () => window.setSidebarTab('lp'));
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
                <button id="execute-send-btn" class="w-full py-4 btn-trade rounded-xl font-black text-xs uppercase tracking-widest">Send Assets</button>
            </div>
        </div>`;
    document.getElementById('execute-send-btn')?.addEventListener('click', () => window.executeSend());
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
                    <input type="number" id="burnAmount" placeholder="0.0" class="bg-transparent w-full text-primary-text font-bold outline-none">
                    <input type="range" id="burnSlider" min="0" max="100" step="1" value="0" class="w-full mt-3 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-down">
                </div>
                <button id="execute-burn-btn" class="w-full py-4 bg-down text-primary-text rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(255,0,128,0.3)] hover:scale-[1.02] transition-all">Start The Fire</button>
            </div>
        </div>`;
    document.getElementById('burnAmount')?.addEventListener('input', () => window.updateBurnSliderFromInput());
    document.getElementById('burnSlider')?.addEventListener('input', (e) => window.setBurnPercent(e.target.value));
    document.getElementById('execute-burn-btn')?.addEventListener('click', () => window.executeBurn());
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
                <button id="execute-donation-btn" class="w-full py-4 btn-trade rounded-xl font-black text-xs uppercase tracking-widest shadow-brutal-sm">Donate PAXI</button>
            </div>
        </div>`;
    document.getElementById('execute-donation-btn')?.addEventListener('click', () => window.executeDonation());
};

// ============================================
// WALLET CORE MODULES (Merged)
// ============================================

// --- Security ---
class WalletSecurity {
    constructor() { this.sessionPin = null; this.lockTimeout = null; this.TIMEOUT_MS = 24 * 60 * 60 * 1000; }
    lock() { this.sessionPin = null; if (window.wallet && window.wallet.type === 'internal') window.wallet.signer = null; window.dispatchEvent(new CustomEvent('paxi_wallet_locked')); if (window.log) window.log("Wallet session locked", "info"); if (window.checkWalletLock) window.checkWalletLock(); }
    setSessionPin(pin) { this.sessionPin = pin; }
    getSessionPin() { return this.sessionPin; }
    async encrypt(text, pin) { if (!window.cryptoUtils) throw new Error("cryptoUtils not loaded"); return await window.cryptoUtils.encrypt(text, pin); }
    async decrypt(encryptedData, pin) { if (!window.cryptoUtils) throw new Error("cryptoUtils not loaded"); return await window.cryptoUtils.decrypt(encryptedData, pin); }
}
window.WalletSecurity = new WalletSecurity();

// --- Network ---
class NetworkManager {
    constructor() {
        this.storageKey = 'paxi_networks_custom'; this.activeIdKey = 'paxi_active_network_id';
        this.defaultNetworks = [{ id: 'mainnet', name: 'Paxi Mainnet', rpc: 'https://mainnet-rpc.paxinet.io', lcd: 'https://mainnet-lcd.paxinet.io', explorer: 'https://explorer.paxinet.io', chainId: 'paxi-mainnet' }, { id: 'testnet', name: 'Paxi Testnet', rpc: 'https://testnet-rpc.paxinet.io', lcd: 'https://testnet-lcd.paxinet.io', explorer: 'https://testnet-explorer.paxinet.io', chainId: 'paxi-testnet' }];
        this.customNetworks = this.loadCustomNetworks(); this.activeId = localStorage.getItem(this.activeIdKey) || 'mainnet';
    }
    loadCustomNetworks() { try { const data = localStorage.getItem(this.storageKey); return data ? JSON.parse(data) : []; } catch (e) { return []; } }
    saveCustomNetworks() { localStorage.setItem(this.storageKey, JSON.stringify(this.customNetworks)); window.dispatchEvent(new CustomEvent('paxi_networks_updated')); }
    getNetworks() { return [...this.defaultNetworks, ...this.customNetworks]; }
    getActiveNetwork() { const net = this.getNetworks().find(n => n.id === this.activeId); return net || this.defaultNetworks[0]; }
    setActiveNetwork(id) { const networks = this.getNetworks(); if (networks.some(n => n.id === id)) { this.activeId = id; localStorage.setItem(this.activeIdKey, id); window.dispatchEvent(new CustomEvent('paxi_network_changed', { detail: this.getActiveNetwork() })); return true; } return false; }
    getEndpoints() { const net = this.getActiveNetwork(); return { rpc: net.rpc, lcd: net.lcd, explorer: net.explorer, chainId: net.chainId }; }
}
window.NetworkManager = new NetworkManager();

// --- Wallet Manager ---
class WalletManager {
    constructor() { this.storageKey = 'paxi_wallets_v2'; this.activeIdKey = 'paxi_active_wallet_id'; this.wallets = this.loadWallets(); this.activeId = localStorage.getItem(this.activeIdKey); if (!this.activeId && this.wallets.length > 0) this.setActiveWallet(this.wallets[0].id); }
    loadWallets() { try { const data = localStorage.getItem(this.storageKey); return data ? JSON.parse(data) : []; } catch (e) { return []; } }
    saveWallets() { localStorage.setItem(this.storageKey, JSON.stringify(this.wallets)); window.dispatchEvent(new CustomEvent('paxi_wallets_updated', { detail: this.wallets })); }
    getWallets() { return this.wallets; }
    getActiveWallet() { return this.wallets.find(w => w.id === this.activeId) || null; }
    getWallet(id) { return this.wallets.find(w => w.id === id) || null; }
    setActiveWallet(id) { if (this.wallets.some(w => w.id === id)) { this.activeId = id; localStorage.setItem(this.activeIdKey, id); window.dispatchEvent(new CustomEvent('paxi_active_wallet_changed', { detail: id })); return true; } return false; }
    renameWallet(id, newName) { const wallet = this.wallets.find(w => w.id === id); if (wallet) { wallet.name = newName; this.saveWallets(); return true; } return false; }
    deleteWallet(id) { const index = this.wallets.findIndex(w => w.id === id); if (index !== -1) { this.wallets.splice(index, 1); if (this.activeId === id) { this.activeId = this.wallets.length > 0 ? this.wallets[0].id : null; localStorage.setItem(this.activeIdKey, this.activeId || ''); window.dispatchEvent(new CustomEvent('paxi_active_wallet_changed', { detail: this.activeId })); } this.saveWallets(); return true; } return false; }
    async addWallet(name, type, encryptedData, address, isWatchOnly = false) { const id = 'w_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9); const newWallet = { id, name, type, address, encryptedData, isWatchOnly }; this.wallets.push(newWallet); this.saveWallets(); if (!this.activeId) this.setActiveWallet(id); return id; }
    async importMnemonic(name, mnemonic, pin) { const paxi = await window.waitForLibrary('PaxiCosmJS'); const HDWallet = paxi.DirectSecp256k1HdWallet || window.DirectSecp256k1HdWallet; const wallet = await HDWallet.fromMnemonic(mnemonic, { prefix: "paxi" }); const accounts = await wallet.getAccounts(); const address = accounts[0].address; const encryptedData = await window.WalletSecurity.encrypt(mnemonic, pin); return await this.addWallet(name, 'mnemonic', encryptedData, address); }
    async importPrivateKey(name, privateKeyHex, pin) { const paxi = await window.waitForLibrary('PaxiCosmJS'); const DirectWallet = paxi.DirectSecp256k1Wallet || window.DirectSecp256k1Wallet; const hexToBytes = hex => { const bytes = new Uint8Array(hex.length / 2); for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.substr(i, 2), 16); return bytes; }; const pkBytes = hexToBytes(privateKeyHex.replace('0x', '')); const wallet = await DirectWallet.fromKey(pkBytes, "paxi"); const accounts = await wallet.getAccounts(); const address = accounts[0].address; const encryptedData = await window.WalletSecurity.encrypt(privateKeyHex, pin); return await this.addWallet(name, 'privatekey', encryptedData, address); }
    async addWatchOnly(name, address) { return await this.addWallet(name, 'watchonly', null, address, true); }
}
window.WalletManager = new WalletManager();

// --- Asset Manager ---
class AssetManager {
    constructor() { this.customStorageKey = 'paxi_assets_custom'; this.hiddenStorageKey = 'paxi_assets_hidden'; this.settingsStorageKey = 'paxi_assets_settings'; this.customTokens = this.loadCustomTokens(); this.hiddenTokens = this.loadHiddenTokens(); this.settings = this.loadSettings(); this.metadata = new Map(); this.lpAssets = []; this.apiTokens = []; this.paxiBalanceRaw = '0'; }
    loadSettings() { try { const data = localStorage.getItem(this.settingsStorageKey); return data ? JSON.parse(data) : { hideZeroBalance: false, assetSort: 'most' }; } catch (e) { return { hideZeroBalance: false, assetSort: 'most' }; } }
    saveSettings(newSettings) { this.settings = { ...this.settings, ...newSettings }; localStorage.setItem(this.settingsStorageKey, JSON.stringify(this.settings)); window.dispatchEvent(new CustomEvent('paxi_assets_updated')); }
    loadCustomTokens() { try { const data = localStorage.getItem(this.customStorageKey); return data ? JSON.parse(data) : []; } catch (e) { return []; } }
    loadHiddenTokens() { try { const data = localStorage.getItem(this.hiddenStorageKey); return data ? JSON.parse(data) : []; } catch (e) { return []; } }
    save() { localStorage.setItem(this.customStorageKey, JSON.stringify(this.customTokens)); localStorage.setItem(this.hiddenStorageKey, JSON.stringify(this.hiddenTokens)); window.dispatchEvent(new CustomEvent('paxi_assets_updated')); }
    async addCustomToken(address) { if (this.customTokens.some(t => t.address === address)) return; try { const detail = await window.fetchDirect(`/api/token-detail?address=${address}`); const token = detail.contract || detail; this.customTokens.push({ address: token.contract_address || address, symbol: token.symbol || 'TOKEN', name: token.name || 'Unknown Token', decimals: token.decimals || 6, logo: token.logo || '' }); this.save(); return true; } catch (e) { throw e; } }
    removeCustomToken(address) { this.customTokens = this.customTokens.filter(t => t.address !== address); this.save(); }
    toggleVisibility(address) { if (this.hiddenTokens.includes(address)) this.hiddenTokens = this.hiddenTokens.filter(a => a !== address); else this.hiddenTokens.push(address); this.save(); }
    isTokenVisible(address) { return !this.hiddenTokens.includes(address); }
    getTokens() { const tokenMap = new Map(); tokenMap.set('PAXI', { address: 'PAXI', symbol: 'PAXI', name: 'Paxi Network', decimals: 6, logo: 'https://raw.githubusercontent.com/paxinetwork/logos/main/paxi.png', balance: this.paxiBalanceRaw }); this.apiTokens.forEach(t => tokenMap.set(t.address, t)); this.customTokens.forEach(t => { if (!tokenMap.has(t.address) && t.address !== 'PAXI') tokenMap.set(t.address, t); }); return Array.from(tokenMap.values()); }
    async fetchUserAssets(address) { try { const [data, paxiRes] = await Promise.all([window.fetchDirect(`${window.APP_CONFIG.BACKEND_API}/api/wallet-tokens?address=${address}`), window.fetchDirect(`${window.APP_CONFIG.BACKEND_API}/api/paxi-balance?address=${address}`).catch(() => null)]); if (paxiRes && paxiRes.balances) { const b = paxiRes.balances.find(x => x.denom === 'upaxi'); this.paxiBalanceRaw = b ? b.amount : '0'; } if (data && data.accounts) { this.apiTokens = data.accounts.map(item => ({ address: item.contract.contract_address, symbol: item.contract.symbol, name: item.contract.name, decimals: item.contract.decimals, logo: item.contract.logo, balance: item.account.balance, contractData: item.contract, accountData: item.account })); data.accounts.forEach(item => { const c = item.contract; const priceInPaxi = parseFloat(c.price_paxi || c.reserve_paxi / c.reserve_prc20 || 0); const priceUSD = priceInPaxi * (window.paxiPriceUSD || 0.05); this.metadata.set(c.contract_address, { price: priceInPaxi, change24h: parseFloat(c.price_change || 0), priceUSD: priceUSD, holders: c.holders || 0, volume: c.volume || 0, marketCap: c.market_cap || 0, totalSupply: c.total_supply || 0, reservePaxi: c.reserve_paxi || 0, reserve_prc20: c.reserve_prc20 || 0 }); }); window.dispatchEvent(new CustomEvent('paxi_assets_updated')); } } catch (e) { console.error("❌ Failed to fetch user assets:", e); } }
    getAssetMeta(address) { return this.metadata.get(address) || { price: 0, change24h: 0, priceUSD: 0 }; }
}
window.AssetManager = new AssetManager();

// --- Wallet UI ---
window.WalletUI = {
    init: function() { this.setupListeners(); console.log('✅ WalletUI initialized'); },
    setupListeners: function() {
        window.addEventListener('paxi_wallets_updated', () => { if (window.currentSidebarTab === 'wallet') this.renderDashboard(); });
        window.addEventListener('paxi_active_wallet_changed', () => { if (window.currentSidebarTab === 'wallet') this.renderDashboard(); });
        window.addEventListener('paxi_network_changed', () => { if (window.currentSidebarTab === 'wallet') this.renderDashboard(); });
        window.addEventListener('paxi_assets_updated', () => { if (window.currentSidebarTab === 'wallet') this.renderDashboard(); });
        window.addEventListener('paxi_wallet_locked', () => { if (window.currentSidebarTab === 'wallet') this.renderDashboard(); });
    },
    renderDashboard: function() {
        const container = document.getElementById('sidebarContent'); if (!container || window.currentSidebarTab !== 'wallet') return;
        const activeWallet = window.WalletManager.getActiveWallet(); const isLocked = !window.WalletSecurity.getSessionPin();
        if (!activeWallet) { container.innerHTML = `<div class="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in"><div class="w-16 h-16 bg-meme-green border-4 border-card shadow-brutal flex items-center justify-center mb-8 rotate-[-10deg]"><i class="fas fa-wallet text-3xl text-black"></i></div><h3 class="text-3xl font-display italic mb-4 uppercase tracking-tighter text-primary-text drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">NO WALLET</h3><p class="text-[10px] text-secondary-text mb-10 uppercase font-black tracking-widest leading-relaxed italic">Connect a wallet to start trading on Paxi Network.</p><div class="flex flex-col gap-4 w-full"><button id="wallet-create-btn" class="w-full py-4 bg-meme-green text-black font-display text-xl border-4 border-card shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic">CREATE NEW</button><button id="wallet-import-btn" class="w-full py-4 bg-surface border-4 border-card text-primary-text font-display text-xl shadow-brutal-cyan hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic">IMPORT WALLET</button></div></div>`;
            document.getElementById('wallet-create-btn')?.addEventListener('click', () => window.WalletUI.showCreateModal());
            document.getElementById('wallet-import-btn')?.addEventListener('click', () => window.WalletUI.showImportModal());
            return;
        }
        if (isLocked && !activeWallet.isWatchOnly) { container.innerHTML = `<div class="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in"><div class="w-16 h-16 bg-meme-pink border-4 border-card shadow-brutal flex items-center justify-center mb-8 rotate-[10deg]"><i class="fas fa-lock text-3xl text-primary-text"></i></div><h3 class="text-3xl font-display italic mb-4 uppercase tracking-tighter text-primary-text drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">WALLET LOCKED</h3><p class="text-[10px] text-secondary-text mb-10 uppercase font-black tracking-widest leading-relaxed italic">Enter your PIN to unlock and access your assets.</p><button id="wallet-unlock-btn" class="w-full py-5 bg-meme-pink text-primary-text font-display text-2xl border-4 border-card shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic">UNLOCK NOW</button></div>`;
            document.getElementById('wallet-unlock-btn')?.addEventListener('click', () => window.WalletUI.unlockActiveWallet());
            return;
        }
        this.renderActiveWalletView(container, activeWallet);
    },
    setWalletSubTab: function(tab) {
        const assetsBtn = document.getElementById('wallet-tab-assets'); const historyBtn = document.getElementById('wallet-tab-history');
        const assetsSection = document.getElementById('wallet-assets-section'); const historySection = document.getElementById('wallet-history-section');
        if (tab === 'assets') { assetsBtn.classList.add('bg-card', 'text-primary-text'); assetsBtn.classList.remove('text-secondary-text'); historyBtn.classList.remove('bg-card', 'text-primary-text'); historyBtn.classList.add('text-secondary-text'); assetsSection.classList.remove('hidden'); historySection.classList.add('hidden'); }
        else { historyBtn.classList.add('bg-card', 'text-primary-text'); historyBtn.classList.remove('text-secondary-text'); assetsBtn.classList.remove('bg-card', 'text-primary-text'); assetsBtn.classList.add('text-secondary-text'); historySection.classList.remove('hidden'); assetsSection.classList.add('hidden'); window.renderTransactionHistory(); }
    },
    renderAssets: async function() {
        const container = document.getElementById('asset-list-container'); if (!container) return;
        const activeWallet = window.WalletManager.getActiveWallet();
        if (activeWallet && (!window.AssetManager.apiTokens || window.AssetManager.apiTokens.length === 0)) { container.innerHTML = '<div class="text-center py-12 animate-pulse"><div class="w-12 h-12 border-4 border-meme-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p class="text-[10px] text-muted-text font-black uppercase tracking-widest">Scanning Chain...</p></div>'; await window.AssetManager.fetchUserAssets(activeWallet.address); }
        let tokens = window.AssetManager.getTokens(); const settings = window.AssetManager.settings; if (settings.hideZeroBalance) tokens = tokens.filter(token => (token.balance || 0) > 0);
        tokens.sort((a, b) => {
            const balA = (a.balance || 0) / Math.pow(10, a.decimals || 6); const balB = (b.balance || 0) / Math.pow(10, b.decimals || 6);
            const metaA = window.AssetManager.getAssetMeta(a.address); const metaB = window.AssetManager.getAssetMeta(b.address);
            const valA = balA * (a.address === 'PAXI' ? 1 : (metaA.price || 0)); const valB = balB * (b.address === 'PAXI' ? 1 : (metaB.price || 0));
            switch (settings.assetSort) { case 'most': return valB - valA; case 'least': return valA - valB; case 'name': return a.name.localeCompare(b.name); default: return valB - valA; }
        });
        container.innerHTML = tokens.map(token => {
            if (!window.AssetManager.isTokenVisible(token.address)) return '';
            const meta = window.AssetManager.getAssetMeta(token.address); const logoUrl = window.normalizeLogoUrl(token.logo); const canHide = token.address !== 'PAXI';
            return `
                <div class="p-4 bg-surface border-4 border-card shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group cursor-pointer relative"
                     id="asset-item-${token.address}" onclick="window.WalletUI.showAssetActions('${token.address}')">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-surface border-2 border-card flex items-center justify-center text-sm font-black overflow-hidden relative shadow-brutal-sm group-hover:rotate-6 transition-transform flex-shrink-0">
                            ${logoUrl ? `<img src="${logoUrl}" class="w-full h-full object-cover" onerror=\"this.classList.add('hidden'); this.nextElementSibling.classList.remove('hidden'); this.nextElementSibling.classList.add('flex');\"><span class="hidden absolute inset-0 flex items-center justify-center font-black">${token.symbol.charAt(0)}</span>` : `<span class="font-black">${token.symbol.charAt(0)}</span>`}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex justify-between items-start mb-1 gap-2">
                                <span class="text-base font-display italic text-primary-text uppercase truncate tracking-tighter">${token.name}</span>
                                <div class="flex flex-col items-end flex-shrink-0">
                                    <span id="bal-${token.address}" class="text-sm font-mono font-black text-meme-cyan">...</span>
                                    ${canHide ? `<button onclick="event.stopPropagation(); window.WalletUI.confirmHideToken('${token.address}')" class="mt-1 w-5 h-5 bg-meme-yellow border border-card flex items-center justify-center text-[8px] text-black hover:bg-meme-pink transition-all shadow-brutal-sm hover:shadow-none" title="Hide"><i class="fas fa-eye-slash"></i></button>` : ''}
                                </div>
                            </div>
                            <div class="flex justify-between items-end mt-1">
                                <div class="flex items-center gap-2"><span class="text-[9px] font-black text-muted-text uppercase tracking-widest italic">${token.symbol}</span><span class="text-[8px] font-mono font-bold ${meta.change24h >= 0 ? 'text-meme-green' : 'text-meme-pink'}">${meta.change24h >= 0 ? '+' : ''}${meta.change24h.toFixed(2)}%</span></div>
                                <div class="text-right"><div id="price-${token.address}" class="text-[8px] font-mono font-bold text-meme-yellow">...</div><div id="val-${token.address}" class="text-[10px] font-display text-primary-text/50 italic tracking-tighter">...</div></div>
                            </div>
                        </div>
                    </div>
                </div>`;
        }).join('');
        this.updateAssetBalances();
    },
    renderActiveWalletView: function(container, wallet) {
        const net = window.NetworkManager.getActiveNetwork();
        container.innerHTML = `
            <div class="space-y-8 animate-fade-in p-1">
                <div class="p-6 bg-surface border-4 border-card shadow-brutal rotate-[-1deg] relative overflow-hidden group">
                    <div class="absolute -top-10 -right-10 w-32 h-32 bg-meme-green opacity-5 blur-3xl rounded-full pointer-events-none"></div>
                    <div class="flex justify-between items-start mb-8">
                        <div><div class="flex items-center gap-2 mb-2"><span class="text-[8px] font-black uppercase tracking-[0.2em] text-meme-cyan italic bg-surface px-2 py-0.5 border border-card">${net.name}</span>${wallet.isWatchOnly ? '<span class="px-2 py-0.5 bg-meme-yellow text-black text-[8px] font-black border border-card uppercase italic">Passive Mode</span>' : ''}</div><h3 class="text-3xl font-display italic tracking-tighter text-primary-text uppercase drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">${wallet.name}</h3></div>
                        <div class="flex gap-2">
                            <button id="wallet-switcher-btn" class="w-10 h-10 flex items-center justify-center bg-surface border-2 border-card text-secondary-text hover:text-meme-yellow transition-all shadow-brutal-sm hover:shadow-none" title="Switch Wallet"><i class="fas fa-exchange-alt text-sm"></i></button>
                            <button id="wallet-refresh-btn" class="w-10 h-10 flex items-center justify-center bg-surface border-2 border-card text-secondary-text hover:text-meme-green transition-all shadow-brutal-sm hover:shadow-none" title="Sync"><i class="fas fa-sync-alt text-sm"></i></button>
                            <button id="wallet-settings-btn" class="w-10 h-10 flex items-center justify-center bg-surface border-2 border-card text-secondary-text hover:text-meme-cyan transition-all shadow-brutal-sm hover:shadow-none" title="Settings"><i class="fas fa-cog"></i></button>
                        </div>
                    </div>
                    <div class="mb-8"><div class="text-[10px] text-muted-text font-black uppercase tracking-widest mb-1 italic">TOTAL BALANCE</div><div class="flex items-baseline gap-2"><span id="sidebar-paxi-bal" class="text-5xl font-display italic tracking-tighter text-meme-green drop-shadow-[3px_3px_0_rgba(0,0,0,1)]">0.00</span><span class="text-lg font-display text-primary-text italic uppercase">PAXI</span></div><div id="portfolio-usd" class="text-[10px] text-muted-text font-mono font-bold mt-2 uppercase tracking-widest">$0.00 USD</div></div>
                    <div class="flex items-center gap-3 p-3 bg-surface border-2 border-card shadow-inner"><code class="text-[10px] font-mono text-secondary-text flex-1 break-all font-bold">${window.shortenAddress(wallet.address, 10)}</code><button id="copy-wallet-addr-btn" class="w-8 h-8 flex items-center justify-center bg-meme-cyan text-black border-2 border-card shadow-brutal-sm hover:shadow-none transition-all"><i class="fas fa-copy text-xs"></i></button></div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <button id="wallet-send-btn" class="flex items-center justify-center gap-3 p-5 bg-meme-green border-4 border-card shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group"><i class="fas fa-paper-plane text-black text-xl group-hover:rotate-12 transition-transform"></i><span class="text-xl font-display uppercase italic text-black">SEND</span></button>
                    <button id="wallet-recv-btn" class="flex items-center justify-center gap-3 p-5 bg-meme-cyan border-4 border-card shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group"><i class="fas fa-qrcode text-black text-xl group-hover:scale-110 transition-transform"></i><span class="text-xl font-display uppercase italic text-black">RECV</span></button>
                </div>
                <div class="space-y-6">
                    <div class="flex bg-surface p-1 border-4 border-card shadow-brutal rotate-[0.5deg]">
                        <button id="wallet-tab-assets-btn" class="flex-1 py-3 font-display text-2xl transition-all bg-meme-green text-black italic uppercase">ASSETS</button>
                        <button id="wallet-tab-history-btn" class="flex-1 py-3 font-display text-2xl transition-all text-muted-text italic hover:text-primary-text uppercase">HISTORY</button>
                    </div>
                    <div id="wallet-assets-section" class="space-y-6">
                        <div class="flex justify-between items-center px-2"><h4 class="text-sm font-display uppercase tracking-tighter text-primary-text italic underline decoration-meme-green decoration-2 underline-offset-4">MY ASSETS</h4><button id="wallet-add-token-btn" class="w-8 h-8 bg-meme-yellow border-2 border-card shadow-brutal-sm flex items-center justify-center text-black hover:shadow-none"><i class="fas fa-plus text-xs"></i></button></div>
                        <div class="flex items-center justify-between px-4 py-3 bg-surface border-4 border-card shadow-brutal-sm rotate-[-0.5deg]"><div class="flex items-center gap-3"><i class="fas fa-filter text-xs text-muted-text"></i><select id="wallet-asset-sort" class="bg-transparent text-[10px] font-black uppercase tracking-widest text-secondary-text outline-none cursor-pointer hover:text-meme-cyan transition-colors"><option value="most">MAX BAL</option><option value="least">MIN BAL</option><option value="name">A-Z</option></select></div><div class="flex items-center gap-3"><span class="text-[10px] font-black uppercase tracking-widest text-muted-text italic">HIDE EMPTY</span><input type="checkbox" id="wallet-hide-zero" class="w-8 h-4 bg-surface border-2 border-card appearance-none checked:bg-meme-green transition-all cursor-pointer"></div></div>
                        <div id="asset-list-container" class="space-y-4"></div>
                    </div>
                    <div id="wallet-history-section" class="hidden"><div id="history-container" class="space-y-4"></div></div>
                </div>
            </div>`;
        document.getElementById('wallet-switcher-btn')?.addEventListener('click', () => window.WalletUI.showWalletSwitcher());
        document.getElementById('wallet-refresh-btn')?.addEventListener('click', () => { const icon = document.querySelector('#wallet-refresh-btn i'); icon?.classList.add('fa-spin'); window.AssetManager.fetchUserAssets(wallet.address).then(() => { this.updateAssetBalances(); if (window.updateBalances) window.updateBalances(); setTimeout(() => icon?.classList.remove('fa-spin'), 500); }); });
        document.getElementById('wallet-settings-btn')?.addEventListener('click', () => this.showSettingsPanel());
        document.getElementById('copy-wallet-addr-btn')?.addEventListener('click', (e) => window.copyAddress(e, wallet.address));
        document.getElementById('wallet-send-btn')?.addEventListener('click', () => this.showSendBottomSheet());
        document.getElementById('wallet-recv-btn')?.addEventListener('click', () => this.showReceiveModal());
        document.getElementById('wallet-tab-assets-btn')?.addEventListener('click', () => this.setWalletSubTab('assets'));
        document.getElementById('wallet-tab-history-btn')?.addEventListener('click', () => this.setWalletSubTab('history'));
        document.getElementById('wallet-add-token-btn')?.addEventListener('click', () => this.showImportTokenModal());
        document.getElementById('wallet-asset-sort')?.addEventListener('change', (e) => this.setAssetSort(e.target.value));
        document.getElementById('wallet-hide-zero')?.addEventListener('change', (e) => this.toggleHideZero(e.target.checked));
        this.renderAssets();
    },
    updateAssetBalances: async function() {
        const tokens = window.AssetManager.getTokens(); const activeWallet = window.WalletManager.getActiveWallet(); if (!activeWallet) return;
        let paxiBalance = 0; try { const response = await window.fetchDirect(`${window.APP_CONFIG.BACKEND_API}/api/paxi-balance?address=${activeWallet.address}`); const balances = response.balances || []; const paxiBal = balances.find(b => b.denom === 'upaxi'); paxiBalance = paxiBal ? parseInt(paxiBal.amount) / 1000000 : 0; } catch (e) {}
        let totalPAXIValue = 0; let totalUSD = 0; const currentPaxiPrice = window.paxiPriceUSD || 0.05;
        for (const token of tokens) {
            try {
                let amount = (token.balance !== undefined) ? token.balance / Math.pow(10, token.decimals || 6) : (token.address === 'PAXI' ? paxiBalance : 0);
                const balEl = document.getElementById(`bal-${token.address}`); if (balEl) window.setText(balEl, amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }));
                const meta = window.AssetManager.getAssetMeta(token.address); let tokenPaxiValue = (token.address === 'PAXI') ? amount : amount * meta.price; let tokenUsdValue = tokenPaxiValue * currentPaxiPrice;
                totalPAXIValue += tokenPaxiValue; totalUSD += tokenUsdValue;
                const priceEl = document.getElementById(`price-${token.address}`); if (priceEl) window.setText(priceEl, `${tokenPaxiValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })} PAXI`);
                const valEl = document.getElementById(`val-${token.address}`); if (valEl) window.setText(valEl, `$${tokenUsdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`);
                if (window.AssetManager.settings.hideZeroBalance && amount === 0) document.getElementById(`asset-item-${token.address}`)?.classList.add('hidden');
            } catch (e) {}
        }
        window.setText('sidebar-paxi-bal', totalPAXIValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
        window.setText('portfolio-usd', `$${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`);
    },
    showReceiveModal: function() {
        const wallet = window.WalletManager.getActiveWallet(); if (!wallet) return;
        const modalHtml = `<div id="qrModal" class="fixed inset-0 bg-surface/90 z-[600] flex items-center justify-center p-4 animate-fade-in"><div class="bg-card border border-border w-full max-w-sm rounded-[2.5rem] p-8 flex flex-col items-center"><h3 class="text-xl font-black italic uppercase tracking-tighter mb-6">Receive Assets</h3><div class="bg-white p-4 rounded-3xl mb-6 shadow-2xl"><img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${wallet.address}" class="w-48 h-48"></div><div class="bg-surface border border-border rounded-2xl p-4 w-full flex items-center gap-3 mb-6"><code class="text-[10px] font-mono text-secondary-text flex-1">${window.shortenAddress(wallet.address, 10)}</code><button id="copy-receive-addr-btn" class="text-up hover:scale-110 transition-transform"><i class="fas fa-copy"></i></button></div><button id="close-qr-btn" class="w-full py-4 bg-surface text-secondary-text font-black rounded-2xl text-xs uppercase italic border border-border hover:text-primary-text transition-all">Close</button></div></div>`;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.getElementById('copy-receive-addr-btn')?.addEventListener('click', (e) => window.copyAddress(e, wallet.address));
        document.getElementById('close-qr-btn')?.addEventListener('click', () => document.getElementById('qrModal').remove());
    },
    unlockActiveWallet: function() {
        window.showPinSheet('Enter PIN to Unlock', async (pin) => {
            try { const wallet = window.WalletManager.getActiveWallet(); if (!wallet) return; await window.WalletSecurity.decrypt(wallet.encryptedData, pin); window.WalletSecurity.setSessionPin(pin); await window.connectInternalWallet(wallet.id, pin); if (window.checkWalletLock) window.checkWalletLock(); this.renderDashboard(); } catch (e) {}
        });
    }
};

// --- Transactions ---
window.buildAndSendTx = async function(messages, memo = "", options = {}) {
    if (!window.wallet) throw new Error("Wallet not connected");
    const { silent = false, sequenceOverride = null, type = 'default', metadata = {}, gasEstimate: preSimulatedGas = null } = options;
    if (window.walletType === 'internal' && !window.WalletSecurity.getSessionPin() && silent) return { success: false, error: "Wallet locked" };
    const loader = document.getElementById('txLoader');
    const showLoader = () => { if (!silent && loader) { loader.classList.remove('hidden'); loader.classList.add('flex'); } };
    const hideLoader = () => { if (loader) { loader.classList.add('hidden'); loader.classList.remove('flex'); } };
    let gasEstimate = preSimulatedGas;
    try {
        if (!silent && !gasEstimate) { window.showNotif('Loading', 'info'); gasEstimate = await window.simulateGas(messages, memo, { type }); const feeDisplay = `${window.formatAmount(parseInt(gasEstimate.estimatedFee) / 1e6, 4)} PAXI`; const confirmed = await window.confirmTxCustom(memo, feeDisplay); if (!confirmed) throw new Error("Transaction cancelled"); showLoader(); }
        else if (!silent && gasEstimate) { const feeDisplay = `${window.formatAmount(parseInt(gasEstimate.estimatedFee) / 1e6, 4)} PAXI`; const confirmed = await window.confirmTxCustom(memo, feeDisplay); if (!confirmed) throw new Error("Transaction cancelled"); showLoader(); }
        if (window.walletType === 'internal' && !window.wallet.signer) {
            const walletId = window.wallet?.id; const targetWallet = walletId ? window.WalletManager.getWallet(walletId) : window.WalletManager.getActiveWallet();
            if (!targetWallet) throw new Error("Wallet not found. Please reconnect."); if (targetWallet.isWatchOnly) throw new Error("Watch-Only wallet cannot sign.");
            const pin = window.WalletSecurity.getSessionPin(); if (!pin) { if (window.WalletUI && window.WalletUI.unlockActiveWallet) window.WalletUI.unlockActiveWallet(); throw new Error("Wallet session expired. Please unlock."); }
            const decrypted = await window.WalletSecurity.decrypt(targetWallet.encryptedData, pin); const paxi = await window.waitForLibrary('PaxiCosmJS');
            if (targetWallet.type === 'mnemonic') window.wallet.signer = await paxi.DirectSecp256k1HdWallet.fromMnemonic(decrypted, { prefix: "paxi" });
            else if (targetWallet.type === 'privatekey') { const hexToBytes = hex => { const bytes = new Uint8Array(hex.length / 2); for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.substr(i, 2), 16); return bytes; }; window.wallet.signer = await paxi.DirectSecp256k1Wallet.fromKey(hexToBytes(decrypted.replace('0x', '')), "paxi"); }
        }
        const [chainRes, accountRes, finalGasEstimate] = await Promise.all([window.fetchDirect(`${window.APP_CONFIG.BACKEND_API}/api/rpc-status`), window.fetchDirect(`${window.APP_CONFIG.BACKEND_API}/api/account?address=${window.wallet.address}`), gasEstimate ? Promise.resolve(gasEstimate) : window.simulateGas(messages, memo, { type })]);
        gasEstimate = finalGasEstimate; const chainId = chainRes.result.node_info.network; const account = accountRes.account.base_account || accountRes.account; const sequence = sequenceOverride !== null ? sequenceOverride : account.sequence;
        const fee = { amount: [{ denom: window.APP_CONFIG.DENOM, amount: gasEstimate.estimatedFee }], gasLimit: gasEstimate.gasLimit };
        let pubkeyBytes; if (window.walletType === 'keplr' || window.walletType === 'internal') { const accounts = await window.wallet.signer.getAccounts(); pubkeyBytes = accounts[0].pubkey; } else { pubkeyBytes = (typeof window.wallet.public_key === 'string') ? Uint8Array.from(atob(window.wallet.public_key), c => c.charCodeAt(0)) : new Uint8Array(window.wallet.public_key); }
        const txBody = PaxiCosmJS.TxBody.fromPartial({ messages, memo }); const authInfo = PaxiCosmJS.AuthInfo.fromPartial({ signerInfos: [{ publicKey: { typeUrl: "/cosmos.crypto.secp256k1.PubKey", value: PaxiCosmJS.PubKey.encode({ key: pubkeyBytes }).finish() }, modeInfo: { single: { mode: 1 } }, sequence: BigInt(sequence) }], fee });
        const signDoc = PaxiCosmJS.SignDoc.fromPartial({ bodyBytes: PaxiCosmJS.TxBody.encode(txBody).finish(), authInfoBytes: PaxiCosmJS.AuthInfo.encode(authInfo).finish(), chainId, accountNumber: BigInt(account.account_number) });
        if (!silent) window.showNotif('Please sign the transaction...', 'info');
        let txRaw; if (window.walletType === 'keplr') { const res = await window.wallet.signer.signDirect(window.wallet.address, signDoc); txRaw = PaxiCosmJS.TxRaw.fromPartial({ bodyBytes: res.signed.bodyBytes, authInfoBytes: res.signed.authInfoBytes, signatures: [Uint8Array.from(atob(res.signature.signature), c => c.charCodeAt(0))] }); }
        else if (window.walletType === 'internal') { const res = await window.wallet.signer.signDirect(window.wallet.address, signDoc); txRaw = PaxiCosmJS.TxRaw.fromPartial({ bodyBytes: res.signed.bodyBytes, authInfoBytes: res.signed.authInfoBytes, signatures: [Uint8Array.from(atob(res.signature.signature), c => c.charCodeAt(0))] }); }
        else { const res = await window.wallet.signer.signAndSendTransaction({ bodyBytes: btoa(String.fromCharCode(...signDoc.bodyBytes)), authInfoBytes: btoa(String.fromCharCode(...signDoc.authInfoBytes)), chainId, accountNumber: account.account_number.toString() }); if (!res || !res.success) throw new Error("Signing rejected or failed"); txRaw = PaxiCosmJS.TxRaw.fromPartial({ bodyBytes: signDoc.bodyBytes, authInfoBytes: signDoc.authInfoBytes, signatures: [Uint8Array.from(atob(res.success), c => c.charCodeAt(0))] }); }
        const broadcastRes = await window.fetchDirect(`${window.APP_CONFIG.BACKEND_API}/api/broadcast`, { method: 'POST', body: JSON.stringify({ tx_bytes: btoa(String.fromCharCode(...PaxiCosmJS.TxRaw.encode(txRaw).finish())) }) });
        if (!broadcastRes.tx_response || broadcastRes.tx_response.code !== 0) { throw new Error(`Broadcast failed: ${broadcastRes.tx_response?.raw_log || broadcastRes.tx_response?.message || "Unknown error"}`); }
        const hash = broadcastRes.tx_response.txhash; let resultData = await window.fetchDirect(`/api/tx-status?hash=${hash}`); hideLoader();
        if (resultData) { const isSuccess = resultData.code === 0; if (!silent) window.showTxResult({ status: isSuccess ? 'success' : 'failed', type: metadata.type || 'Transaction', asset: metadata.asset || '--', amount: metadata.amount || '--', address: metadata.address || window.wallet.address, hash: hash, error: isSuccess ? null : resultData.log, height: resultData.height, gasUsed: resultData.gas_used }); if (!isSuccess) throw new Error(`Transaction failed: ${resultData.log}`); return { success: true, hash, ...resultData }; }
        return { success: true, hash };
    } catch (err) { hideLoader(); if (!silent && err.message !== "Transaction cancelled") window.showTxResult({ status: 'failed', type: metadata.type || 'Transaction', asset: metadata.asset || '--', amount: metadata.amount || '--', address: metadata.address || (window.wallet ? window.wallet.address : '--'), error: err.message }); throw err; }
};

window.executeSwap = async function(contractAddress, offerDenom, offerAmount, minReceive, memo = "Canonix Swap") {
    if (!window.wallet) return; const tokenDetail = window.tokenDetails?.get(contractAddress); const decimals = tokenDetail?.decimals || 6;
    const microOffer = window.toMicroAmount(offerAmount, offerDenom === window.APP_CONFIG.DENOM ? 6 : decimals);
    const microMinReceive = window.toMicroAmount(minReceive, offerDenom === window.APP_CONFIG.DENOM ? decimals : 6);
    const msgs = []; if (offerDenom !== window.APP_CONFIG.DENOM) msgs.push(PaxiCosmJS.Any.fromPartial({ typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract", value: PaxiCosmJS.MsgExecuteContract.encode({ sender: window.wallet.address, contract: offerDenom, msg: new TextEncoder().encode(JSON.stringify({ increase_allowance: { spender: window.APP_CONFIG.SWAP_MODULE, amount: microOffer } })), funds: [] }).finish() }));
    msgs.push(PaxiCosmJS.Any.fromPartial({ typeUrl: "/x.swap.types.MsgSwap", value: PaxiCosmJS.MsgSwap.encode({ creator: window.wallet.address, prc20: contractAddress, offerDenom, offerAmount: microOffer, minReceive: microMinReceive }).finish() }));
    const isBuy = offerDenom === window.APP_CONFIG.DENOM;
    const metadata = { type: 'Swap', action: isBuy ? 'Buy' : 'Sell', from: `${offerAmount} ${isBuy ? 'PAXI' : (tokenDetail?.symbol || 'TOKEN')}`, receive: `${minReceive} ${isBuy ? (tokenDetail?.symbol || 'TOKEN') : 'PAXI'}`, asset: isBuy ? `PAXI / ${tokenDetail?.symbol || 'TOKEN'}` : `${tokenDetail?.symbol || 'TOKEN'} / PAXI`, amount: `${offerAmount} ${isBuy ? 'PAXI' : (tokenDetail?.symbol || 'TOKEN')}`, address: window.wallet.address };
    const res = await window.buildAndSendTx(msgs, memo, { type: 'swap', metadata });
    setTimeout(async () => { if(window.updateBalances) await window.updateBalances(); if(window.updateLPBalances) await window.updateLPBalances(); if(window.fetchPoolData) await window.fetchPoolData(); if(window.loadPriceHistory && window.currentPRC20) window.loadPriceHistory(window.currentPRC20, window.currentTimeframe || '24h'); }, 3000);
    return res;
};

window.executeAddLPTransaction = async function(contractAddress, paxiAmount, tokenAmount) {
    if (!window.wallet) return; const tokenDetail = window.tokenDetails?.get(contractAddress); const decimals = tokenDetail?.decimals || 6;
    const microToken = window.toMicroAmount(tokenAmount, decimals);
    const msgs = [PaxiCosmJS.Any.fromPartial({ typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract", value: PaxiCosmJS.MsgExecuteContract.encode({ sender: window.wallet.address, contract: contractAddress, msg: new TextEncoder().encode(JSON.stringify({ increase_allowance: { spender: window.APP_CONFIG.SWAP_MODULE, amount: microToken } })), funds: [] }).finish() }), PaxiCosmJS.Any.fromPartial({ typeUrl: "/x.swap.types.MsgProvideLiquidity", value: PaxiCosmJS.MsgProvideLiquidity.encode({ creator: window.wallet.address, prc20: contractAddress, paxiAmount: `${window.toMicroAmount(paxiAmount, 6)}${window.APP_CONFIG.DENOM}`, prc20Amount: microToken }).finish() })];
    const metadata = { type: 'Add Liquidity', action: 'Add LP', from: `${paxiAmount} PAXI + ${tokenAmount} ${tokenDetail?.symbol || 'TOKEN'}`, receive: 'LP Tokens', asset: `PAXI / ${tokenDetail?.symbol || 'TOKEN'}`, amount: `${paxiAmount} PAXI + ${tokenAmount} ${tokenDetail?.symbol || 'TOKEN'}`, address: window.wallet.address };
    return await window.buildAndSendTx(msgs, "Add Liquidity", { type: 'add_lp', metadata });
};

window.executeRemoveLPTransaction = async function(contractAddress, lpAmount) {
    if (!window.wallet) return; const microLP = window.toMicroAmount(lpAmount, 6);
    const anyMsg = PaxiCosmJS.Any.fromPartial({ typeUrl: "/x.swap.types.MsgWithdrawLiquidity", value: PaxiCosmJS.MsgWithdrawLiquidity.encode({ creator: window.wallet.address, prc20: contractAddress, lpAmount: microLP }).finish() });
    const metadata = { type: 'Remove Liquidity', action: 'Remove LP', from: `${lpAmount} LP Tokens`, receive: 'PAXI + Token', asset: `PAXI / ${window.tokenDetails?.get(contractAddress)?.symbol || 'TOKEN'}`, amount: `${lpAmount} LP Tokens`, address: window.wallet.address };
    return await window.buildAndSendTx([anyMsg], "Remove Liquidity", { type: 'remove_lp', metadata });
};

window.executeSendTransaction = async function(tokenAddress, recipient, amount, memo = "Send from Canonix") {
    if (!window.wallet) return; const tokenDetail = window.tokenDetails?.get(tokenAddress); const decimals = tokenAddress === 'PAXI' ? 6 : (tokenDetail?.decimals || 6); const microAmount = window.toMicroAmount(amount, decimals); const msgs = [];
    if (tokenAddress === 'PAXI') msgs.push(PaxiCosmJS.Any.fromPartial({ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: PaxiCosmJS.MsgSend.encode({ fromAddress: window.wallet.address, toAddress: recipient, amount: [{ denom: window.APP_CONFIG.DENOM, amount: microAmount }] }).finish() }));
    else msgs.push(PaxiCosmJS.Any.fromPartial({ typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract", value: PaxiCosmJS.MsgExecuteContract.encode({ sender: window.wallet.address, contract: tokenAddress, msg: new TextEncoder().encode(JSON.stringify({ transfer: { recipient, amount: microAmount } })), funds: [] }).finish() }));
    const metadata = { type: 'Send', action: 'Send', from: `${amount} ${tokenAddress === 'PAXI' ? 'PAXI' : (tokenDetail?.symbol || 'TOKEN')}`, receive: `To ${window.shortenAddress(recipient)}`, asset: tokenAddress === 'PAXI' ? 'PAXI' : (tokenDetail?.symbol || 'TOKEN'), amount: `${amount} ${tokenAddress === 'PAXI' ? 'PAXI' : (tokenDetail?.symbol || 'TOKEN')}`, address: recipient };
    return await window.buildAndSendTx(msgs, memo, { type: 'send', metadata });
};

window.executeBurnTransaction = async function(contractAddress, amount) {
    if (!window.wallet) return; const tokenDetail = window.tokenDetails?.get(contractAddress); const decimals = tokenDetail?.decimals || 6;
    const anyMsg = PaxiCosmJS.Any.fromPartial({ typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract", value: PaxiCosmJS.MsgExecuteContract.encode({ sender: window.wallet.address, contract: contractAddress, msg: new TextEncoder().encode(JSON.stringify({ burn: { amount: window.toMicroAmount(amount, decimals) } })), funds: [] }).finish() });
    const metadata = { type: 'Burn', action: 'Burn', from: `${amount} ${tokenDetail?.symbol || 'TOKEN'}`, receive: 'Supply Reduction', asset: tokenDetail?.symbol || 'TOKEN', amount: `${amount} ${tokenDetail?.symbol || 'TOKEN'}`, address: window.wallet.address };
    return await window.buildAndSendTx([anyMsg], "Burn Tokens", { type: 'burn', metadata });
};

window.executeDonationTransaction = async function(amount, silent = false) {
    if (!window.wallet) return;
    const anyMsg = PaxiCosmJS.Any.fromPartial({ typeUrl: "/cosmos.bank.v1beta1.MsgSend", value: PaxiCosmJS.MsgSend.encode({ fromAddress: window.wallet.address, toAddress: window.APP_CONFIG.TARGET_WALLET, amount: [{ denom: window.APP_CONFIG.DENOM, amount: window.toMicroAmount(amount, 6) }] }).finish() });
    return await window.buildAndSendTx([anyMsg], "Support Project", { silent });
};

window.simulateGas = async function(messages, memo = "", options = {}) {
    try {
        if (!window.wallet) throw new Error("Wallet not connected");
        const accountRes = await window.fetchDirect(`${window.APP_CONFIG.BACKEND_API}/api/account?address=${window.wallet.address}`);
        const account = accountRes.account.base_account || accountRes.account;
        let pubkeyBytes; if (window.walletType === 'keplr' || window.walletType === 'internal') { const accounts = await window.wallet.signer.getAccounts(); pubkeyBytes = accounts[0].pubkey; } else { pubkeyBytes = (typeof window.wallet.public_key === 'string') ? Uint8Array.from(atob(window.wallet.public_key), c => c.charCodeAt(0)) : new Uint8Array(window.wallet.public_key); }
        const txRaw = PaxiCosmJS.TxRaw.fromPartial({ bodyBytes: PaxiCosmJS.TxBody.encode({ messages, memo }).finish(), authInfoBytes: PaxiCosmJS.AuthInfo.encode({ signerInfos: [{ publicKey: { typeUrl: "/cosmos.crypto.secp256k1.PubKey", value: PaxiCosmJS.PubKey.encode({ key: pubkeyBytes }).finish() }, modeInfo: { single: { mode: 1 } }, sequence: BigInt(account.sequence) }], fee: { amount: [], gasLimit: BigInt(0) } }).finish(), signatures: [new Uint8Array(64)] });
        const result = await window.fetchDirect('/api/gas-simulate', { method: 'POST', body: JSON.stringify({ tx_bytes: btoa(String.fromCharCode(...PaxiCosmJS.TxRaw.encode(txRaw).finish())) }) });
        if (result && result.gas_info) { const gasLimit = Math.ceil(parseInt(result.gas_info.gas_used) * 1.4); const est = Math.ceil(gasLimit * 0.05); return { gasPrice: "0.05", gasLimit: gasLimit.toString(), baseFee: est.toString(), priorityFee: "0", estimatedFee: est.toString(), estimatedFeeUSD: window.formatAmount(est / 1e6 * (window.paxiPriceUSD || 0.05), 4) }; }
        throw new Error("Invalid simulation response");
    } catch (e) { const gasLimit = 500000 + (300000 * (messages.length - 1)); const est = Math.ceil(gasLimit * 0.05); return { gasPrice: "0.05", gasLimit: gasLimit.toString(), baseFee: est.toString(), priorityFee: "0", estimatedFee: est.toString(), estimatedFeeUSD: window.formatAmount(est / 1e6 * (window.paxiPriceUSD || 0.05), 4) }; }
};

window.confirmTxCustom = function(memo, feeStr) {
    return new Promise((resolve) => {
        const modal = document.getElementById('txConfirmModal'); const actionEl = document.getElementById('txConfirmAction'); const feeEl = document.getElementById('txConfirmFee'); const confirmBtn = document.getElementById('txConfirmBtn'); const cancelBtn = document.getElementById('txCancelBtn');
        if (!modal || !actionEl || !feeEl || !confirmBtn || !cancelBtn) { resolve(window.confirm(`Confirm Tx: ${memo}\nEst Fee: ${feeStr}`)); return; }
        actionEl.textContent = memo || 'Execute Transaction'; feeEl.textContent = feeStr || 'Calculating...';
        if (document.getElementById('txConfirmNetwork')) document.getElementById('txConfirmNetwork').textContent = window.NetworkManager?.getActiveNetwork().name || 'Paxi Mainnet';
        modal.classList.remove('hidden'); modal.classList.add('flex');
        const cleanup = (result) => { modal.classList.add('hidden'); modal.classList.remove('flex'); confirmBtn.onclick = null; cancelBtn.onclick = null; resolve(result); };
        confirmBtn.onclick = () => cleanup(true); cancelBtn.onclick = () => cleanup(false);
    });
};
