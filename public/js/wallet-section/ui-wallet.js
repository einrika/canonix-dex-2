// ============================================
// UI-WALLET.JS - User Interface & Interaction
// ============================================

import { State } from '../core/state.js';
import { APP_CONFIG } from '../core/config.js';
import { fetchDirect, log, formatAmount, shortenAddress, showNotif } from '../core/utils.js';
import { wallets, security, assets, networks } from './wallet-core.js';
import { WalletHistory } from './history.js';

export const WalletUI = {
    init: function() {
        this.setupListeners();
        console.log('✅ WalletUI initialized');
    },

    setupListeners: function() {
        window.addEventListener('paxi_wallets_updated', () => this.renderDashboard());
        window.addEventListener('paxi_active_wallet_changed', () => this.renderDashboard());
        window.addEventListener('paxi_assets_updated', () => this.renderDashboard());
    },

    renderDashboard: function() {
        const container = document.getElementById('sidebarContent');
        if (!container || State.get('sidebarTab') !== 'wallet') return;

        const activeWallet = wallets.getActiveWallet();
        const isLocked = !security.getSessionPin();

        if (!activeWallet) {
            container.innerHTML = this.getNoWalletTemplate();
            this.attachNoWalletEvents(container);
            return;
        }

        if (isLocked && !activeWallet.isWatchOnly) {
            container.innerHTML = this.getLockedTemplate();
            this.attachLockedEvents(container);
            return;
        }

        this.renderActiveWalletView(container, activeWallet);
    },

    getNoWalletTemplate: function() {
        return `
            <div class="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in">
                <div class="w-16 h-16 bg-meme-green border-4 border-black shadow-brutal flex items-center justify-center mb-8 rotate-[-10deg]">
                    <i class="fas fa-wallet text-3xl text-black"></i>
                </div>
                <h3 class="text-3xl font-display italic mb-4 uppercase text-white">NO WALLET</h3>
                <div class="flex flex-col gap-4 w-full">
                    <button id="create-wallet-btn" class="w-full py-4 bg-meme-green text-black font-display text-xl border-4 border-black shadow-brutal hover:shadow-none transition-all uppercase italic">CREATE NEW</button>
                    <button id="import-wallet-btn" class="w-full py-4 bg-black border-4 border-black text-white font-display text-xl shadow-brutal-cyan hover:shadow-none transition-all uppercase italic">IMPORT WALLET</button>
                </div>
            </div>
        `;
    },

    attachNoWalletEvents: function(container) {
        container.querySelector('#create-wallet-btn')?.addEventListener('click', () => {
             // Logic to create wallet
        });
        container.querySelector('#import-wallet-btn')?.addEventListener('click', () => {
             // Show import modal
        });
    },

    getLockedTemplate: function() {
        return `
            <div class="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
                <div class="w-16 h-16 bg-meme-pink border-4 border-black shadow-brutal flex items-center justify-center mb-8 rotate-[10deg]">
                    <i class="fas fa-lock text-3xl text-white"></i>
                </div>
                <h3 class="text-3xl font-display italic mb-4 uppercase text-white">WALLET LOCKED</h3>
                <button id="unlock-wallet-btn" class="w-full py-5 bg-meme-pink text-white font-display text-2xl border-4 border-black shadow-brutal hover:shadow-none transition-all uppercase italic">UNLOCK NOW</button>
            </div>
        `;
    },

    attachLockedEvents: function(container) {
        container.querySelector('#unlock-wallet-btn')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('paxi_show_pin_sheet', {
                detail: {
                    title: 'Unlock Wallet',
                    callback: async (pin) => {
                        try {
                            const active = wallets.getActiveWallet();
                            await security.decrypt(active.encryptedData, pin);
                            security.setSessionPin(pin);
                            this.renderDashboard();
                        } catch (e) {
                            showNotif('Wrong PIN', 'error');
                        }
                    }
                }
            }));
        });
    },

    renderActiveWalletView: function(container, wallet) {
        const net = networks.getActiveNetwork();
        const paxiAsset = (State.get('userAssets') || []).find(a => a.address === 'PAXI');
        const paxiBal = paxiAsset ? (paxiAsset.balance / 1e6).toFixed(2) : '0.00';

        container.innerHTML = `
            <div class="space-y-6 animate-fade-in p-1">
                <div class="p-6 bg-meme-surface border-4 border-black shadow-brutal rotate-[-1deg] relative overflow-hidden">
                    <div class="flex justify-between items-start mb-8">
                        <div>
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-[8px] font-black uppercase bg-black px-2 py-0.5 border border-black text-meme-cyan">${net.name}</span>
                            </div>
                            <h3 class="text-3xl font-display italic tracking-tighter text-white uppercase">${wallet.name}</h3>
                        </div>
                        <div class="flex gap-2">
                            <button id="wallet-switcher-btn" class="w-10 h-10 flex items-center justify-center bg-black border-2 border-black text-gray-500 hover:text-meme-yellow shadow-brutal-sm hover:shadow-none"><i class="fas fa-exchange-alt"></i></button>
                            <button id="wallet-refresh-btn" class="w-10 h-10 flex items-center justify-center bg-black border-2 border-black text-gray-500 hover:text-meme-green shadow-brutal-sm hover:shadow-none"><i class="fas fa-sync-alt"></i></button>
                        </div>
                    </div>

                    <div class="mb-8">
                        <div class="text-[10px] text-gray-700 font-black uppercase mb-1 italic">TOTAL BALANCE</div>
                        <div class="flex items-baseline gap-2">
                            <span id="sidebar-paxi-bal" class="text-5xl font-display italic text-meme-green">${paxiBal}</span>
                            <span class="text-lg font-display text-white italic uppercase">PAXI</span>
                        </div>
                    </div>

                    <div class="flex items-center gap-3 p-3 bg-black border-2 border-black shadow-inner">
                        <code class="text-[10px] font-mono text-gray-500 flex-1 break-all font-bold">${shortenAddress(wallet.address, 10)}</code>
                        <button id="copy-addr-btn" class="w-8 h-8 flex items-center justify-center bg-meme-cyan text-black border-2 border-black shadow-brutal-sm hover:shadow-none transition-all"><i class="fas fa-copy text-xs"></i></button>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <button id="send-btn" class="flex items-center justify-center gap-3 p-5 bg-meme-green border-4 border-black shadow-brutal hover:shadow-none transition-all">
                        <i class="fas fa-paper-plane text-black text-xl"></i>
                        <span class="text-xl font-display uppercase italic text-black">SEND</span>
                    </button>
                    <button id="recv-btn" class="flex items-center justify-center gap-3 p-5 bg-meme-cyan border-4 border-black shadow-brutal hover:shadow-none transition-all">
                        <i class="fas fa-qrcode text-black text-xl"></i>
                        <span class="text-xl font-display uppercase italic text-black">RECV</span>
                    </button>
                </div>

                <div class="flex bg-black p-1 border-4 border-black shadow-brutal">
                    <button id="tab-assets" class="flex-1 py-3 font-display text-2xl transition-all bg-meme-green text-black italic">ASSETS</button>
                    <button id="tab-history" class="flex-1 py-3 font-display text-2xl transition-all text-gray-600 italic hover:text-white">HISTORY</button>
                </div>

                <div id="wallet-content-area" class="space-y-4">
                    <!-- Assets or History List -->
                </div>
            </div>
        `;

        this.attachDashboardEvents(container, wallet);
        this.setSubTab('assets');
    },

    attachDashboardEvents: function(container, wallet) {
        container.querySelector('#wallet-refresh-btn')?.addEventListener('click', (e) => {
            const icon = e.currentTarget.querySelector('i');
            icon.classList.add('fa-spin');
            assets.fetchUserAssets(wallet.address).then(() => {
                icon.classList.remove('fa-spin');
            });
        });

        container.querySelector('#copy-addr-btn')?.addEventListener('click', () => {
            navigator.clipboard.writeText(wallet.address);
            showNotif('Address copied');
        });

        container.querySelector('#tab-assets')?.addEventListener('click', () => this.setSubTab('assets'));
        container.querySelector('#tab-history')?.addEventListener('click', () => this.setSubTab('history'));

        container.querySelector('#wallet-switcher-btn')?.addEventListener('click', () => {
             window.dispatchEvent(new CustomEvent('paxi_show_wallet_switcher'));
        });
    },

    setSubTab: function(tab) {
        const assetsBtn = document.getElementById('tab-assets');
        const historyBtn = document.getElementById('tab-history');
        const contentArea = document.getElementById('wallet-content-area');
        if (!contentArea) return;

        if (tab === 'assets') {
            assetsBtn?.classList.add('bg-meme-green', 'text-black');
            assetsBtn?.classList.remove('text-gray-600');
            historyBtn?.classList.remove('bg-meme-green', 'text-black');
            historyBtn?.classList.add('text-gray-600');
            this.renderAssets(contentArea);
        } else {
            historyBtn?.classList.add('bg-meme-green', 'text-black');
            historyBtn?.classList.remove('text-gray-600');
            assetsBtn?.classList.remove('bg-meme-green', 'text-black');
            assetsBtn?.classList.add('text-gray-600');
            this.renderHistory(contentArea);
        }
    },

    renderAssets: function(container) {
        const tokens = assets.getTokens();
        if (tokens.length === 0) {
            container.innerHTML = '<div class="text-center py-8 text-gray-600 uppercase font-black text-[10px]">No Assets Found</div>';
            return;
        }

        container.innerHTML = tokens.map(token => `
            <div class="p-4 bg-meme-surface border-4 border-black shadow-brutal-sm hover:shadow-none transition-all cursor-pointer">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-black border-2 border-black flex items-center justify-center text-xs font-black text-white">
                        ${token.symbol.charAt(0)}
                    </div>
                    <div class="flex-1">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-display italic text-white uppercase">${token.name}</span>
                            <span class="text-sm font-mono font-black text-meme-cyan">${(token.balance / Math.pow(10, token.decimals || 6)).toFixed(4)}</span>
                        </div>
                        <div class="text-[9px] font-black text-gray-600 uppercase tracking-widest italic">${token.symbol}</div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    renderHistory: function(container) {
        container.innerHTML = '<div id="history-container"></div>';
        WalletHistory.loadHistory();
    }
};
