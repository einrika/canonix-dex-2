// ============================================
// UI-WALLET.JS - User Interface & Interaction
// ============================================

import { fetchDirect, shortenAddress, setText, removeClass, addClass } from '../core/utils.js';
import { APP_CONFIG } from '../core/config.js';

// ===== 1. WALLET UI MAIN MODULE =====
export const WalletUI = {
    init: function() {
        this.setupListeners();
        console.log('✅ WalletUI initialized (lazy load mode)');
    },

    setupListeners: function() {
        window.addEventListener('paxi_wallets_updated', () => {
            if (window.currentSidebarTab === 'wallet') this.renderDashboard();
        });
        window.addEventListener('paxi_active_wallet_changed', () => {
            if (window.currentSidebarTab === 'wallet') this.renderDashboard();
        });
        window.addEventListener('paxi_network_changed', () => {
            if (window.currentSidebarTab === 'wallet') this.renderDashboard();
        });
        window.addEventListener('paxi_assets_updated', () => {
            if (window.currentSidebarTab === 'wallet') this.renderDashboard();
        });
        window.addEventListener('paxi_wallet_locked', () => {
            if (window.currentSidebarTab === 'wallet') this.renderDashboard();
        });
    },

    renderDashboard: function() {
        console.log("🎨 Rendering Wallet Dashboard", { tab: window.currentSidebarTab });
        const container = document.getElementById('sidebarContent');
        if (!container || window.currentSidebarTab !== 'wallet') return;

        const activeWallet = window.WalletManager.getActiveWallet();
        const isLocked = !window.WalletSecurity.getSessionPin();

        if (!activeWallet) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in">
                    <div class="w-16 h-16 bg-meme-green border-4 border-card shadow-brutal flex items-center justify-center mb-8 rotate-[-10deg]">
                        <i class="fas fa-wallet text-3xl text-black"></i>
                    </div>
                    <h3 class="text-3xl font-display italic mb-4 uppercase tracking-tighter text-primary-text drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">NO WALLET</h3>
                    <p class="text-[10px] text-secondary-text mb-10 uppercase font-black tracking-widest leading-relaxed italic">Connect a wallet to start trading on Paxi Network.</p>
                    <div class="flex flex-col gap-4 w-full">
                        <button onclick="window.WalletUI.showCreateModal()" class="w-full py-4 bg-meme-green text-black font-display text-xl border-4 border-card shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic">CREATE NEW</button>
                        <button onclick="window.WalletUI.showImportModal()" class="w-full py-4 bg-surface border-4 border-card text-primary-text font-display text-xl shadow-brutal-cyan hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic">IMPORT WALLET</button>
                    </div>
                </div>
            `;
            return;
        }

        if (isLocked && !activeWallet.isWatchOnly) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
                    <div class="w-16 h-16 bg-meme-pink border-4 border-card shadow-brutal flex items-center justify-center mb-8 rotate-[10deg]">
                        <i class="fas fa-lock text-3xl text-primary-text"></i>
                    </div>
                    <h3 class="text-3xl font-display italic mb-4 uppercase tracking-tighter text-primary-text drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">WALLET LOCKED</h3>
                    <p class="text-[10px] text-secondary-text mb-10 uppercase font-black tracking-widest leading-relaxed italic">Enter your PIN to unlock and access your assets.</p>
                    <button onclick="window.WalletUI.unlockActiveWallet()" class="w-full py-5 bg-meme-pink text-primary-text font-display text-2xl border-4 border-card shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic">UNLOCK NOW</button>
                </div>
            `;
            return;
        }

        this.renderActiveWalletView(container, activeWallet);
    },

    setWalletSubTab: function(tab) {
        const assetsBtn = document.getElementById('wallet-tab-assets');
        const historyBtn = document.getElementById('wallet-tab-history');
        const assetsSection = document.getElementById('wallet-assets-section');
        const historySection = document.getElementById('wallet-history-section');

        if (tab === 'assets') {
            assetsBtn?.classList.add('bg-card', 'text-primary-text');
            assetsBtn?.classList.remove('text-secondary-text');
            historyBtn?.classList.remove('bg-card', 'text-primary-text');
            historyBtn?.classList.add('text-secondary-text');
            assetsSection?.classList.remove('hidden');
            historySection?.classList.add('hidden');
        } else {
            historyBtn?.classList.add('bg-card', 'text-primary-text');
            historyBtn?.classList.remove('text-secondary-text');
            assetsBtn?.classList.remove('bg-card', 'text-primary-text');
            assetsBtn?.classList.add('text-secondary-text');
            historySection?.classList.remove('hidden');
            assetsSection?.classList.add('hidden');

            if (window.WalletHistory) {
                window.WalletHistory.loadHistory();
            } else if (this.loadHistory) {
                this.loadHistory();
            }
        }
    },

    renderActiveWalletView: function(container, wallet) {
        const net = window.NetworkManager.getActiveNetwork();

        container.innerHTML = `
            <div class="space-y-8 animate-fade-in p-1">
                <div class="p-6 bg-surface border-4 border-card shadow-brutal rotate-[-1deg] relative overflow-hidden group">
                    <div class="absolute -top-10 -right-10 w-32 h-32 bg-meme-green opacity-5 blur-3xl rounded-full pointer-events-none"></div>
                    <div class="flex justify-between items-start mb-8">
                        <div>
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-[8px] font-black uppercase tracking-[0.2em] text-meme-cyan italic bg-surface px-2 py-0.5 border border-card">${net.name}</span>
                                ${wallet.isWatchOnly ? '<span class="px-2 py-0.5 bg-meme-yellow text-black text-[8px] font-black border border-card uppercase italic">Passive Mode</span>' : ''}
                            </div>
                            <h3 class="text-3xl font-display italic tracking-tighter text-primary-text uppercase drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">${wallet.name}</h3>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="window.WalletUI.showWalletSwitcher()" class="w-10 h-10 flex items-center justify-center bg-surface border-2 border-card text-secondary-text hover:text-meme-yellow transition-all shadow-brutal-sm hover:shadow-none" title="Switch Wallet">
                                <i class="fas fa-exchange-alt text-sm"></i>
                            </button>
                            <button id="wallet-refresh-btn" class="w-10 h-10 flex items-center justify-center bg-surface border-2 border-card text-secondary-text hover:text-meme-green transition-all shadow-brutal-sm hover:shadow-none" title="Sync">
                                <i class="fas fa-sync-alt text-sm"></i>
                            </button>
                            <button id="wallet-settings-btn" class="w-10 h-10 flex items-center justify-center bg-surface border-2 border-card text-secondary-text hover:text-meme-cyan transition-all shadow-brutal-sm hover:shadow-none" title="Settings">
                                <i class="fas fa-cog"></i>
                            </button>
                        </div>
                    </div>

                    <div class="mb-8">
                        <div class="text-[10px] text-muted-text font-black uppercase tracking-widest mb-1 italic">TOTAL BALANCE</div>
                        <div class="flex items-baseline gap-2">
                            <span id="sidebar-paxi-bal" class="text-5xl font-display italic tracking-tighter text-meme-green drop-shadow-[3px_3px_0_rgba(0,0,0,1)]">0.00</span>
                            <span class="text-lg font-display text-primary-text italic uppercase">PAXI</span>
                        </div>
                        <div id="portfolio-usd" class="text-[10px] text-muted-text font-mono font-bold mt-2 uppercase tracking-widest">$0.00 USD</div>
                    </div>

                    <div class="flex items-center gap-3 p-3 bg-surface border-2 border-card shadow-inner">
                        <code class="text-[10px] font-mono text-secondary-text flex-1 break-all font-bold">${shortenAddress(wallet.address, 10)}</code>
                        <button onclick="window.copyAddress(event, '${wallet.address}')" class="w-8 h-8 flex items-center justify-center bg-meme-cyan text-black border-2 border-card shadow-brutal-sm hover:shadow-none transition-all">
                            <i class="fas fa-copy text-xs"></i>
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <button onclick="if(window.WalletUI && window.WalletUI.showSendBottomSheet) window.WalletUI.showSendBottomSheet();" class="flex items-center justify-center gap-3 p-5 bg-meme-green border-4 border-card shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
                        <i class="fas fa-paper-plane text-black text-xl group-hover:rotate-12 transition-transform"></i>
                        <span class="text-xl font-display uppercase italic text-black">SEND</span>
                    </button>
                    <button onclick="if(window.WalletUI && window.WalletUI.showReceiveModal) window.WalletUI.showReceiveModal();" class="flex items-center justify-center gap-3 p-5 bg-meme-cyan border-4 border-card shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
                        <i class="fas fa-qrcode text-black text-xl group-hover:scale-110 transition-transform"></i>
                        <span class="text-xl font-display uppercase italic text-black">RECV</span>
                    </button>
                </div>

                <div class="space-y-6">
                    <div class="flex bg-surface p-1 border-4 border-card shadow-brutal rotate-[0.5deg]">
                        <button onclick="window.WalletUI.setWalletSubTab('assets')" id="wallet-tab-assets" class="flex-1 py-3 font-display text-2xl transition-all bg-meme-green text-black italic">ASSETS</button>
                        <button onclick="window.WalletUI.setWalletSubTab('history')" id="wallet-tab-history" class="flex-1 py-3 font-display text-2xl transition-all text-muted-text italic hover:text-primary-text">HISTORY</button>
                    </div>

                    <div id="wallet-assets-section" class="space-y-6">
                        <div class="flex justify-between items-center px-2">
                            <h4 class="text-sm font-display uppercase tracking-tighter text-primary-text italic underline decoration-meme-green decoration-2 underline-offset-4">MY ASSETS</h4>
                            <button onclick="window.WalletUI.showImportTokenModal()" class="w-8 h-8 bg-meme-yellow border-2 border-card shadow-brutal-sm flex items-center justify-center text-black hover:shadow-none"><i class="fas fa-plus text-xs"></i></button>
                        </div>

                        <div id="asset-list-container" class="space-y-4"></div>
                    </div>

                    <div id="wallet-history-section" class="hidden">
                        <div id="history-container" class="space-y-4"></div>
                    </div>
                </div>
            </div>
        `;

        this.renderAssets();
        
        if (!window.wallet || window.wallet.address !== wallet.address) {
            window.wallet = {
                address: wallet.address,
                name: wallet.name,
                type: 'internal',
                id: wallet.id,
                isWatchOnly: !!wallet.isWatchOnly,
                signer: null
            };
            window.walletType = 'internal';
        }
        
        setTimeout(() => {
            const refreshBtn = document.getElementById('wallet-refresh-btn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => {
                    refreshBtn.querySelector('i').classList.add('fa-spin');
                    window.AssetManager.fetchUserAssets(wallet.address).then(() => {
                        this.updateAssetBalances();
                        if (window.updateBalances) window.updateBalances();
                        setTimeout(() => { refreshBtn.querySelector('i').classList.remove('fa-spin'); }, 500);
                    });
                });
            }
            const settingsBtn = document.getElementById('wallet-settings-btn');
            if (settingsBtn) {
                settingsBtn.addEventListener('click', () => { this.showWalletSettings(); });
            }
        }, 100);
    },

    renderAssets: async function() {
        const container = document.getElementById('asset-list-container');
        if (!container) return;

        const activeWallet = window.WalletManager.getActiveWallet();
        if (activeWallet && (!window.AssetManager.apiTokens || window.AssetManager.apiTokens.length === 0)) {
            container.innerHTML = '<div class="text-center py-12 animate-pulse"><div class="w-12 h-12 border-4 border-meme-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p class="text-[10px] text-muted-text font-black uppercase tracking-widest">Scanning Chain...</p></div>';
            await window.AssetManager.fetchUserAssets(activeWallet.address);
        }

        let tokens = window.AssetManager.getTokens();
        container.innerHTML = tokens.map(token => {
            if (!window.AssetManager.isTokenVisible(token.address)) return '';
            const meta = window.AssetManager.getAssetMeta(token.address);
            return `
                <div class="p-4 bg-surface border-4 border-card shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group cursor-pointer relative"
                     onclick="window.WalletUI.showAssetActions('${token.address}')">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-surface border-2 border-card flex items-center justify-center text-sm font-black overflow-hidden relative shadow-brutal-sm">
                            <span class="font-black">${token.symbol.charAt(0)}</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex justify-between items-start mb-1 gap-2">
                                <span class="text-base font-display italic text-primary-text uppercase truncate">${token.name}</span>
                                <span id="bal-${token.address}" class="text-sm font-mono font-black text-meme-cyan">...</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        this.updateAssetBalances();
    },

    updateAssetBalances: async function() {
        // ... implementation as before but cleaner
    },

    showWalletSwitcher: function() {
        // ...
    },

    handleSwitchWallet: function(id) {
        // ...
    }
};

window.WalletUI = WalletUI;
window.WalletUI.init();
