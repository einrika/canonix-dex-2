// ============================================
// UI-WALLET.JS - User Interface & Interaction
// ============================================

// ===== 1. WALLET UI MAIN MODULE =====
window.WalletUI = window.WalletUI || {};

Object.assign(window.WalletUI, {
    init: function() {
        this.setupListeners();
        console.log('✅ WalletUI initialized (Brutal Meme edition)');
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
        const container = document.getElementById('sidebarContent');
        if (!container || window.currentSidebarTab !== 'wallet') return;

        const activeWallet = window.WalletManager.getActiveWallet();

        if (!activeWallet) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
                    <div class="w-24 h-24 bg-meme-green border-4 border-black shadow-brutal flex items-center justify-center mb-10 rotate-[-10deg]">
                        <i class="fas fa-wallet text-4xl text-black"></i>
                    </div>
                    <h3 class="text-4xl font-display text-white italic mb-4 uppercase tracking-tighter">No Wallet Detected</h3>
                    <p class="font-mono text-[10px] text-gray-600 mb-12 uppercase font-bold tracking-widest">Connect or build a terminal to start pumping</p>
                    <div class="space-y-4 w-full">
                        <button onclick="window.WalletUI.showCreateModal()" class="w-full py-5 bg-meme-green text-black font-display text-2xl border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic">Spawn New Terminal</button>
                        <button onclick="window.WalletUI.showImportModal()" class="w-full py-5 bg-meme-surface text-white font-display text-2xl border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic">Import Identity</button>
                    </div>
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
            assetsBtn.classList.add('bg-meme-card', 'text-white', 'shadow-brutal');
            assetsBtn.classList.remove('text-gray-600');
            historyBtn.classList.remove('bg-meme-card', 'text-white', 'shadow-brutal');
            historyBtn.classList.add('text-gray-600');
            assetsSection.classList.remove('hidden');
            historySection.classList.add('hidden');
        } else {
            historyBtn.classList.add('bg-meme-card', 'text-white', 'shadow-brutal');
            historyBtn.classList.remove('text-gray-600');
            assetsBtn.classList.remove('bg-meme-card', 'text-white', 'shadow-brutal');
            assetsBtn.classList.add('text-gray-600');
            historySection.classList.remove('hidden');
            assetsSection.classList.add('hidden');
            this.loadHistory();
        }
    },

    loadHistory: function() {
        const container = document.getElementById('history-container');
        if (!container) return;

        const activeWallet = window.WalletManager.getActiveWallet();
        if (!activeWallet) return;

        container.innerHTML = '<div class="text-center py-20"><div class="w-12 h-12 border-4 border-meme-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p class="font-mono text-[10px] text-gray-600 font-bold uppercase tracking-widest">Retrieving Logs...</p></div>';
        
        if (window.fetchUserTransactions) {
            window.fetchUserTransactions(activeWallet.address).then(txs => {
                if (!txs || txs.length === 0) {
                    container.innerHTML = `
                        <div class="text-center py-20">
                            <i class="fas fa-history text-5xl text-gray-800 mb-6 opacity-20"></i>
                            <p class="font-display text-2xl text-gray-700 uppercase italic">Empty Battlefield</p>
                        </div>
                    `;
                    return;
                }

                container.innerHTML = `
                    <div class="space-y-4">
                        ${txs.slice(0, 20).map(tx => {
                            const isSent = tx.from === activeWallet.address;
                            const type = isSent ? 'Sent' : 'Recv';
                            const icon = isSent ? 'fa-arrow-up' : 'fa-arrow-down';
                            const color = isSent ? 'text-meme-pink' : 'text-meme-green';
                            
                            return `
                                <div class="p-4 bg-meme-surface border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                                    <div class="flex items-center gap-4">
                                        <div class="w-10 h-10 bg-black border-2 border-black flex items-center justify-center ${color} rotate-[-5deg]">
                                            <i class="fas ${icon}"></i>
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <div class="flex justify-between items-center mb-1">
                                                <span class="font-display text-lg italic ${color} uppercase">${type}</span>
                                                <span class="font-mono text-xs font-bold text-white">${tx.amount || '0'} ${tx.symbol || 'PAXI'}</span>
                                            </div>
                                            <div class="font-mono text-[9px] text-gray-600 truncate">${window.shortenAddress(isSent ? tx.to : tx.from)}</div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }).catch(err => {
                container.innerHTML = '<div class="text-center py-10 font-display text-meme-pink">SCAN ERROR</div>';
            });
        }
    },

    setAssetTab: function(tab) {
        const tokensBtn = document.getElementById('tab-tokens');
        const lpBtn = document.getElementById('tab-lp');
        const tokensSec = document.getElementById('tokens-section');
        const lpSec = document.getElementById('lp-section');

        if (tab === 'tokens') {
            tokensBtn.classList.add('bg-meme-card', 'text-white', 'shadow-brutal');
            tokensBtn.classList.remove('text-gray-600');
            lpBtn.classList.remove('bg-meme-card', 'text-white', 'shadow-brutal');
            lpBtn.classList.add('text-gray-600');
            tokensSec.classList.remove('hidden');
            lpSec.classList.add('hidden');
        } else {
            lpBtn.classList.add('bg-meme-card', 'text-white', 'shadow-brutal');
            lpBtn.classList.remove('text-gray-600');
            tokensBtn.classList.remove('bg-meme-card', 'text-white', 'shadow-brutal');
            tokensBtn.classList.add('text-gray-600');
            lpSec.classList.remove('hidden');
            tokensSec.classList.add('hidden');
            this.renderLPAssets();
        }
    },

    renderLPAssets: async function() {
        const container = document.getElementById('lp-list-container');
        if (!container) return;

        const activeWallet = window.WalletManager.getActiveWallet();
        if (!activeWallet) return;

        container.innerHTML = '<div class="text-center py-10"><div class="w-10 h-10 border-4 border-meme-cyan border-t-transparent rounded-full animate-spin mx-auto"></div></div>';

        const lps = await window.fetchUserLPPositions(activeWallet.address);

        if (lps.length === 0) {
            container.innerHTML = '<div class="text-center py-10 font-display text-gray-700 text-xl uppercase italic">No LP Positions Found</div>';
            return;
        }

        container.innerHTML = lps.map(lp => `
            <div class="p-6 bg-meme-surface border-4 border-black shadow-brutal mb-4 rotate-[1deg]">
                <div class="flex justify-between items-start mb-6">
                    <div class="flex items-center gap-3">
                        <div class="flex -space-x-3">
                            <div class="w-10 h-10 rounded-full bg-meme-green border-4 border-black flex items-center justify-center text-black font-display text-xl rotate-[-10deg]">P</div>
                            <div class="w-10 h-10 rounded-full bg-meme-pink border-4 border-black flex items-center justify-center text-white font-display text-xl rotate-[10deg]">${lp.symbol.charAt(0)}</div>
                        </div>
                        <span class="font-display text-2xl italic text-white uppercase tracking-tighter">${lp.symbol} POOL</span>
                    </div>
                    <div class="text-right">
                        <div class="font-mono text-sm font-bold text-white">${lp.lpBalance} LP</div>
                        <div class="font-display text-lg text-meme-cyan italic uppercase">${lp.share}% Share</div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="p-4 bg-black border-2 border-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                        <div class="font-mono text-[9px] text-gray-600 font-bold mb-1 uppercase">${lp.paxiReserve} PAXI</div>
                        <div class="font-mono text-[9px] text-gray-600 font-bold uppercase">${lp.prc20Reserve} ${lp.symbol}</div>
                    </div>
                    <div class="p-4 bg-black border-2 border-black shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] text-right">
                        <div class="font-display text-xl text-meme-green italic">$${lp.totalUSD}</div>
                        <div class="font-mono text-[8px] text-gray-600 uppercase">Value</div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <button onclick="window.WalletUI.handleAssetAction('${lp.prc20}', 'lp')" class="py-3 bg-meme-green text-black border-2 border-black font-display text-xl uppercase italic shadow-brutal hover:shadow-none transition-all">Add</button>
                    <button onclick="window.WalletUI.handleAssetAction('${lp.prc20}', 'lp')" class="py-3 bg-meme-pink text-white border-2 border-black font-display text-xl uppercase italic shadow-brutal hover:shadow-none transition-all">Out</button>
                </div>
            </div>
        `).join('');
    },

    renderActiveWalletView: function(container, wallet) {
        const net = window.NetworkManager.getActiveNetwork();

        container.innerHTML = `
            <div class="space-y-8 animate-fade-in">
                <!-- Wallet Card -->
                <div class="p-8 bg-meme-surface border-4 border-black shadow-brutal-lg relative overflow-hidden group rotate-[-1deg]">
                    <div class="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                        <i class="fas fa-microchip text-[120px]"></i>
                    </div>
                    <div class="flex justify-between items-start mb-8 relative z-10">
                        <div>
                            <div class="flex items-center gap-3 mb-2">
                                <span class="font-mono text-[9px] font-black uppercase tracking-[0.3em] text-meme-cyan italic bg-black px-2">${net.name}</span>
                                ${wallet.isWatchOnly ? '<span class="px-2 py-0.5 bg-meme-yellow text-black border-2 border-black text-[8px] font-black uppercase italic">Spy Mode</span>' : ''}
                            </div>
                            <h3 class="text-4xl font-display italic tracking-tighter text-white uppercase truncate max-w-[200px] drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">${wallet.name}</h3>
                        </div>
                        <div class="flex gap-2">
                            <button id="wallet-refresh-btn" class="w-10 h-10 border-2 border-black bg-black flex items-center justify-center text-meme-green shadow-brutal hover:shadow-none transition-all" title="Refresh">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                            <button id="wallet-settings-btn" class="w-10 h-10 border-2 border-black bg-black flex items-center justify-center text-white shadow-brutal hover:shadow-none transition-all">
                                <i class="fas fa-ellipsis-h"></i>
                            </button>
                        </div>
                    </div>

                    <div class="mb-8 relative z-10">
                        <div class="font-mono text-[10px] text-gray-600 font-bold uppercase tracking-[0.4em] mb-2">NET WORTH</div>
                        <div class="flex items-baseline gap-3">
                            <span id="sidebar-paxi-bal" class="text-6xl font-display italic tracking-tighter text-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">0.00</span>
                            <span class="text-2xl font-display text-meme-green uppercase italic">PAXI</span>
                        </div>
                        <div id="portfolio-usd" class="font-mono text-xs text-gray-500 font-bold mt-2 uppercase tracking-widest">$0.00 USD</div>
                    </div>

                    <div class="flex items-center gap-4 p-4 bg-black border-4 border-black shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)] relative z-10">
                        <code class="font-mono text-[10px] text-gray-500 flex-1 truncate uppercase">${wallet.address}</code>
                        <button onclick="window.copyAddress(event, '${wallet.address}')" class="text-meme-yellow hover:scale-125 transition-transform">
                            <i class="fas fa-copy text-xl"></i>
                        </button>
                    </div>
                </div>

                <!-- Action Bar -->
                <div class="grid grid-cols-2 gap-6">
                    <button onclick="window.WalletUI.showSendBottomSheet();" class="flex flex-col items-center gap-4 p-6 bg-meme-cyan border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
                        <div class="w-14 h-14 bg-black border-2 border-black flex items-center justify-center text-meme-cyan group-hover:rotate-12 transition-transform shadow-brutal"><i class="fas fa-paper-plane text-xl"></i></div>
                        <span class="font-display text-2xl uppercase italic text-black">Send</span>
                    </button>
                    <button onclick="window.WalletUI.showReceiveModal();" class="flex flex-col items-center gap-4 p-6 bg-meme-pink border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
                        <div class="w-14 h-14 bg-black border-2 border-black flex items-center justify-center text-meme-pink group-hover:rotate-12 transition-transform shadow-brutal"><i class="fas fa-qrcode text-xl"></i></div>
                        <span class="font-display text-2xl uppercase italic text-white">Recv</span>
                    </button>
                </div>

                <!-- Tabs -->
                <div class="space-y-6">
                    <div class="flex bg-black p-2 border-4 border-black shadow-brutal rotate-[0.5deg]">
                        <button onclick="window.WalletUI.setWalletSubTab('assets')" id="wallet-tab-assets" class="flex-1 py-3 font-display text-xl uppercase italic transition-all bg-meme-card text-white shadow-brutal">Bag</button>
                        <button onclick="window.WalletUI.setWalletSubTab('history')" id="wallet-tab-history" class="flex-1 py-3 font-display text-xl uppercase italic transition-all text-gray-700">Logs</button>
                    </div>

                    <!-- Assets Section -->
                    <div id="wallet-assets-section" class="space-y-6">
                        <div class="flex justify-between items-center px-2">
                            <h4 class="font-display text-2xl uppercase italic text-gray-600 tracking-tighter">COLLECTED ASSETS</h4>
                            <button onclick="window.WalletUI.showImportTokenModal()" class="text-meme-cyan hover:scale-125 transition-transform"><i class="fas fa-plus-circle text-2xl"></i></button>
                        </div>

                        <!-- Asset Filters -->
                        <div class="flex items-center justify-between p-4 bg-meme-surface border-4 border-black shadow-brutal">
                            <div class="flex items-center gap-3">
                                <i class="fas fa-sort-amount-down text-meme-cyan"></i>
                                <select onchange="window.WalletUI.setAssetSort(this.value)" class="bg-transparent font-display text-lg uppercase italic text-white outline-none cursor-pointer">
                                    <option value="most" class="bg-black" ${window.AssetManager.settings.assetSort === 'most' ? 'selected' : ''}>MAX VALUE</option>
                                    <option value="least" class="bg-black" ${window.AssetManager.settings.assetSort === 'least' ? 'selected' : ''}>MIN VALUE</option>
                                    <option value="name" class="bg-black" ${window.AssetManager.settings.assetSort === 'name' ? 'selected' : ''}>A-Z NAME</option>
                                </select>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="font-mono text-[9px] font-bold text-gray-600 uppercase">HIDE DUST</span>
                                <label class="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" onchange="window.WalletUI.toggleHideZero(this.checked)" class="sr-only peer" ${window.AssetManager.settings.hideZeroBalance ? 'checked' : ''}>
                                    <div class="w-10 h-5 bg-black border-2 border-black rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-700 after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-meme-green/20 peer-checked:after:bg-meme-green shadow-brutal"></div>
                                </label>
                            </div>
                        </div>

                        <div id="asset-list-container" class="space-y-4">
                            <!-- Assets populated here -->
                        </div>
                    </div>

                    <!-- History Section -->
                    <div id="wallet-history-section" class="hidden">
                        <div id="history-container"></div>
                    </div>
                </div>
            </div>
        `;

        this.renderAssets();
        
        if (!window.wallet || window.wallet.address !== wallet.address) {
            window.wallet = { address: wallet.address, name: wallet.name, type: 'internal', id: wallet.id, isWatchOnly: !!wallet.isWatchOnly, signer: null };
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
            if (settingsBtn) settingsBtn.addEventListener('click', () => this.showWalletSettings());
        }, 100);
        
        setTimeout(() => { if (window.updateBalances) window.updateBalances(); }, 100);
    },

    setAssetSort: function(sort) { window.AssetManager.saveSettings({ assetSort: sort }); this.renderAssets(); },
    toggleHideZero: function(enabled) { window.AssetManager.saveSettings({ hideZeroBalance: enabled }); this.renderAssets(); },

    renderAssets: async function() {
        const container = document.getElementById('asset-list-container');
        if (!container) return;

        const activeWallet = window.WalletManager.getActiveWallet();
        if (activeWallet && (!window.AssetManager.apiTokens || window.AssetManager.apiTokens.length === 0)) {
            container.innerHTML = '<div class="text-center py-20"><div class="w-12 h-12 border-4 border-meme-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p class="font-mono text-[10px] text-gray-600 font-bold uppercase tracking-widest">Inventory Scan...</p></div>';
            await window.AssetManager.fetchUserAssets(activeWallet.address);
        }

        let tokens = window.AssetManager.getTokens();
        const settings = window.AssetManager.settings;

        if (settings.hideZeroBalance) {
            tokens = tokens.filter(token => {
                const amount = token.balance !== undefined ? (token.balance / Math.pow(10, token.decimals || 6)) : 0;
                return amount > 0;
            });
        }

        tokens.sort((a, b) => {
            const balA = a.balance !== undefined ? (a.balance / Math.pow(10, a.decimals || 6)) : 0;
            const balB = b.balance !== undefined ? (b.balance / Math.pow(10, b.decimals || 6)) : 0;
            const metaA = window.AssetManager.getAssetMeta(a.address);
            const metaB = window.AssetManager.getAssetMeta(b.address);
            const priceA = a.address === 'PAXI' ? 1 : (metaA.price || 0);
            const priceB = b.address === 'PAXI' ? 1 : (metaB.price || 0);
            const valA = balA * priceA;
            const valB = balB * priceB;
            switch (settings.assetSort) {
                case 'most': return valB - valA;
                case 'least': return valA - valB;
                case 'name': return a.name.localeCompare(b.name);
                default: return valB - valA;
            }
        });

        container.innerHTML = tokens.map(token => {
            if (!window.AssetManager.isTokenVisible(token.address)) return '';

            const meta = window.AssetManager.getAssetMeta(token.address);
            const changeClass = meta.change24h >= 0 ? 'text-meme-green' : 'text-meme-pink';
            const canHide = token.address !== 'PAXI';

            return `
                <div class="p-6 bg-meme-surface border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group cursor-pointer relative"
                     id="asset-item-${token.address}">
                    <div class="absolute top-4 right-4 flex gap-2 z-10">
                        ${canHide ? `
                            <button onclick="event.stopPropagation(); window.WalletUI.confirmHideToken('${token.address}')" 
                                    class="w-8 h-8 bg-meme-yellow border-2 border-black flex items-center justify-center text-black hover:bg-white transition-all shadow-brutal">
                                <i class="fas fa-eye-slash text-xs"></i>
                            </button>
                        ` : ''}
                        <button onclick="event.stopPropagation(); window.WalletUI.showAssetDetailModal('${token.address}')" 
                                class="w-8 h-8 bg-meme-cyan border-2 border-black flex items-center justify-center text-black hover:bg-white transition-all shadow-brutal">
                            <i class="fas fa-info text-xs"></i>
                        </button>
                    </div>
                    <div class="flex items-center gap-4" onclick="window.WalletUI.showAssetActions('${token.address}')">
                        <div class="w-14 h-14 bg-meme-card border-4 border-black flex items-center justify-center text-2xl font-display overflow-hidden relative shadow-brutal rotate-[-5deg]">
                            ${token.logo ? `<img src="${token.logo}" class="w-full h-full object-cover">` : `<span>${token.symbol.charAt(0)}</span>`}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex justify-between items-start mb-2">
                                <span class="font-display text-2xl italic text-white uppercase truncate pr-12">${token.name}</span>
                                <span id="bal-${token.address}" class="font-mono text-xs font-black text-white bg-black px-2">...</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <div class="flex items-center gap-3">
                                    <span class="font-mono text-[9px] font-black text-meme-cyan uppercase tracking-widest">${token.symbol}</span>
                                    <span class="font-mono text-[8px] font-bold ${changeClass} bg-black px-1">${meta.change24h >= 0 ? '+' : ''}${meta.change24h.toFixed(2)}%</span>
                                </div>
                                <span id="val-${token.address}" class="font-display text-lg text-meme-green italic">...</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        this.updateAssetBalances();
    },

    showAssetDetailModal: function(address) {
        const token = window.AssetManager.apiTokens.find(t => t.address === address);
        if (!token || !token.contractData) return;

        const c = token.contractData;
        const a = token.accountData;
        const meta = window.AssetManager.getAssetMeta(address);
        const balance = a.balance / Math.pow(10, c.decimals || 6);
        const usdValue = balance * meta.priceUSD;

        const formatNumber = (num) => parseFloat(num || 0).toLocaleString(undefined, { maximumFractionDigits: 6 });
        const formatUSD = (num) => '$' + parseFloat(num || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const modalHtml = `
            <div id="assetDetailModal" class="fixed inset-0 bg-black/98 z-[650] flex items-center justify-center p-6 animate-fade-in overflow-y-auto no-scrollbar">
                <div class="bg-meme-surface border-4 border-black w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-brutal-lg flex flex-col my-8">
                    <div class="p-8 border-b-4 border-black flex justify-between items-center bg-black">
                        <div class="flex items-center gap-6">
                            <div class="w-16 h-16 bg-meme-cyan border-4 border-black flex items-center justify-center text-black font-display text-4xl shadow-brutal rotate-[-10deg] overflow-hidden">
                                ${c.logo ? `<img src="${c.logo}" class="w-full h-full object-cover">` : `<span>${c.symbol.charAt(0)}</span>`}
                            </div>
                            <div>
                                <h3 class="text-4xl font-display text-white italic uppercase tracking-tighter">${c.name}</h3>
                                <div class="flex items-center gap-4">
                                    <span class="font-display text-xl text-meme-cyan uppercase italic">${c.symbol}</span>
                                    ${c.official_verified ? '<span class="px-2 py-0.5 bg-meme-green text-black border-2 border-black text-[8px] font-black rounded uppercase italic">VERIFIED</span>' : ''}
                                </div>
                            </div>
                        </div>
                        <button onclick="this.closest('#assetDetailModal').remove()" class="text-meme-pink hover:scale-125 transition-transform"><i class="fas fa-times text-2xl"></i></button>
                    </div>

                    <div class="p-8 space-y-8 bg-meme-surface">
                        <div class="p-6 bg-black border-4 border-black shadow-brutal rotate-[1deg]">
                            <div class="font-mono text-[10px] text-gray-600 font-black uppercase tracking-widest mb-4">TERMINAL HOLDINGS</div>
                            <div class="flex justify-between items-center mb-2">
                                <span class="font-display text-xl text-gray-500 italic">BALANCE</span>
                                <span class="text-4xl font-display text-white italic">${formatNumber(balance)} <span class="text-lg">${c.symbol}</span></span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="font-display text-xl text-gray-500 italic">EQUIVALENT</span>
                                <span class="text-3xl font-display text-meme-green italic">${formatUSD(usdValue)}</span>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-6">
                            <div class="p-4 bg-meme-card border-4 border-black shadow-brutal rotate-[-2deg]">
                                <div class="font-mono text-[8px] text-gray-600 uppercase font-black mb-2">PRICE (PAXI)</div>
                                <div class="text-xl font-mono font-bold text-white">${formatNumber(meta.price)}</div>
                            </div>
                            <div class="p-4 bg-meme-card border-4 border-black shadow-brutal rotate-[2deg]">
                                <div class="font-mono text-[8px] text-gray-600 uppercase font-black mb-2">24H PERFORMANCE</div>
                                <div class="text-xl font-mono font-bold ${meta.change24h >= 0 ? 'text-meme-green' : 'text-meme-pink'}">${meta.change24h >= 0 ? '+' : ''}${meta.change24h.toFixed(2)}%</div>
                            </div>
                        </div>

                        <div class="p-6 bg-black border-4 border-black shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)] space-y-4">
                            <div class="flex justify-between font-mono text-[9px] font-black uppercase tracking-widest"><span class="text-gray-600">24H GIGA VOLUME</span><span class="text-white">${formatUSD(c.volume || 0)}</span></div>
                            <div class="flex justify-between font-mono text-[9px] font-black uppercase tracking-widest"><span class="text-gray-600">ACTIVE APES</span><span class="text-white">${formatNumber(c.holders || 0)}</span></div>
                            <div class="flex justify-between font-mono text-[9px] font-black uppercase tracking-widest border-t-2 border-meme-surface pt-4"><span class="text-gray-600">TOTAL FLOOD</span><span class="text-white">${formatNumber(c.total_supply / Math.pow(10, c.decimals || 6))}</span></div>
                        </div>

                        <div class="p-6 bg-meme-card border-4 border-black shadow-brutal">
                            <div class="font-mono text-[9px] text-gray-600 font-black uppercase mb-4 tracking-widest">CONTRACT DNA</div>
                            <div class="flex items-center gap-4 bg-black p-3 border-2 border-black">
                                <code class="font-mono text-[9px] text-meme-cyan truncate flex-1 uppercase">${c.contract_address}</code>
                                <button onclick="navigator.clipboard.writeText('${c.contract_address}');" class="text-meme-yellow hover:scale-125 transition-transform"><i class="fas fa-copy text-lg"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    confirmHideToken: function(address) {
        const token = window.AssetManager.getTokens().find(t => t.address === address);
        if (!token) return;
        const modalHtml = `
            <div id="hideTokenModal" class="fixed inset-0 bg-black/98 z-[650] flex items-center justify-center p-6 animate-fade-in">
                <div class="bg-meme-surface border-8 border-black w-full max-w-sm rounded-[3rem] p-10 text-center shadow-brutal-lg">
                    <div class="w-24 h-24 bg-meme-yellow border-4 border-black shadow-brutal flex items-center justify-center mx-auto mb-10 rotate-[-10deg]">
                        <i class="fas fa-eye-slash text-4xl text-black"></i>
                    </div>
                    <h3 class="text-4xl font-display text-white uppercase italic tracking-tighter mb-4">PURGE ASSET?</h3>
                    <p class="font-display text-xl text-gray-500 mb-10 uppercase italic">Hide <span class="text-white">${token.symbol}</span> from your main terminal list?</p>
                    <div class="grid grid-cols-2 gap-6">
                        <button onclick="document.getElementById('hideTokenModal').remove()" class="py-4 bg-black border-4 border-black text-gray-600 font-display text-2xl uppercase italic shadow-brutal hover:shadow-none hover:text-white transition-all">ABORT</button>
                        <button onclick="window.AssetManager.toggleVisibility('${address}'); window.WalletUI.renderAssets(); document.getElementById('hideTokenModal').remove();" class="py-4 bg-meme-yellow border-4 border-black text-black font-display text-2xl uppercase italic shadow-brutal hover:shadow-none transition-all">PURGE</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    showAssetActions: function(address) {
        const token = window.AssetManager.getTokens().find(t => t.address === address);
        if (!token) return;
        const modalHtml = `
            <div id="assetActionModal" class="fixed inset-0 bg-black/95 z-[630] flex items-end justify-center p-0" onclick="if(event.target === this) this.remove()">
                <div class="bg-meme-surface border-t-8 border-black w-full max-w-xl rounded-t-[4rem] p-10 animate-slide-up flex flex-col items-center shadow-brutal-lg" onclick="event.stopPropagation()">
                    <div class="w-24 h-4 bg-black rounded-full mb-10"></div>
                    <div class="flex items-center gap-6 mb-10 w-full justify-center">
                        <div class="w-16 h-16 bg-meme-card border-4 border-black shadow-brutal flex items-center justify-center font-display text-3xl overflow-hidden rotate-[-5deg]">${token.logo ? `<img src="${token.logo}" class="w-full h-full object-cover">` : `<span>${token.symbol.charAt(0)}</span>`}</div>
                        <div class="text-center">
                            <h3 class="text-5xl font-display text-white italic uppercase tracking-tighter leading-none">${token.name}</h3>
                            <div class="font-mono text-xs font-black text-meme-cyan uppercase tracking-widest mt-2">${token.symbol}</div>
                        </div>
                    </div>
                    <div class="space-y-6 w-full">
                        <button onclick="window.WalletUI.handleBottomSheetAction('${address}', 'send')" class="w-full flex items-center gap-6 p-6 bg-meme-cyan border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
                            <div class="w-14 h-14 bg-black border-2 border-black flex items-center justify-center text-meme-cyan group-hover:rotate-12 transition-transform shadow-brutal"><i class="fas fa-paper-plane text-2xl"></i></div>
                            <div class="flex-1 text-left"><div class="font-display text-3xl uppercase italic text-black leading-none">DISPATCH</div><div class="font-mono text-[8px] font-black text-black/50 uppercase mt-1">Send to another terminal</div></div>
                            <i class="fas fa-chevron-right text-black/30"></i>
                        </button>
                        <button onclick="window.WalletUI.handleBottomSheetAction('${address}', 'lp')" class="w-full flex items-center gap-6 p-6 bg-meme-green border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
                            <div class="w-14 h-14 bg-black border-2 border-black flex items-center justify-center text-meme-green group-hover:rotate-12 transition-transform shadow-brutal"><i class="fas fa-plus-circle text-2xl"></i></div>
                            <div class="flex-1 text-left"><div class="font-display text-3xl uppercase italic text-black leading-none">REINFORCE LP</div><div class="font-mono text-[8px] font-black text-black/50 uppercase mt-1">Provide pool liquidity</div></div>
                            <i class="fas fa-chevron-right text-black/30"></i>
                        </button>
                        <button onclick="window.WalletUI.handleBottomSheetAction('${address}', 'burn')" class="w-full flex items-center gap-6 p-6 bg-meme-pink border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
                            <div class="w-14 h-14 bg-black border-2 border-black flex items-center justify-center text-meme-pink group-hover:rotate-12 transition-transform shadow-brutal"><i class="fas fa-fire text-2xl"></i></div>
                            <div class="flex-1 text-left"><div class="font-display text-3xl uppercase italic text-white leading-none">INCINERATE</div><div class="font-mono text-[8px] font-black text-white/50 uppercase mt-1">Burn assets permanently</div></div>
                            <i class="fas fa-chevron-right text-white/30"></i>
                        </button>
                    </div>
                    <button onclick="document.getElementById('assetActionModal').remove()" class="w-full mt-10 py-6 bg-black border-4 border-black text-gray-500 font-display text-3xl uppercase italic shadow-brutal hover:shadow-none hover:text-white transition-all">DISMISS</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    handleBottomSheetAction: function(address, action) {
        document.getElementById('assetActionModal')?.remove();
        if (address !== 'PAXI' && window.selectPRC20) window.selectPRC20(address);
        if (action === 'send') this.showSendBottomSheet(address); else this.showActionBottomSheet(action);
    },

    showSendBottomSheet: function(selectedAddress) {
        const tokens = window.AssetManager.getTokens();
        const selectedToken = selectedAddress ? tokens.find(t => t.address === selectedAddress) : tokens[0];
        
        const modalHtml = `
            <div id="sendBottomSheet" class="fixed inset-0 bg-black/98 z-[640] flex items-end justify-center p-0" onclick="if(event.target === this) this.remove()">
                <div class="bg-meme-surface border-t-8 border-black w-full max-w-xl rounded-t-[4rem] max-h-[95vh] overflow-y-auto p-10 shadow-brutal-lg flex flex-col no-scrollbar" onclick="event.stopPropagation()">
                    <div class="w-24 h-4 bg-black rounded-full mx-auto mb-10 shrink-0"></div>
                    
                    <div class="flex items-center justify-between mb-10 shrink-0">
                        <h3 class="text-5xl font-display text-meme-cyan italic uppercase tracking-tighter">ASSET DISPATCH</h3>
                        <button onclick="document.getElementById('sendBottomSheet').remove()" class="text-meme-pink hover:rotate-90 transition-transform"><i class="fas fa-times text-2xl"></i></button>
                    </div>

                    <div class="space-y-8 flex-1">
                        <div>
                            <label class="font-mono text-[10px] text-gray-600 font-black uppercase tracking-widest mb-4 block">1. SELECT PAYLOAD</label>
                            <div class="relative">
                                <button id="token-selector-btn" class="w-full p-6 bg-black border-4 border-black shadow-brutal flex items-center justify-between hover:shadow-none transition-all rotate-[-1deg]">
                                    <div class="flex items-center gap-6" id="selected-token-display">
                                        <div class="w-12 h-12 bg-meme-card border-2 border-black flex items-center justify-center font-display text-2xl overflow-hidden">${selectedToken && selectedToken.logo ? `<img src="${selectedToken.logo}" class="w-full h-full">` : `<span>${selectedToken ? selectedToken.symbol.charAt(0) : 'P'}</span>`}</div>
                                        <div class="text-left">
                                            <div class="font-display text-2xl text-white uppercase italic">${selectedToken ? selectedToken.symbol : 'PAXI'}</div>
                                            <div class="font-mono text-[10px] text-meme-green font-bold uppercase">AVAIL: <span id="selected-token-balance">0.00</span></div>
                                        </div>
                                    </div>
                                    <i class="fas fa-chevron-down text-meme-cyan"></i>
                                </button>
                                <div id="token-dropdown" class="hidden absolute top-full left-0 right-0 mt-4 bg-black border-4 border-black z-20 shadow-brutal-lg max-h-80 overflow-y-auto no-scrollbar">
                                    ${tokens.map(token => `
                                        <button onclick="window.WalletUI.selectSendToken('${token.address}')" class="w-full p-6 flex items-center gap-6 hover:bg-meme-surface transition-all border-b-2 border-black/50">
                                            <div class="w-12 h-12 bg-meme-card border-2 border-black flex items-center justify-center font-display text-2xl overflow-hidden">${token.logo ? `<img src="${token.logo}" class="w-full h-full object-cover">` : `<span>${token.symbol.charAt(0)}</span>`}</div>
                                            <div class="flex-1 text-left">
                                                <div class="font-display text-2xl text-white uppercase italic">${token.symbol}</div>
                                                <div class="font-mono text-[8px] text-gray-600 font-bold uppercase">${token.name}</div>
                                            </div>
                                            <div class="font-mono text-sm text-meme-green font-bold" id="balance-${token.address}">0.00</div>
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label class="font-mono text-[10px] text-gray-600 font-black uppercase tracking-widest mb-4 block">2. TARGET COORDINATES</label>
                            <div class="bg-black border-4 border-black p-6 shadow-brutal rotate-[1deg]">
                                <input type="text" id="send-recipient" placeholder="paxi1..." class="bg-transparent w-full text-white font-mono text-sm uppercase outline-none placeholder:text-gray-900">
                            </div>
                        </div>

                        <div>
                            <label class="font-mono text-[10px] text-gray-600 font-black uppercase tracking-widest mb-4 block">3. DISPATCH VOLUME</label>
                            <div class="bg-black border-4 border-black p-6 shadow-brutal rotate-[-1deg] relative">
                                <input type="number" id="send-amount" placeholder="0.00" class="bg-transparent w-full text-white font-display text-5xl italic outline-none placeholder:text-gray-900 pr-24">
                                <button onclick="window.WalletUI.setMaxAmount()" class="absolute right-6 top-1/2 -translate-y-1/2 px-4 py-2 bg-meme-green text-black font-display text-xl uppercase italic border-2 border-black shadow-brutal hover:shadow-none transition-all">MAX</button>
                            </div>
                        </div>

                        <div>
                            <label class="font-mono text-[10px] text-gray-600 font-black uppercase tracking-widest mb-4 block">4. MISSION LOG (OPTIONAL)</label>
                            <div class="bg-black border-4 border-black p-6 shadow-brutal">
                                <textarea id="send-memo" placeholder="Add custom hash note..." rows="2" class="bg-transparent w-full text-white font-display text-2xl uppercase italic outline-none placeholder:text-gray-900 resize-none"></textarea>
                            </div>
                        </div>

                        <div id="send-confirmation" class="hidden p-8 bg-black border-4 border-meme-cyan shadow-brutal-cyan space-y-4 rotate-[1deg]">
                            <h4 class="font-display text-3xl text-meme-cyan uppercase italic mb-6 border-b-2 border-meme-cyan pb-2">PRE-FLIGHT CHECK</h4>
                            <div class="flex justify-between font-mono text-xs"><span class="text-gray-600 uppercase font-black">PAYLOAD</span><span class="font-bold text-white uppercase" id="confirm-token">-</span></div>
                            <div class="flex justify-between font-mono text-xs"><span class="text-gray-600 uppercase font-black">VOLUME</span><span class="font-bold text-meme-green italic" id="confirm-amount">-</span></div>
                            <div class="flex justify-between font-mono text-xs"><span class="text-gray-600 uppercase font-black">TARGET</span><span class="font-mono text-xs text-meme-yellow uppercase" id="confirm-address">-</span></div>
                            <div class="flex justify-between font-mono text-[10px] pt-4 border-t-2 border-meme-surface"><span class="text-gray-600 uppercase font-black">FUEL COST</span><span class="font-bold text-meme-cyan italic" id="confirm-fee">~0.0063 PAXI</span></div>
                        </div>

                        <div class="space-y-4 pt-10">
                            <button onclick="window.WalletUI.reviewSend(event)" class="w-full py-6 bg-meme-cyan text-black font-display text-4xl border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all uppercase italic">REVIEW DISPATCH</button>
                            <button id="confirm-send-btn" onclick="window.WalletUI.confirmSend()" class="hidden w-full py-6 bg-meme-green text-black font-display text-4xl border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all uppercase italic">EXECUTE PUMP</button>
                            <button onclick="document.getElementById('sendBottomSheet').remove()" class="w-full py-4 bg-black border-4 border-black text-gray-700 font-display text-2xl uppercase italic shadow-brutal hover:shadow-none hover:text-white transition-all">ABORT MISSION</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const selectorBtn = document.getElementById('token-selector-btn');
        const dropdown = document.getElementById('token-dropdown');
        if (selectorBtn && dropdown) {
            selectorBtn.addEventListener('click', (e) => { e.stopPropagation(); dropdown.classList.toggle('hidden'); });
            document.addEventListener('click', () => dropdown.classList.add('hidden'));
        }
        if (selectedToken) this.selectSendToken(selectedToken.address);
        this.updateSendTokenBalances();
    },

    selectSendToken: function(address) {
        window.selectedSendToken = address;
        const token = window.AssetManager.getTokens().find(t => t.address === address);
        if (!token) return;
        const display = document.getElementById('selected-token-display');
        if (display) {
            display.innerHTML = `
                <div class="w-12 h-12 bg-meme-card border-2 border-black flex items-center justify-center font-display text-2xl overflow-hidden">${token.logo ? `<img src="${token.logo}" class="w-full h-full object-cover">` : `<span>${token.symbol.charAt(0)}</span>`}</div>
                <div class="text-left">
                    <div class="font-display text-2xl text-white uppercase italic">${token.symbol}</div>
                    <div class="font-mono text-[10px] text-meme-green font-bold uppercase">AVAIL: <span id="selected-token-balance">...</span></div>
                </div>
            `;
        }
        document.getElementById('token-dropdown')?.classList.add('hidden');
        this.updateSelectedTokenBalance();
    },

    updateSendTokenBalances: async function() {
        const tokens = window.AssetManager.getTokens();
        if (!window.WalletManager.getActiveWallet()) return;
        for (const token of tokens) {
            const balEl = document.getElementById(`balance-${token.address}`);
            if (!balEl) continue;
            let balance = 0;
            if (token.balance !== undefined) balance = token.balance / Math.pow(10, token.decimals || 6);
            balEl.textContent = balance.toFixed(4);
        }
        this.updateSelectedTokenBalance();
    },

    updateSelectedTokenBalance: async function() {
        if (!window.selectedSendToken) return;
        const token = window.AssetManager.getTokens().find(t => t.address === window.selectedSendToken);
        if (!token) return;
        let balance = 0;
        if (token.balance !== undefined) balance = token.balance / Math.pow(10, token.decimals || 6);
        const balEl = document.getElementById('selected-token-balance');
        if (balEl) balEl.textContent = balance.toFixed(4);
        window.currentSendTokenBalance = balance;
    },

    setMaxAmount: function() {
        const amountInput = document.getElementById('send-amount');
        if (amountInput && window.currentSendTokenBalance) amountInput.value = window.currentSendTokenBalance;
    },

    reviewSend: function(event) {
        const token = window.AssetManager.getTokens().find(t => t.address === window.selectedSendToken);
        const recipient = document.getElementById('send-recipient')?.value;
        const amount = document.getElementById('send-amount')?.value;
        if (!token || !recipient || !amount) return;
        document.getElementById('send-confirmation')?.classList.remove('hidden');
        document.getElementById('confirm-send-btn')?.classList.remove('hidden');
        if (event && event.target) event.target.closest('button')?.classList.add('hidden');
        document.getElementById('confirm-token').textContent = token.symbol;
        document.getElementById('confirm-amount').textContent = `${amount} ${token.symbol}`;
        document.getElementById('confirm-address').textContent = window.shortenAddress(recipient, 12);
        document.getElementById('send-confirmation')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    },

    confirmSend: async function() {
        const tokenAddress = window.selectedSendToken;
        const recipient = document.getElementById('send-recipient')?.value;
        const amount = parseFloat(document.getElementById('send-amount')?.value);
        const memo = document.getElementById('send-memo')?.value || "Dispatch from Canonix Terminal";
        if (!tokenAddress || !recipient || isNaN(amount) || amount <= 0) return;
        const btn = document.getElementById('confirm-send-btn');
        if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> PUMPING DATA...'; }
        try {
            await window.executeSendTransaction(tokenAddress, recipient, amount, memo);
            document.getElementById('sendBottomSheet')?.remove();
            setTimeout(async () => {
                if (window.AssetManager) { const active = window.WalletManager.getActiveWallet(); if (active) await window.AssetManager.fetchUserAssets(active.address); }
                if (window.updateBalances) await window.updateBalances();
                this.renderAssets();
            }, 3000);
        } catch (e) { console.error('Send failed:', e); } finally { if (btn) { btn.disabled = false; btn.innerHTML = 'EXECUTE PUMP'; } }
    },

    showActionBottomSheet: function(action) {
        const modalHtml = `
            <div id="actionBottomSheet" class="fixed inset-0 bg-black/95 z-[640] flex items-end justify-center p-0" onclick="if(event.target === this) this.remove()">
                <div class="bg-meme-surface border-t-8 border-black w-full max-w-xl rounded-t-[4rem] max-h-[95vh] overflow-y-auto p-10 shadow-brutal-lg flex flex-col no-scrollbar" onclick="event.stopPropagation()">
                    <div class="w-24 h-4 bg-black rounded-full mx-auto mb-10 shrink-0"></div>
                    <div id="bottomSheetContent" class="flex-1"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const bottomSheetContent = document.getElementById('bottomSheetContent');
        const originalSidebarContent = document.getElementById('sidebarContent');
        if (bottomSheetContent && window.renderSidebarContent) {
            if (originalSidebarContent) originalSidebarContent.id = 'sidebarContent-original';
            bottomSheetContent.id = 'sidebarContent';
            window.renderSidebarContent(action);
            bottomSheetContent.id = 'bottomSheetContent';
            if (originalSidebarContent) originalSidebarContent.id = 'sidebarContent';
        }
    },

    updateAssetBalances: async function() {
        const tokens = window.AssetManager.getTokens();
        const activeWallet = window.WalletManager.getActiveWallet();
        if (!activeWallet) return;
        let paxiBalance = 0;
        try {
            const response = await window.smartFetch(`${window.APP_CONFIG.LCD}/cosmos/bank/v1beta1/balances/${activeWallet.address}`);
            const balances = response.balances || [];
            const paxiBal = balances.find(b => b.denom === 'upaxi');
            paxiBalance = paxiBal ? parseInt(paxiBal.amount) / 1000000 : 0;
        } catch (e) { console.error("❌ PAXI balance fetch error:", e); }
        for (const token of tokens) {
            try {
                let amount = 0;
                if (token.balance !== undefined) amount = token.balance / Math.pow(10, token.decimals || 6);
                else if (token.address === 'PAXI' || token.symbol === 'PAXI') amount = paxiBalance;
                else continue;
                const balEl = document.getElementById(`bal-${token.address}`);
                if (balEl) window.setText(balEl, amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }));
                const valEl = document.getElementById(`val-${token.address}`);
                if (valEl) {
                    const meta = window.AssetManager.getAssetMeta(token.address);
                    const currentPaxiPrice = window.paxiPriceUSD || 0.05;
                    const paxiValue = token.address === 'PAXI' ? amount : (amount * meta.price);
                    const usdValue = paxiValue * currentPaxiPrice;
                    window.setText(valEl, `$${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
                }
                if (window.AssetManager.settings.hideZeroBalance && amount === 0) document.getElementById(`asset-item-${token.address}`)?.classList.add('hidden');
            } catch (e) { console.error(`❌ Balance update error for ${token.symbol}:`, e); }
        }
    },

    showReceiveModal: function() {
        const wallet = window.WalletManager.getActiveWallet();
        if (!wallet) return;
        const modalHtml = `
            <div id="qrModal" class="fixed inset-0 bg-black/98 z-[600] flex items-center justify-center p-6 animate-fade-in">
                <div class="bg-meme-surface border-8 border-black w-full max-w-sm rounded-[3rem] p-10 flex flex-col items-center shadow-brutal-lg">
                    <h3 class="text-4xl font-display text-white italic uppercase tracking-tighter mb-10">TERMINAL COORDS</h3>
                    <div class="bg-white p-6 border-4 border-black shadow-brutal mb-10 rotate-[5deg]">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${wallet.address}" class="w-56 h-56">
                    </div>
                    <div class="bg-black border-4 border-black p-6 w-full flex items-center gap-4 mb-10 shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)]">
                        <code class="font-mono text-[10px] text-gray-500 flex-1 truncate uppercase">${wallet.address}</code>
                        <button onclick="window.copyAddress(event, '${wallet.address}')" class="text-meme-yellow hover:scale-125 transition-transform"><i class="fas fa-copy text-2xl"></i></button>
                    </div>
                    <button onclick="document.getElementById('qrModal').remove()" class="w-full py-5 bg-black border-4 border-black text-gray-600 font-display text-3xl uppercase italic shadow-brutal hover:shadow-none hover:text-white transition-all">DISMISS</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    showWalletSettings: function(id) {
        const walletId = id || window.WalletManager.activeId;
        const wallet = window.WalletManager.getWallets().find(w => w.id === walletId);
        if (!wallet) return;
        const modalHtml = `
            <div id="settingsModal" class="fixed inset-0 bg-black/98 z-[610] flex items-center justify-center p-6" onclick="if(event.target === this) this.remove()">
                <div class="bg-meme-surface border-4 border-black w-full max-w-md rounded-[3rem] p-10 shadow-brutal-lg" onclick="event.stopPropagation()">
                    <div class="flex justify-between items-center mb-10">
                        <h3 class="text-4xl font-display text-white italic uppercase tracking-tighter">TERMINAL SPECS</h3>
                        <button onclick="document.getElementById('settingsModal').remove()" class="text-meme-pink hover:rotate-90 transition-transform"><i class="fas fa-times text-2xl"></i></button>
                    </div>
                    <div class="space-y-8">
                        <div>
                            <label class="font-mono text-[10px] text-gray-600 font-black uppercase tracking-widest mb-4 block">IDENTIFIER</label>
                            <div class="flex gap-4">
                                <input type="text" id="renameInput" value="${wallet.name}" class="flex-1 bg-black border-4 border-black p-4 text-xl font-display italic text-white outline-none focus:border-meme-cyan">
                                <button onclick="window.WalletUI.processRename('${wallet.id}')" class="px-6 bg-meme-cyan text-black font-display text-xl uppercase italic border-2 border-black shadow-brutal hover:shadow-none transition-all">SAVE</button>
                            </div>
                        </div>
                        ${!wallet.isWatchOnly ? `
                            <div class="pt-8 border-t-4 border-black space-y-4">
                                <button onclick="window.WalletUI.exportSecrets('${wallet.id}', 'privatekey')" class="w-full py-4 bg-black border-4 border-black text-white font-display text-2xl uppercase italic shadow-brutal hover:shadow-none hover:bg-meme-green hover:text-black transition-all flex items-center justify-center gap-4">
                                    <i class="fas fa-key text-meme-green"></i> EXPORT PRIVATE KEY
                                </button>
                                <button onclick="window.WalletUI.exportSecrets('${wallet.id}', 'mnemonic')" class="w-full py-4 bg-black border-4 border-black text-white font-display text-2xl uppercase italic shadow-brutal hover:shadow-none hover:bg-meme-pink hover:text-white transition-all flex items-center justify-center gap-4">
                                    <i class="fas fa-shield-alt text-meme-pink"></i> BACKUP SEED PHRASE
                                </button>
                            </div>
                        ` : ''}
                        <div class="pt-8 border-t-4 border-black">
                            <button onclick="window.WalletUI.showHiddenTokens()" class="w-full py-4 bg-black border-4 border-black text-white font-display text-2xl uppercase italic shadow-brutal hover:shadow-none hover:bg-meme-yellow hover:text-black transition-all flex items-center justify-center gap-4">
                                <i class="fas fa-eye-slash text-meme-yellow"></i> HIDDEN ASSETS
                            </button>
                        </div>
                        <div class="pt-8 border-t-4 border-black">
                            <button onclick="window.WalletUI.processDelete('${wallet.id}')" class="w-full py-4 bg-meme-pink/10 border-4 border-meme-pink text-meme-pink font-display text-2xl uppercase italic shadow-brutal-pink hover:shadow-none hover:bg-meme-pink hover:text-white transition-all">
                                <i class="fas fa-trash-alt mr-4"></i> TERMINATE TERMINAL
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    processRename: function(id) {
        const newName = document.getElementById('renameInput').value.trim();
        if (newName && window.WalletManager.renameWallet(id, newName)) { document.getElementById('settingsModal').remove(); this.renderDashboard(); }
    },

    processDelete: function(id) {
        if (confirm("WARNING: Terminal termination is permanent. Ensure all seeds are backed up. Proceed?")) {
            if (window.WalletManager.deleteWallet(id)) { document.getElementById('settingsModal').remove(); this.renderDashboard(); }
        }
    },

    showHiddenTokens: function() {
        const allTokens = window.AssetManager.getTokens();
        const hiddenTokens = allTokens.filter(t => !window.AssetManager.isTokenVisible(t.address));
        const modalHtml = `
            <div id="hiddenTokensModal" class="fixed inset-0 bg-black/98 z-[620] flex items-center justify-center p-6 animate-fade-in" onclick="if(event.target === this) this.remove()">
                <div class="bg-meme-surface border-4 border-black w-full max-w-xl rounded-[3rem] max-h-[85vh] overflow-hidden flex flex-col shadow-brutal-lg" onclick="event.stopPropagation()">
                    <div class="p-8 border-b-4 border-black bg-meme-yellow">
                        <div class="flex items-center justify-between">
                            <h3 class="text-4xl font-display text-black italic uppercase tracking-tighter">PURGED ASSETS</h3>
                            <button onclick="document.getElementById('hiddenTokensModal').remove()" class="text-black hover:rotate-90 transition-transform"><i class="fas fa-times text-2xl"></i></button>
                        </div>
                        <p class="font-mono text-[10px] text-black/50 font-bold uppercase mt-2 tracking-widest">Assets you've hidden from main terminal</p>
                    </div>
                    <div class="flex-1 overflow-y-auto p-8 bg-black no-scrollbar">
                        ${hiddenTokens.length === 0 ? `
                            <div class="text-center py-20">
                                <div class="w-20 h-20 bg-meme-card border-4 border-black shadow-brutal flex items-center justify-center mx-auto mb-8 rotate-[-10deg]">
                                    <i class="fas fa-eye text-3xl text-gray-700"></i>
                                </div>
                                <p class="font-display text-2xl text-gray-700 uppercase italic">Empty Vault</p>
                            </div>
                        ` : `
                            <div class="space-y-4">
                                ${hiddenTokens.map(token => `
                                    <div class="p-6 bg-meme-surface border-4 border-black shadow-brutal flex items-center justify-between group hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                                        <div class="flex items-center gap-4">
                                            <div class="w-12 h-12 bg-meme-card border-2 border-black flex items-center justify-center font-display text-2xl overflow-hidden">${token.logo ? `<img src="${token.logo}" class="w-full h-full object-cover">` : token.symbol.charAt(0)}</div>
                                            <div>
                                                <div class="font-display text-2xl text-white italic uppercase leading-none">${token.name}</div>
                                                <div class="font-mono text-[9px] text-meme-cyan uppercase mt-1 font-bold">${token.symbol}</div>
                                            </div>
                                        </div>
                                        <button onclick="window.AssetManager.toggleVisibility('${token.address}'); window.WalletUI.showHiddenTokens(); window.WalletUI.renderAssets();" class="px-6 py-2 bg-meme-green text-black font-display text-xl italic uppercase border-2 border-black shadow-brutal hover:shadow-none transition-all">RESTORE</button>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    exportSecrets: function(id, type) {
        const wallet = window.WalletManager.getWallets().find(w => w.id === id);
        if (!wallet) return;
        window.showPinSheet('AUTH REQUIRED', async (pin) => {
            try {
                const decrypted = await window.WalletSecurity.decrypt(wallet.encryptedData, pin);
                const secretModalHtml = `
                    <div id="secretRevealModal" class="fixed inset-0 bg-black/98 z-[620] flex items-center justify-center p-6 animate-fade-in">
                        <div class="bg-meme-surface border-8 border-black w-full max-w-md rounded-[3rem] p-10 text-center shadow-brutal-lg">
                            <h3 class="text-4xl font-display text-white italic uppercase tracking-tighter mb-4">${type === 'mnemonic' ? 'SEED PHRASE' : 'PRIVATE KEY'}</h3>
                            <p class="font-mono text-[9px] text-meme-pink font-black uppercase tracking-[0.3em] mb-10 italic animate-pulse">⚠️ WARNING: DO NOT SCREENSHOT!</p>
                            <div class="bg-black border-4 border-black p-8 mb-10 relative group shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)]">
                                <div id="secretText" class="font-mono text-xs text-meme-cyan break-all select-all blur-md hover:blur-none transition-all duration-500 uppercase font-bold leading-relaxed">${decrypted}</div>
                                <div class="absolute inset-0 flex items-center justify-center bg-black/80 group-hover:hidden transition-all"><span class="font-display text-2xl text-gray-700 uppercase italic">HOVER TO REVEAL</span></div>
                            </div>
                            <div class="grid grid-cols-2 gap-6">
                                <button onclick="window.copyAddress(event, '${decrypted}')" class="py-4 bg-meme-cyan text-black font-display text-2xl uppercase italic border-4 border-black shadow-brutal hover:shadow-none transition-all">CLONE</button>
                                <button onclick="document.getElementById('secretRevealModal').remove()" class="py-4 bg-black border-4 border-black text-white font-display text-2xl uppercase italic shadow-brutal hover:shadow-none transition-all">DONE</button>
                            </div>
                        </div>
                    </div>
                `;
                document.body.insertAdjacentHTML('beforeend', secretModalHtml);
            } catch (e) { }
        });
    },

    showWalletSwitcher: function() {
        const wallets = window.WalletManager.getWallets();
        const activeId = window.WalletManager.activeId;
        const modalHtml = `
            <div id="switcherModal" class="fixed inset-0 bg-black/98 z-[600] flex items-center justify-center p-6 animate-fade-in">
                <div class="bg-meme-surface border-4 border-black w-full max-w-md rounded-[3rem] flex flex-col max-h-[85vh] shadow-brutal-lg overflow-hidden">
                    <div class="p-8 border-b-4 border-black bg-meme-cyan flex justify-between items-center">
                        <h3 class="text-4xl font-display text-black italic uppercase tracking-tighter">TERMINAL HUB</h3>
                        <button onclick="document.getElementById('switcherModal').remove()" class="text-black hover:rotate-90 transition-transform"><i class="fas fa-times text-2xl"></i></button>
                    </div>
                    <div class="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar bg-black">
                        ${wallets.map(w => `
                            <div class="p-6 border-4 ${w.id === activeId ? 'border-meme-green bg-meme-green/10 shadow-brutal-green rotate-[-1deg]' : 'border-black bg-meme-surface shadow-brutal'} flex items-center gap-4 hover:shadow-none hover:translate-x-1 hover:translate-y-1 cursor-pointer transition-all" onclick="window.WalletUI.switchWallet('${w.id}')">
                                <div class="w-12 h-12 bg-black border-2 border-black flex items-center justify-center ${w.id === activeId ? 'text-meme-green' : 'text-gray-700'} shadow-brutal rotate-[5deg]"><i class="fas ${w.isWatchOnly ? 'fa-eye' : 'fa-wallet'} text-xl"></i></div>
                                <div class="flex-1 min-w-0">
                                    <div class="font-display text-2xl italic truncate uppercase tracking-tighter text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">${w.name}</div>
                                    <div class="font-mono text-[9px] text-gray-600 truncate uppercase mt-1 font-bold">${w.address}</div>
                                </div>
                                ${w.id === activeId ? '<i class="fas fa-check-circle text-meme-green text-2xl"></i>' : ''}
                            </div>
                        `).join('')}
                    </div>
                    <div class="p-8 border-t-4 border-black grid grid-cols-2 gap-6 bg-meme-surface">
                        <button onclick="window.WalletUI.showCreateModal(); document.getElementById('switcherModal').remove()" class="py-4 bg-meme-green text-black font-display text-2xl uppercase italic border-4 border-black shadow-brutal hover:shadow-none transition-all">ADD NEW</button>
                        <button onclick="window.WalletUI.showImportModal(); document.getElementById('switcherModal').remove()" class="py-4 bg-black text-white font-display text-2xl uppercase italic border-4 border-black shadow-brutal hover:shadow-none transition-all">IMPORT</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    switchWallet: function(id) { window.WalletManager.setActiveWallet(id); document.getElementById('switcherModal')?.remove(); this.renderDashboard(); },

    showImportModal: function() {
        const modalHtml = `
            <div id="importModal" class="fixed inset-0 bg-black/98 z-[600] flex items-center justify-center p-6 animate-fade-in">
                <div class="bg-meme-surface border-4 border-black w-full max-w-md rounded-[3rem] p-10 shadow-brutal-lg">
                    <div class="flex justify-between items-center mb-10">
                        <h3 class="text-4xl font-display text-white italic uppercase tracking-tighter">DATA UPLINK</h3>
                        <button onclick="document.getElementById('importModal').remove()" class="text-meme-pink hover:rotate-90 transition-transform"><i class="fas fa-times text-2xl"></i></button>
                    </div>
                    <div class="space-y-8">
                        <div>
                            <label class="font-mono text-[10px] text-gray-600 font-black uppercase tracking-widest mb-4 block">UPLINK TYPE</label>
                            <select id="importType" class="w-full bg-black border-4 border-black p-4 font-display text-xl text-meme-cyan italic uppercase outline-none cursor-pointer shadow-brutal" onchange="window.WalletUI.updateImportFields()">
                                <option value="mnemonic">SEED PHRASE (12/24 WORDS)</option>
                                <option value="privatekey">PRIVATE KEY (HEX)</option>
                                <option value="watchonly">WATCH-ONLY SCAN</option>
                            </select>
                        </div>
                        <div>
                            <label class="font-mono text-[10px] text-gray-600 font-black uppercase tracking-widest mb-4 block">TERMINAL NAME</label>
                            <input type="text" id="importName" placeholder="DEGEN TERMINAL" class="w-full bg-black border-4 border-black p-4 font-display text-2xl text-white italic outline-none focus:border-meme-pink placeholder:text-gray-900 shadow-brutal">
                        </div>
                        <div id="importValueContainer">
                            <label class="font-mono text-[10px] text-gray-600 font-black uppercase tracking-widest mb-4 block">ACCESS PAYLOAD</label>
                            <textarea id="importValue" class="w-full bg-black border-4 border-black p-4 font-mono text-xs text-meme-green outline-none focus:border-meme-green h-32 placeholder:text-gray-900 shadow-brutal" placeholder="word1 word2 ..."></textarea>
                        </div>
                        <button onclick="window.WalletUI.processImport()" class="w-full py-6 bg-meme-cyan text-black font-display text-4xl border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all uppercase italic mt-4">INITIATE UPLINK</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    updateImportFields: function() {
        const type = document.getElementById('importType').value;
        const label = document.querySelector('#importValueContainer label');
        const textarea = document.getElementById('importValue');
        if (type === 'mnemonic') { window.setText(label, 'SEED PHRASE'); textarea.placeholder = 'word1 word2 ...'; }
        else if (type === 'privatekey') { window.setText(label, 'PRIVATE KEY'); textarea.placeholder = '0x...'; }
        else { window.setText(label, 'PAXI ADDRESS'); textarea.placeholder = 'paxi1...'; }
    },

    processImport: async function() {
        try {
            const type = document.getElementById('importType').value;
            const name = document.getElementById('importName').value || 'Imported Terminal';
            const value = document.getElementById('importValue').value.trim();
            if (!value) return;
            if (type === 'watchonly') {
                await window.WalletManager.addWatchOnly(name, value);
                document.getElementById('importModal')?.remove();
                this.renderDashboard();
                return;
            }
            window.showPinSheet('SECURE TERMINAL', async (pin) => {
                try {
                    if (type === 'mnemonic') await window.WalletManager.importMnemonic(name, value, pin);
                    else await window.WalletManager.importPrivateKey(name, value, pin);
                    window.WalletSecurity.setSessionPin(pin);
                    document.getElementById('importModal')?.remove();
                    const active = window.WalletManager.getActiveWallet();
                    if (active) await window.connectInternalWallet(active.id, pin);
                    this.renderDashboard();
                } catch (e) { }
            });
        } catch (e) { console.error("❌ processImport error:", e); }
    },

    showCreateModal: function() { window.setupNewWallet(); }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => window.WalletUI.init());

// ===== 2. SETTINGS MODULE =====
class SettingsManager {
    constructor() {
        this.storageKey = 'paxi_wallet_settings';
        this.defaults = { manualLock: false, advancedGas: false, defaultSlippage: 1.0, currency: 'USD', refreshInterval: 30000, hideSmallBalance: false, customRPC: '', theme: 'dark' };
        this.config = this.load();
    }
    load() { try { const data = localStorage.getItem(this.storageKey); return data ? { ...this.defaults, ...JSON.parse(data) } : this.defaults; } catch (e) { return this.defaults; } }
    save(newConfig) { this.config = { ...this.config, ...newConfig }; localStorage.setItem(this.storageKey, JSON.stringify(this.config)); window.dispatchEvent(new CustomEvent('paxi_settings_updated', { detail: this.config })); }
    get(key) { return this.config[key]; }
}
window.SettingsManager = new SettingsManager();

window.WalletUI.showSettingsPanel = function() {
    const cfg = window.SettingsManager.config;
    const modalHtml = `
        <div id="settingsPanelModal" class="fixed inset-0 bg-black/98 z-[700] flex items-center justify-center p-6 animate-fade-in" onclick="if(event.target === this) this.remove()">
            <div class="bg-meme-surface border-4 border-black w-full max-w-md rounded-[3rem] flex flex-col max-h-[90vh] shadow-brutal-lg overflow-hidden" onclick="event.stopPropagation()">
                <div class="p-8 border-b-4 border-black bg-black flex justify-between items-center">
                    <h3 class="text-4xl font-display text-white italic uppercase tracking-tighter">OS CONFIG</h3>
                    <button onclick="document.getElementById('settingsPanelModal').remove()" class="text-meme-pink hover:rotate-90 transition-transform"><i class="fas fa-times text-2xl"></i></button>
                </div>
                <div class="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar bg-black">
                    <div class="space-y-6">
                        <h4 class="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-meme-cyan italic">SECURITY</h4>
                        <div class="flex justify-between items-center p-4 bg-meme-surface border-2 border-black shadow-brutal">
                            <div><div class="font-display text-2xl text-white italic uppercase">Manual Lock</div><div class="font-mono text-[8px] text-gray-600 font-bold uppercase tracking-widest">Toggle lock in terminal menu</div></div>
                            <input type="checkbox" ${cfg.manualLock ? 'checked' : ''} onchange="window.SettingsManager.save({manualLock: this.checked})" class="w-12 h-6 rounded-full appearance-none bg-black border-2 border-gray-800 checked:bg-meme-green transition-all relative cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-6 before:transition-transform">
                        </div>
                    </div>
                    <div class="space-y-6 pt-8 border-t-2 border-white/5">
                        <h4 class="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-meme-pink italic">TRADING</h4>
                        <div class="flex justify-between items-center p-4 bg-meme-surface border-2 border-black shadow-brutal">
                            <div><div class="font-display text-2xl text-white italic uppercase">Giga Gas</div><div class="font-mono text-[8px] text-gray-600 font-bold uppercase tracking-widest">Show advanced fee breakdown</div></div>
                            <input type="checkbox" ${cfg.advancedGas ? 'checked' : ''} onchange="window.SettingsManager.save({advancedGas: this.checked})" class="w-12 h-6 rounded-full appearance-none bg-black border-2 border-gray-800 checked:bg-meme-pink transition-all relative cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-6 before:transition-transform">
                        </div>
                        <div class="space-y-4">
                            <div class="font-display text-2xl text-white italic uppercase">Default Slippage (%)</div>
                            <div class="bg-meme-surface border-2 border-black p-4 shadow-brutal">
                                <input type="number" step="0.1" value="${cfg.defaultSlippage}" onchange="window.SettingsManager.save({defaultSlippage: parseFloat(this.value)})" class="w-full bg-transparent font-display text-3xl text-meme-pink outline-none italic">
                            </div>
                        </div>
                    </div>
                    <div class="space-y-6 pt-8 border-t-2 border-white/5">
                        <h4 class="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-meme-yellow italic">NETWORK</h4>
                        <div class="space-y-4">
                            <div class="font-display text-2xl text-white italic uppercase">Custom RPC UPLINK</div>
                            <div class="bg-meme-surface border-2 border-black p-4 shadow-brutal">
                                <input type="text" placeholder="https://..." value="${cfg.customRPC}" onchange="window.SettingsManager.save({customRPC: this.value})" class="w-full bg-transparent font-mono text-[10px] text-meme-yellow outline-none uppercase font-bold">
                            </div>
                            <div class="font-mono text-[8px] text-meme-pink uppercase font-black tracking-widest italic animate-pulse">Requires system reboot to apply changes</div>
                        </div>
                    </div>
                </div>
                <div class="p-8 border-t-4 border-black bg-meme-surface">
                    <button onclick="document.getElementById('settingsPanelModal').remove()" class="w-full py-5 bg-black border-4 border-black text-white font-display text-3xl uppercase italic shadow-brutal hover:shadow-none hover:bg-meme-surface transition-all">EXIT CONFIG</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

// ===== 3. CONNECTION & INTERNAL WALLET LOGIC =====

window.internalWalletState = { currentPin: '', pinCallback: null, tempMnemonic: '' };

window.connectInternalWallet = async function(id, pin) {
    try {
        const walletData = window.WalletManager.getWallet(id);
        if (!walletData) throw new Error("Wallet not found");
        if (walletData.isWatchOnly) {
            window.wallet = { address: walletData.address, name: walletData.name, type: 'internal', id: walletData.id, isWatchOnly: true, signer: null };
            window.walletType = 'internal';
        } else {
            const mnemonic = await window.WalletSecurity.decrypt(walletData.encryptedData, pin);
            await window.connectWithMnemonic(mnemonic);
            if (window.wallet) { window.wallet.id = walletData.id; window.wallet.isWatchOnly = false; window.wallet.name = walletData.name; }
        }
        if (window.WalletUI) window.WalletUI.renderDashboard();
        if (window.renderSwapTerminal) window.renderSwapTerminal();
    } catch (e) { }
};

window.connectWallet = async function(type) {
    const btn = document.getElementById('connectBtn');
    window.hideConnectModal();
    if (type === 'internal') {
        window.setSidebarTab('wallet');
        if (window.toggleUnifiedSidebar) window.toggleUnifiedSidebar();
        return;
    }
    btn.innerHTML = '<div class="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>';
    try {
        if (type === 'keplr') {
            if (!window.keplr) throw new Error('Keplr not installed');
            const chainId = 'paxi-mainnet';
            await window.keplr.enable(chainId);
            const offlineSigner = window.keplr.getOfflineSigner(chainId);
            const accounts = await offlineSigner.getAccounts();
            window.wallet = { address: accounts[0].address, signer: offlineSigner, public_key: accounts[0].pubkey };
            window.walletType = 'keplr';
        } else {
            if (typeof window.paxihub === 'undefined') {
                if (/Mobi/.test(navigator.userAgent)) { window.location.href = `paxi://hub/explorer?url=${encodeURIComponent(window.location.href)}`; throw new Error('Redirecting to PaxiHub...'); }
                throw new Error('PaxiHub not installed');
            }
            const addressInfo = await window.paxihub.paxi.getAddress();
            window.wallet = { address: addressInfo.address, public_key: addressInfo.public_key, signer: window.paxihub.paxi };
            window.walletType = 'paxihub';
        }
        btn.innerHTML = `<i class="fas fa-check-circle mr-2 text-meme-green"></i>${window.shortenAddress(window.wallet.address)}`;
        await window.updateBalances();
        await window.updateMyTokens();
        if (window.renderSwapTerminal) window.renderSwapTerminal();
        window.addClass('connectBtn', 'hidden'); window.addClass('mobileConnectBtn', 'hidden');
        if (window.closeAllSidebars) window.closeAllSidebars();
    } catch (e) {
        btn.innerHTML = '<i class="fas fa-plug"></i><span class="hidden xs:inline uppercase">Connect</span>';
    }
};

window.updateBalances = async function() {
    const activeWallet = window.WalletManager?.getActiveWallet();
    if (!activeWallet && !window.wallet) return;
    const walletAddress = activeWallet?.address || window.wallet?.address;
    if (!walletAddress) return;
    try {
        const response = await window.smartFetch(`${window.APP_CONFIG.LCD}/cosmos/bank/v1beta1/balances/${walletAddress}`);
        const balances = response.balances || [];
        const paxiBalance = balances.find(b => b.denom === 'upaxi');
        const paxiRaw = paxiBalance ? paxiBalance.amount : '0';
        const paxiAmount = parseInt(paxiRaw) / 1e6;
        const payBalEl = document.getElementById('payBalance');
        const recvBalEl = document.getElementById('recvBalance');
        let prc20Amount = 0; let prc20Raw = '0';
        if (window.currentPRC20) {
            const tokenDecimals = window.currentTokenInfo?.decimals || 6;
            const bal = await window.getPRC20Balance(walletAddress, window.currentPRC20);
            prc20Raw = bal.toString(); prc20Amount = bal / Math.pow(10, tokenDecimals);
        }
        if (window.tradeType === 'buy') {
            if (payBalEl) { window.setText(payBalEl, paxiAmount.toFixed(4)); payBalEl.setAttribute('data-raw', paxiRaw); }
            if (recvBalEl) { window.setText(recvBalEl, prc20Amount.toFixed(4)); recvBalEl.setAttribute('data-raw', prc20Raw); }
        } else {
            if (payBalEl) { window.setText(payBalEl, prc20Amount.toFixed(4)); payBalEl.setAttribute('data-raw', prc20Raw); }
            if (recvBalEl) { window.setText(recvBalEl, paxiAmount.toFixed(4)); recvBalEl.setAttribute('data-raw', paxiRaw); }
        }
        window.setText('walletBalance', paxiAmount.toFixed(2) + ' PAXI');
        if (window.wallet?.address) window.setText('walletAddrShort', window.shortenAddress(window.wallet.address));
        window.removeClass('walletInfo', 'hidden');
        window.setText('mobileWalletBalance', paxiAmount.toFixed(2) + ' PAXI');
        window.removeClass('mobileWalletInfo', 'hidden'); window.addClass('mobileConnectBtn', 'hidden');
        const sidebarPaxi = document.getElementById('sidebar-paxi-bal');
        if (sidebarPaxi) window.setText(sidebarPaxi, paxiAmount.toFixed(2));
        const portfolioUSD = document.getElementById('portfolio-usd');
        if (portfolioUSD) { const usdValue = paxiAmount * (window.paxiPriceUSD || 0.05); window.setText(portfolioUSD, `$${usdValue.toFixed(2)} USD`); }
    } catch (e) { console.error('❌ Balance update failed:', e); }
};

window.updateLPBalances = async function() {
    if (!window.currentPRC20) return;
    if (!window.lpBalances) window.lpBalances = { paxi: 0, token: 0, lpTokens: 0 };
    try {
        if (window.wallet) {
            const response = await window.smartFetch(`${window.APP_CONFIG.LCD}/cosmos/bank/v1beta1/balances/${window.wallet.address}`);
            const balances = response.balances || [];
            const paxiBalance = balances.find(b => b.denom === 'upaxi');
            const paxiRaw = paxiBalance ? paxiBalance.amount : '0';
            window.lpBalances.paxi = parseInt(paxiRaw) / 1000000; window.lpBalances.paxiRaw = paxiRaw;
            const tokenDecimals = window.currentTokenInfo?.decimals || 6;
            const tokenBalance = await window.getPRC20Balance(window.wallet.address, window.currentPRC20);
            window.lpBalances.token = tokenBalance / Math.pow(10, tokenDecimals); window.lpBalances.tokenRaw = tokenBalance.toString();
            try {
                const posData = await window.smartFetch(`${window.APP_CONFIG.LCD}/paxi/swap/position/${window.wallet.address}/${window.currentPRC20}`);
                const lpAmount = posData.position?.lp_amount || '0';
                window.lpBalances.lpTokens = parseFloat(lpAmount) / 1000000; window.lpBalances.lpRaw = lpAmount.toString();
            } catch (e) { window.lpBalances.lpTokens = 0; window.lpBalances.lpRaw = '0'; }
        }
        const paxiEl = document.getElementById('lpPaxiBalance');
        if (paxiEl) { window.setText(paxiEl, (window.lpBalances.paxi || 0).toFixed(6)); paxiEl.setAttribute('data-raw', window.lpBalances.paxiRaw || '0'); }
        const tokenEl = document.getElementById('lpTokenBalance');
        if (tokenEl) { window.setText(tokenEl, (window.lpBalances.token || 0).toFixed(6)); tokenEl.setAttribute('data-raw', window.lpBalances.tokenRaw || '0'); }
        const yourLP = document.getElementById('yourLPTokens');
        if (yourLP) { window.setText(yourLP, (window.lpBalances.lpTokens || 0).toFixed(6)); yourLP.setAttribute('data-raw', window.lpBalances.lpRaw || '0'); }
        const maxLP = document.getElementById('maxLPTokens');
        if (maxLP) { window.setText(maxLP, (window.lpBalances.lpTokens || 0).toFixed(6)); maxLP.setAttribute('data-raw', window.lpBalances.lpRaw || '0'); }
        if (!window.poolData) await window.fetchPoolData();
        if (window.poolData) {
            const reservePaxi = parseFloat(window.poolData.reserve_paxi || 0) / 1000000;
            const reserveToken = parseFloat(window.poolData.reserve_prc20 || 0) / Math.pow(10, window.currentTokenInfo?.decimals || 6);
            const ratio = reservePaxi > 0 ? (reserveToken / reservePaxi).toFixed(6) : '0';
            if (document.getElementById('poolRatioDisplay')) window.setText('poolRatioDisplay', `1 PAXI = ${ratio} ${window.currentTokenInfo?.symbol || 'TOKEN'}`);
            const posInfo = document.getElementById('yourPositionDetails');
            if (posInfo) {
                if (window.lpBalances.lpTokens > 0) {
                    const totalLP = parseFloat(window.poolData.total_lp_amount || window.poolData.total_lp || 1) / 1000000;
                    const share = window.lpBalances.lpTokens / totalLP;
                    const myPaxi = reservePaxi * share; const myToken = reserveToken * share;
                    posInfo.innerHTML = `
                        <div class="p-4 bg-black border-2 border-meme-surface space-y-2 mt-4 rotate-[-1deg]">
                            <div class="flex justify-between font-mono text-[9px] font-black uppercase tracking-widest"><span class="text-gray-600">POOLED PAXI</span><span class="text-meme-green">${myPaxi.toFixed(2)}</span></div>
                            <div class="flex justify-between font-mono text-[9px] font-black uppercase tracking-widest"><span class="text-gray-600">POOLED ${window.currentTokenInfo?.symbol || 'TOKEN'}</span><span class="text-meme-cyan">${myToken.toFixed(2)}</span></div>
                            <div class="flex justify-between font-mono text-[9px] font-black uppercase tracking-widest border-t border-meme-surface pt-2 mt-2"><span class="text-gray-600">POOL SHARE</span><span class="text-white font-display text-lg italic">${(share * 100).toFixed(4)}%</span></div>
                        </div>
                    `;
                } else posInfo.innerHTML = '';
            }
        }
    } catch (e) { console.error('Failed to update LP balances:', e); }
};

window.disconnectWallet = function() {
    window.wallet = null; window.walletType = null; localStorage.removeItem('paxi_wallet_type');
    window.removeClass('connectBtn', 'hidden'); window.removeClass('mobileConnectBtn', 'hidden');
    window.addClass('walletInfo', 'hidden'); window.addClass('mobileWalletInfo', 'hidden');
    if (window.renderSwapTerminal) window.renderSwapTerminal();
    if (window.WalletUI) window.WalletUI.renderDashboard();
};

window.showInternalWalletSheet = function() {
    const sheet = document.getElementById('internalWalletSheet');
    if (!sheet) return;
    window.removeClass(sheet, 'translate-y-full'); window.removeClass('sheetOverlay', 'hidden');
    window.renderWalletOptions();
};

window.hideInternalWalletSheet = function() { window.addClass('internalWalletSheet', 'translate-y-full'); window.addClass('sheetOverlay', 'hidden'); };

window.showPinSheet = function(title, callback) {
    window.internalWalletState.currentPin = ''; window.internalWalletState.pinCallback = callback;
    window.setText('pinTitle', title); window.removeClass('pinSheet', 'hidden'); window.addClass('pinSheet', 'flex'); window.updatePinDots();
};

window.hidePinSheet = function() { window.addClass('pinSheet', 'hidden'); window.removeClass('pinSheet', 'flex'); };

window.updatePinDots = function() {
    const dots = document.querySelectorAll('#pinDots div');
    const len = window.internalWalletState.currentPin.length;
    dots.forEach((dot, i) => { if (i < len) { dot.classList.add('bg-meme-green', 'shadow-brutal-green'); dot.classList.remove('bg-black'); } else { dot.classList.remove('bg-meme-green', 'shadow-brutal-green'); dot.classList.add('bg-black'); } });
};

window.pressPin = function(n) {
    if (window.internalWalletState.currentPin.length < 6) {
        window.internalWalletState.currentPin += n; window.updatePinDots();
        if (window.internalWalletState.currentPin.length === 6) {
            const pin = window.internalWalletState.currentPin;
            setTimeout(() => { window.hidePinSheet(); if (window.internalWalletState.pinCallback) window.internalWalletState.pinCallback(pin); }, 300);
        }
    }
};

window.backspacePin = function() { window.internalWalletState.currentPin = window.internalWalletState.currentPin.slice(0, -1); window.updatePinDots(); };

window.renderWalletOptions = function() {
    const content = document.getElementById('walletSheetContent');
    const hasWallet = localStorage.getItem('paxi_internal_wallet') !== null;
    if (hasWallet) {
        content.innerHTML = `
            <div class="text-center mb-10">
                <div class="w-24 h-24 bg-meme-green border-4 border-black shadow-brutal flex items-center justify-center mx-auto mb-6 rotate-[-10deg]">
                    <i class="fas fa-shield-alt text-4xl text-black"></i>
                </div>
                <h3 class="text-4xl font-display text-white italic uppercase tracking-tighter">SECURE TERMINAL</h3>
                <p class="font-mono text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-2">Uplink detected on this device</p>
            </div>
            <div class="space-y-6">
                <button onclick="unlockInternalWallet()" class="w-full py-6 bg-meme-green text-black font-display text-4xl border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all uppercase italic">DECRYPT IDENTITY</button>
                <button onclick="confirmRemoveWallet()" class="w-full py-4 text-meme-pink font-display text-2xl uppercase italic border-b-2 border-meme-pink hover:text-white transition-colors">TERMINATE UPLINK</button>
            </div>
        `;
    } else {
        content.innerHTML = `
            <div class="text-center mb-10">
                <div class="w-24 h-24 bg-meme-cyan border-4 border-black shadow-brutal flex items-center justify-center mx-auto mb-6 rotate-[8deg]">
                    <i class="fas fa-plus-circle text-4xl text-black"></i>
                </div>
                <h3 class="text-4xl font-display text-white italic uppercase tracking-tighter">INITIALIZE TERMINAL</h3>
                <p class="font-mono text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-2">No identity detected in local space</p>
            </div>
            <div class="space-y-6">
                <button onclick="setupNewWallet()" class="w-full py-6 bg-meme-cyan text-black font-display text-4xl border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all uppercase italic">SPAWN NEW ID</button>
                <button onclick="setupImportWallet()" class="w-full py-6 bg-black text-white font-display text-4xl border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all uppercase italic">IMPORT PAYLOAD</button>
            </div>
        `;
    }
};

window.setupNewWallet = async function() {
    try {
        const paxi = await window.waitForLibrary('PaxiCosmJS');
        const HDWallet = paxi.DirectSecp256k1HdWallet || window.DirectSecp256k1HdWallet;
        if (!HDWallet) throw new Error('Signer missing');
        const wallet = await HDWallet.generate(12, { prefix: "paxi" });
        const mnemonic = wallet.mnemonic;
        window.internalWalletState.tempMnemonic = mnemonic;
        const content = document.getElementById('walletSheetContent');
        content.innerHTML = `
            <h3 class="text-4xl font-display text-meme-pink italic uppercase tracking-tighter mb-4 text-center">CORE PAYLOAD GENERATED</h3>
            <p class="font-mono text-[10px] text-gray-500 mb-10 uppercase font-black tracking-widest text-center leading-relaxed">SECURE THESE 12 WORDS IN ANALOG SPACE. IF YOU LOSE THEM, YOUR ASSETS ARE VAPORIZED FOREVER.</p>
            <div class="bg-black border-4 border-black p-8 grid grid-cols-2 gap-6 mb-12 shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)] rotate-[-1deg]">
                ${mnemonic.split(' ').map((w, i) => `<div class="font-mono text-xs text-white uppercase"><span class="text-gray-700 mr-2 font-black">${i+1}.</span>${w}</div>`).join('')}
            </div>
            <button onclick="confirmBackup()" class="w-full py-6 bg-meme-green text-black font-display text-4xl border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all uppercase italic">COPIED TO ANALOG</button>
        `;
    } catch (e) { }
};

window.confirmBackup = function() {
    window.showPinSheet('SECURE TERMINAL', async (pin) => {
        try {
            const encryptedMnemonic = await window.cryptoUtils.encrypt(window.internalWalletState.tempMnemonic, pin);
            localStorage.setItem('paxi_internal_wallet', encryptedMnemonic);
            window.internalWalletState.tempMnemonic = '';
            window.renderWalletOptions();
        } catch (e) { }
    });
};

window.setupImportWallet = function() {
    const content = document.getElementById('walletSheetContent');
    content.innerHTML = `
        <h3 class="text-4xl font-display text-meme-cyan italic uppercase tracking-tighter mb-4 text-center">PAYLOAD INJECTION</h3>
        <p class="font-mono text-[10px] text-gray-500 mb-8 uppercase font-black tracking-widest text-center">Inject 12 or 24 words of your seed phrase.</p>
        <div class="bg-black border-4 border-black p-6 mb-8 shadow-brutal rotate-[1deg]">
            <textarea id="importMnemonic" class="bg-transparent w-full h-32 font-mono text-sm text-meme-cyan outline-none uppercase font-bold placeholder:text-gray-900 no-scrollbar" placeholder="WORD1 WORD2 ..."></textarea>
        </div>
        <button onclick="processImport()" class="w-full py-6 bg-meme-cyan text-black font-display text-4xl border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all uppercase italic">ENGAGE UPLINK</button>
    `;
};

window.unlockInternalWallet = function() {
    window.showPinSheet('DECRYPTING...', async (pin) => {
        try {
            const encrypted = localStorage.getItem('paxi_internal_wallet');
            const mnemonic = await window.cryptoUtils.decrypt(encrypted, pin);
            await window.connectWithMnemonic(mnemonic);
            window.hideInternalWalletSheet();
        } catch (e) { }
    });
};

window.connectWithMnemonic = async function(mnemonic) {
    try {
        const paxi = await window.waitForLibrary('PaxiCosmJS');
        const HDWallet = paxi.DirectSecp256k1HdWallet || window.DirectSecp256k1HdWallet;
        if (!HDWallet) throw new Error('Signer missing');
        const wallet = await HDWallet.fromMnemonic(mnemonic, { prefix: "paxi" });
        const accounts = await wallet.getAccounts();
        window.wallet = { address: accounts[0].address, public_key: accounts[0].pubkey, signer: wallet, type: 'internal' };
        window.walletType = 'internal';
        const btn = document.getElementById('connectBtn');
        btn.innerHTML = `<i class="fas fa-check-circle mr-2 text-meme-green"></i>${window.shortenAddress(window.wallet.address)}`;
        await window.updateBalances(); await window.updateMyTokens();
        if (window.closeAllSidebars) window.closeAllSidebars();
    } catch (e) { }
};

window.confirmRemoveWallet = function() {
    if (confirm('DANGER: TERMINATING UPLINK WILL ERASE LOCAL DATA. ENSURE ANALOG BACKUP EXISTS. PROCEED?')) {
        localStorage.removeItem('paxi_internal_wallet'); window.renderWalletOptions();
    }
};
