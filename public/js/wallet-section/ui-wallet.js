// ============================================
// UI-WALLET.JS - User Interface & Interaction
// ============================================

// ===== 1. WALLET UI MAIN MODULE =====
window.WalletUI = window.WalletUI || {};

Object.assign(window.WalletUI, {
    init: function() {
        this.setupListeners();
        // Don't auto render - lazy load when tab is opened
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
                    <div class="w-16 h-16 bg-meme-green border-4 border-black shadow-brutal flex items-center justify-center mb-8 rotate-[-10deg]">
                        <i class="fas fa-wallet text-3xl text-black"></i>
                    </div>
                    <h3 class="text-3xl font-display italic mb-4 uppercase tracking-tighter text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">NO WALLET</h3>
                    <p class="text-[10px] text-gray-500 mb-10 uppercase font-black tracking-widest leading-relaxed italic">Connect a wallet to start trading on Paxi Network.</p>
                    <div class="flex flex-col gap-4 w-full">
                        <button onclick="window.WalletUI.showCreateModal()" class="w-full py-4 bg-meme-green text-black font-display text-xl border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic">CREATE NEW</button>
                        <button onclick="window.WalletUI.showImportModal()" class="w-full py-4 bg-black border-4 border-black text-white font-display text-xl shadow-brutal-cyan hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic">IMPORT WALLET</button>
                    </div>
                </div>
            `;
            return;
        }

        if (isLocked && !activeWallet.isWatchOnly) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
                    <div class="w-16 h-16 bg-meme-pink border-4 border-black shadow-brutal flex items-center justify-center mb-8 rotate-[10deg]">
                        <i class="fas fa-lock text-3xl text-white"></i>
                    </div>
                    <h3 class="text-3xl font-display italic mb-4 uppercase tracking-tighter text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">WALLET LOCKED</h3>
                    <p class="text-[10px] text-gray-500 mb-10 uppercase font-black tracking-widest leading-relaxed italic">Enter your PIN to unlock and access your assets.</p>
                    <button onclick="window.WalletUI.unlockActiveWallet()" class="w-full py-5 bg-meme-pink text-white font-display text-2xl border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic">UNLOCK NOW</button>
                </div>
            `;
            return;
        }

        this.renderActiveWalletView(container, activeWallet);
    },

    setWalletSubTab: function(tab) {
        // Update tab buttons
        const assetsBtn = document.getElementById('wallet-tab-assets');
        const historyBtn = document.getElementById('wallet-tab-history');
        const assetsSection = document.getElementById('wallet-assets-section');
        const historySection = document.getElementById('wallet-history-section');

        if (tab === 'assets') {
            assetsBtn.classList.add('bg-card', 'text-white');
            assetsBtn.classList.remove('text-gray-500');
            historyBtn.classList.remove('bg-card', 'text-white');
            historyBtn.classList.add('text-gray-500');
            assetsSection.classList.remove('hidden');
            historySection.classList.add('hidden');
        } else {
            historyBtn.classList.add('bg-card', 'text-white');
            historyBtn.classList.remove('text-gray-500');
            assetsBtn.classList.remove('bg-card', 'text-white');
            assetsBtn.classList.add('text-gray-500');
            historySection.classList.remove('hidden');
            assetsSection.classList.add('hidden');

            // Load history when tab is opened
            this.loadHistory();
        }
    },

    loadHistory: function() {
        const container = document.getElementById('history-container');
        if (!container) return;

        const activeWallet = window.WalletManager.getActiveWallet();
        if (!activeWallet) {
            container.innerHTML = '<div class="text-center py-8 text-gray-500 text-sm">No wallet connected</div>';
            return;
        }

        container.innerHTML = '<div class="text-center py-8"><div class="w-8 h-8 border-4 border-meme-green border-t-transparent rounded-full animate-spin mx-auto"></div><div class="text-[10px] text-gray-500 mt-3 uppercase font-black tracking-widest">Loading History...</div></div>';
        
        // Fetch transactions using existing function
        if (window.fetchUserTransactions) {
            window.fetchUserTransactions(activeWallet.address).then(txs => {
                if (!txs || txs.length === 0) {
                    container.innerHTML = `
                        <div class="text-center py-12">
                            <i class="fas fa-history text-4xl text-gray-700 mb-3"></i>
                            <p class="text-sm text-gray-500 font-bold">No transaction history</p>
                            <p class="text-xs text-gray-600 mt-1">Your transactions will appear here</p>
                        </div>
                    `;
                    return;
                }

                // Render transaction list
                container.innerHTML = `
                    <div class="space-y-2">
                        ${txs.slice(0, 20).map(tx => {
                            const isSent = tx.from === activeWallet.address;
                            const type = isSent ? 'Sent' : 'Received';
                            const icon = isSent ? 'fa-arrow-up' : 'fa-arrow-down';
                            const color = isSent ? 'text-down' : 'text-up';
                            
                            return `
                                <div class="p-3 bg-surface border border-border rounded-xl hover:bg-card transition-all">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-full bg-${isSent ? 'down' : 'up'}/10 flex items-center justify-center ${color}">
                                            <i class="fas ${icon} text-sm"></i>
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <div class="flex justify-between items-start mb-1">
                                                <span class="text-xs font-bold ${color}">${type}</span>
                                                <span class="text-xs font-mono">${tx.amount || '0'} ${tx.symbol || 'PAXI'}</span>
                                            </div>
                                            <div class="text-[10px] text-gray-500">${window.shortenAddress(isSent ? tx.to : tx.from)}</div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }).catch(err => {
                console.error('Failed to load history:', err);
                container.innerHTML = '<div class="text-center py-8 text-gray-500 text-sm">Failed to load history</div>';
            });
        } else {
            // Fallback if function not available
            container.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-history text-4xl text-gray-700 mb-3"></i>
                    <p class="text-sm text-gray-500 font-bold">No transaction history</p>
                    <p class="text-xs text-gray-600 mt-1">Your transactions will appear here</p>
                </div>
            `;
        }
    },

    setAssetTab: function(tab) {
        const tokensBtn = document.getElementById('tab-tokens');
        const lpBtn = document.getElementById('tab-lp');
        const tokensSec = document.getElementById('tokens-section');
        const lpSec = document.getElementById('lp-section');

        if (tab === 'tokens') {
            tokensBtn.classList.add('bg-card', 'text-white');
            tokensBtn.classList.remove('text-gray-500');
            lpBtn.classList.remove('bg-card', 'text-white');
            lpBtn.classList.add('text-gray-500');
            tokensSec.classList.remove('hidden');
            lpSec.classList.add('hidden');
        } else {
            lpBtn.classList.add('bg-card', 'text-white');
            lpBtn.classList.remove('text-gray-500');
            tokensBtn.classList.remove('bg-card', 'text-white');
            tokensBtn.classList.add('text-gray-500');
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

        container.innerHTML = '<div class="text-center py-4"><div class="w-8 h-8 border-4 border-meme-green border-t-transparent rounded-full animate-spin mx-auto"></div></div>';

        const lps = await window.fetchUserLPPositions(activeWallet.address);

        if (lps.length === 0) {
            container.innerHTML = '<div class="text-center py-8 text-[10px] text-gray-600 uppercase font-black tracking-widest">No LP Positions found</div>';
            return;
        }

        container.innerHTML = lps.map(lp => `
            <div class="p-4 bg-card/30 border border-border rounded-2xl hover:border-border/60 transition-all group">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center gap-2">
                        <div class="flex -space-x-2">
                            <div class="w-6 h-6 rounded-full bg-up/20 border border-border flex items-center justify-center text-[10px] font-black">P</div>
                            <div class="w-6 h-6 rounded-full bg-purple-500/20 border border-border flex items-center justify-center text-[10px] font-black">${lp.symbol.charAt(0)}</div>
                        </div>
                        <span class="text-xs font-black italic text-white uppercase">PAXI/${lp.symbol}</span>
                    </div>
                    <div class="text-right">
                        <div class="text-xs font-mono font-bold text-white">${lp.lpBalance} LP</div>
                        <div class="text-[9px] text-up font-black italic">${lp.share}% Share</div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-2 mb-4 text-[9px] text-gray-500 font-bold uppercase tracking-tighter">
                    <div class="p-2 bg-black/20 rounded-lg border border-white/5">
                        <div class="mb-0.5">${lp.paxiReserve} PAXI</div>
                        <div class="text-gray-600">${lp.prc20Reserve} ${lp.symbol}</div>
                    </div>
                    <div class="p-2 bg-black/20 rounded-lg border border-white/5 text-right">
                        <div class="text-white">$${lp.totalUSD}</div>
                        <div class="text-gray-600">Total Value</div>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <button onclick="window.WalletUI.handleAssetAction('${lp.prc20}', 'lp')" class="py-2 bg-blue-500/10 text-blue-400 rounded-xl text-[8px] font-black uppercase hover:bg-blue-500/20 transition-all">Add</button>
                    <button onclick="window.WalletUI.handleAssetAction('${lp.prc20}', 'lp')" class="py-2 bg-surface border border-border text-white rounded-xl text-[8px] font-black uppercase hover:bg-card transition-all">Withdraw</button>
                </div>
            </div>
        `).join('');
    },

    renderActiveWalletView: function(container, wallet) {
        const net = window.NetworkManager.getActiveNetwork();

        container.innerHTML = `
            <div class="space-y-8 animate-fade-in p-1">
                <!-- Wallet Card - Brutal Style -->
                <div class="p-6 bg-meme-surface border-4 border-black shadow-brutal rotate-[-1deg] relative overflow-hidden group">
                    <div class="absolute -top-10 -right-10 w-32 h-32 bg-meme-green opacity-5 blur-3xl rounded-full"></div>
                    <div class="flex justify-between items-start mb-8">
                        <div>
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-[8px] font-black uppercase tracking-[0.2em] text-meme-cyan italic bg-black px-2 py-0.5 border border-black">${net.name}</span>
                                ${wallet.isWatchOnly ? '<span class="px-2 py-0.5 bg-meme-yellow text-black text-[8px] font-black border border-black uppercase italic">Passive Mode</span>' : ''}
                            </div>
                            <h3 class="text-3xl font-display italic tracking-tighter text-white uppercase drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">${wallet.name}</h3>
                        </div>
                        <div class="flex gap-2">
                            <button id="wallet-refresh-btn" class="w-10 h-10 flex items-center justify-center bg-black border-2 border-black text-gray-500 hover:text-meme-green transition-all shadow-brutal-sm hover:shadow-none" title="Sync">
                                <i class="fas fa-sync-alt text-sm"></i>
                            </button>
                            <button id="wallet-settings-btn" class="w-10 h-10 flex items-center justify-center bg-black border-2 border-black text-gray-500 hover:text-meme-cyan transition-all shadow-brutal-sm hover:shadow-none">
                                <i class="fas fa-cog"></i>
                            </button>
                        </div>
                    </div>

                    <div class="mb-8">
                        <div class="text-[10px] text-gray-700 font-black uppercase tracking-widest mb-1 italic">TOTAL BALANCE</div>
                        <div class="flex items-baseline gap-2">
                            <span id="sidebar-paxi-bal" class="text-5xl font-display italic tracking-tighter text-meme-green drop-shadow-[3px_3px_0_rgba(0,0,0,1)]">0.00</span>
                            <span class="text-lg font-display text-white italic uppercase">PAXI</span>
                        </div>
                        <div id="portfolio-usd" class="text-[10px] text-gray-600 font-mono font-bold mt-2 uppercase tracking-widest">$0.00 USD</div>
                    </div>

                    <div class="flex items-center gap-3 p-3 bg-black border-2 border-black shadow-inner">
                        <code class="text-[10px] font-mono text-gray-500 flex-1 truncate font-bold">${wallet.address}</code>
                        <button onclick="window.copyAddress(event, '${wallet.address}')" class="w-8 h-8 flex items-center justify-center bg-meme-cyan text-black border-2 border-black shadow-brutal-sm hover:shadow-none transition-all">
                            <i class="fas fa-copy text-xs"></i>
                        </button>
                    </div>
                </div>

                <!-- Action Bar -->
                <div class="grid grid-cols-2 gap-4">
                    <button onclick="if(window.WalletUI && window.WalletUI.showSendBottomSheet) window.WalletUI.showSendBottomSheet();" class="flex items-center justify-center gap-3 p-5 bg-meme-green border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
                        <i class="fas fa-paper-plane text-black text-xl group-hover:rotate-12 transition-transform"></i>
                        <span class="text-xl font-display uppercase italic text-black">SEND</span>
                    </button>
                    <button onclick="if(window.WalletUI && window.WalletUI.showReceiveModal) window.WalletUI.showReceiveModal();" class="flex items-center justify-center gap-3 p-5 bg-meme-cyan border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
                        <i class="fas fa-qrcode text-black text-xl group-hover:scale-110 transition-transform"></i>
                        <span class="text-xl font-display uppercase italic text-black">RECV</span>
                    </button>
                </div>

                <!-- Tabs -->
                <div class="space-y-6">
                    <div class="flex bg-black p-1 border-4 border-black shadow-brutal rotate-[0.5deg]">
                        <button onclick="window.WalletUI.setWalletSubTab('assets')" id="wallet-tab-assets" class="flex-1 py-3 font-display text-2xl transition-all bg-meme-green text-black italic">ASSETS</button>
                        <button onclick="window.WalletUI.setWalletSubTab('history')" id="wallet-tab-history" class="flex-1 py-3 font-display text-2xl transition-all text-gray-600 italic hover:text-white">HISTORY</button>
                    </div>

                    <!-- Assets Section -->
                    <div id="wallet-assets-section" class="space-y-6">
                        <div class="flex justify-between items-center px-2">
                            <h4 class="text-sm font-display uppercase tracking-tighter text-white italic underline decoration-meme-green decoration-2 underline-offset-4">MY ASSETS</h4>
                            <button onclick="window.WalletUI.showImportTokenModal()" class="w-8 h-8 bg-meme-yellow border-2 border-black shadow-brutal-sm flex items-center justify-center text-black hover:shadow-none"><i class="fas fa-plus text-xs"></i></button>
                        </div>

                        <!-- Asset Filters -->
                        <div class="flex items-center justify-between px-4 py-3 bg-meme-surface border-4 border-black shadow-brutal-sm rotate-[-0.5deg]">
                            <div class="flex items-center gap-3">
                                <i class="fas fa-filter text-xs text-gray-600"></i>
                                <select onchange="window.WalletUI.setAssetSort(this.value)" class="bg-transparent text-[10px] font-black uppercase tracking-widest text-gray-400 outline-none cursor-pointer hover:text-meme-cyan transition-colors">
                                    <option value="most" ${window.AssetManager.settings.assetSort === 'most' ? 'selected' : ''}>MAX BAL</option>
                                    <option value="least" ${window.AssetManager.settings.assetSort === 'least' ? 'selected' : ''}>MIN BAL</option>
                                    <option value="name" ${window.AssetManager.settings.assetSort === 'name' ? 'selected' : ''}>A-Z</option>
                                </select>
                            </div>
                            <div class="flex items-center gap-3">
                                <span class="text-[10px] font-black uppercase tracking-widest text-gray-600 italic">HIDE EMPTY</span>
                                <input type="checkbox" onchange="window.WalletUI.toggleHideZero(this.checked)" class="w-8 h-4 bg-black border-2 border-black appearance-none checked:bg-meme-green transition-all cursor-pointer" ${window.AssetManager.settings.hideZeroBalance ? 'checked' : ''}>
                            </div>
                        </div>

                        <div id="asset-list-container" class="space-y-4">
                            <!-- Populated -->
                        </div>
                    </div>

                    <!-- History -->
                    <div id="wallet-history-section" class="hidden">
                        <div id="history-container" class="space-y-4"></div>
                    </div>
                </div>
            </div>
        `;

        this.renderAssets();
        
        // Set window.wallet for backward compatibility with old code
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
        
        // Setup button event listeners
        setTimeout(() => {
            // Refresh button
            const refreshBtn = document.getElementById('wallet-refresh-btn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => {
                    console.log('🔄 Refreshing wallet data...');
                    refreshBtn.querySelector('i').classList.add('fa-spin');

                    // Re-fetch fresh data
                    window.AssetManager.fetchUserAssets(wallet.address).then(() => {
                        this.updateAssetBalances();
                        if (window.updateBalances) window.updateBalances();
                                                setTimeout(() => {
                            refreshBtn.querySelector('i').classList.remove('fa-spin');
                        }, 500);
                    });
                });
            }

            // Settings button
            const settingsBtn = document.getElementById('wallet-settings-btn');
            if (settingsBtn) {
                settingsBtn.addEventListener('click', () => {
                    console.log('⚙️ Settings button clicked');
                    this.showWalletSettings();
                });
            }
        }, 100);
        
        // Update balances after render
        setTimeout(() => {
            if (window.updateBalances) {
                window.updateBalances();
            }
        }, 100);
    },

    setAssetSort: function(sort) {
        window.AssetManager.saveSettings({ assetSort: sort });
        this.renderAssets();
    },

    toggleHideZero: function(enabled) {
        window.AssetManager.saveSettings({ hideZeroBalance: enabled });
        this.renderAssets();
    },

    renderAssets: async function() {
        const container = document.getElementById('asset-list-container');
        if (!container) return;

        const activeWallet = window.WalletManager.getActiveWallet();
        if (activeWallet && (!window.AssetManager.apiTokens || window.AssetManager.apiTokens.length === 0)) {
            container.innerHTML = '<div class="text-center py-12 animate-pulse"><div class="w-12 h-12 border-4 border-meme-cyan border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p class="text-[10px] text-gray-600 font-black uppercase tracking-widest">Scanning Chain...</p></div>';
            await window.AssetManager.fetchUserAssets(activeWallet.address);
        }

        let tokens = window.AssetManager.getTokens();
        const settings = window.AssetManager.settings;

        if (settings.hideZeroBalance) {
            tokens = tokens.filter(token => (token.balance || 0) > 0);
        }

        tokens.sort((a, b) => {
            const balA = (a.balance || 0) / Math.pow(10, a.decimals || 6);
            const balB = (b.balance || 0) / Math.pow(10, b.decimals || 6);
            const metaA = window.AssetManager.getAssetMeta(a.address);
            const metaB = window.AssetManager.getAssetMeta(b.address);
            const valA = balA * (a.address === 'PAXI' ? 1 : (metaA.price || 0));
            const valB = balB * (b.address === 'PAXI' ? 1 : (metaB.price || 0));

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
            const logoUrl = window.normalizeLogoUrl(token.logo);
            const canHide = token.address !== 'PAXI';

            return `
                <div class="p-4 bg-meme-surface border-4 border-black shadow-brutal-sm hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group cursor-pointer relative"
                     id="asset-item-${token.address}" onclick="window.WalletUI.showAssetActions('${token.address}')">

                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-black border-2 border-black flex items-center justify-center text-sm font-black overflow-hidden relative shadow-brutal-sm group-hover:rotate-6 transition-transform flex-shrink-0">
                            ${logoUrl ? `<img src="${logoUrl}" class="w-full h-full object-cover" onerror=\"this.classList.add('hidden'); this.nextElementSibling.classList.remove('hidden'); this.nextElementSibling.classList.add('flex');\">
                                        <span class="hidden absolute inset-0 flex items-center justify-center font-black">${token.symbol.charAt(0)}</span>`
                                     : `<span class="font-black">${token.symbol.charAt(0)}</span>`}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex justify-between items-start mb-1 gap-2">
                                <span class="text-base font-display italic text-white uppercase truncate tracking-tighter">${token.name}</span>
                                <div class="flex flex-col items-end flex-shrink-0">
                                    <span id="bal-${token.address}" class="text-sm font-mono font-black text-meme-cyan">...</span>
                                    <div class="flex gap-1 mt-1">
                                        <button onclick="event.stopPropagation(); window.WalletUI.showAssetDetailModal('${token.address}')"
                                                class="w-5 h-5 bg-meme-cyan border border-black flex items-center justify-center text-[8px] text-black hover:bg-white transition-all shadow-brutal-sm hover:shadow-none"
                                                title="Details">
                                            <i class="fas fa-info"></i>
                                        </button>
                                        ${canHide ? `
                                            <button onclick="event.stopPropagation(); window.WalletUI.confirmHideToken('${token.address}')"
                                                    class="w-5 h-5 bg-meme-yellow border border-black flex items-center justify-center text-[8px] text-black hover:bg-meme-pink transition-all shadow-brutal-sm hover:shadow-none"
                                                    title="Hide">
                                                <i class="fas fa-eye-slash"></i>
                                            </button>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                            <div class="flex justify-between items-center">
                                <div class="flex items-center gap-2">
                                    <span class="text-[9px] font-black text-gray-600 uppercase tracking-widest italic">${token.symbol}</span>
                                    <span class="text-[8px] font-mono font-bold ${meta.change24h >= 0 ? 'text-meme-green' : 'text-meme-pink'}">${meta.change24h >= 0 ? '+' : ''}${meta.change24h.toFixed(2)}%</span>
                                </div>
                                <span id="val-${token.address}" class="text-[10px] font-display text-white/50 italic tracking-tighter">...</span>
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
        if (!token || !token.contractData) {
                        return;
        }

        const c = token.contractData;
        const a = token.accountData;
        const meta = window.AssetManager.getAssetMeta(address);

        // Helper to resolve IPFS and blockchain hosting URLs
        const resolveImageUrl = (url) => {
            if (!url) return '';
            if (url.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${url.replace('ipfs://', '')}`;
            if (url.includes('pinata.cloud/ipfs/')) return url;
            if (url.startsWith('ar://')) return `https://arweave.net/${url.replace('ar://', '')}`;
            if (url.includes('/ipfs/')) return url;
            if (url.startsWith('http://') || url.startsWith('https://')) return url;
            if (url.match(/^[a-zA-Z0-9]{46,}$/)) return `https://ipfs.io/ipfs/${url}`;
            return url;
        };

        const logoUrl = resolveImageUrl(c.logo);

        const formatNumber = (num) => {
            if (!num) return '0';
            return parseFloat(num).toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 6
            });
        };

        const formatUSD = (num) => {
            if (!num) return '$0.00';
            return '$' + parseFloat(num).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        };

        const balance = a.balance / Math.pow(10, c.decimals || 6);
        const usdValue = balance * meta.priceUSD;

        const modalHtml = `
            <div id="assetDetailModal" class="fixed inset-0 bg-black/90 backdrop-blur-sm z-[650] flex items-end sm:items-center justify-center p-0 sm:p-4" onclick="if(event.target === this) this.remove()">
                <div class="bg-surface border-t sm:border border-border w-full max-w-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
                    <!-- Header -->
                    <div class="p-6 border-b border-border sticky top-0 bg-surface z-10">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-3">
                                <div class="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center overflow-hidden relative">
                                    ${logoUrl ? `<img src="${logoUrl}" class="w-full h-full object-cover" onerror=\"this.classList.add('hidden'); this.nextElementSibling.classList.remove('hidden'); this.nextElementSibling.classList.add('flex');\">
                                                <span class="hidden absolute inset-0 flex items-center justify-center font-black">${c.symbol.charAt(0)}</span>`
                                             : `<span class="font-black">${c.symbol.charAt(0)}</span>`}
                                </div>
                                <div>
                                    <h3 class="text-lg font-black uppercase tracking-tight">${c.name}</h3>
                                    <div class="flex items-center gap-2">
                                        <span class="text-xs text-gray-500 font-bold">${c.symbol}</span>
                                        ${c.official_verified ? '<span class="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[8px] font-black rounded uppercase">Verified</span>' : ''}
                                    </div>
                                </div>
                            </div>
                            <button onclick="this.closest('#assetDetailModal').remove()" class="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10">
                                <i class="fas fa-times text-gray-400"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="p-6 space-y-6">
                        <!-- Your Holdings -->
                        <div class="p-4 bg-gradient-to-br from-up/10 to-purple-500/10 rounded-2xl border border-up/20">
                            <div class="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3">Your Holdings</div>
                            <div class="flex justify-between items-center mb-2">
                                <span class="text-xs text-gray-500">Balance</span>
                                <span class="text-xl font-black text-white">${formatNumber(balance)} ${c.symbol}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-xs text-gray-500">Value</span>
                                <span class="text-lg font-black text-up">${formatUSD(usdValue)}</span>
                            </div>
                        </div>

                        <!-- Price & Change -->
                        <div class="grid grid-cols-2 gap-3">
                            <div class="p-3 bg-card/30 rounded-xl border border-border">
                                <div class="text-[9px] text-gray-500 font-bold uppercase mb-1">Price (PAXI)</div>
                                <div class="text-sm font-mono text-white">${formatNumber(meta.price)}</div>
                            </div>
                            <div class="p-3 bg-card/30 rounded-xl border border-border">
                                <div class="text-[9px] text-gray-500 font-bold uppercase mb-1">24h Change</div>
                                <div class="text-sm font-mono ${meta.change24h >= 0 ? 'text-up' : 'text-down'}">${meta.change24h >= 0 ? '+' : ''}${meta.change24h.toFixed(2)}%</div>
                            </div>
                        </div>

                        <!-- Market Stats -->
                        <div class="space-y-3">
                            <h4 class="text-[10px] font-black uppercase tracking-widest text-gray-500">Market Statistics</h4>
                            <div class="grid grid-cols-2 gap-3">
                                <div class="p-3 bg-card/30 rounded-xl border border-border">
                                    <div class="text-[9px] text-gray-500 font-bold uppercase mb-1">24h Volume</div>
                                    <div class="text-sm font-mono text-white">${formatUSD(c.volume || 0)}</div>
                                </div>
                                <div class="p-3 bg-card/30 rounded-xl border border-border">
                                    <div class="text-[9px] text-gray-500 font-bold uppercase mb-1">Holders</div>
                                    <div class="text-sm font-mono text-white">${formatNumber(c.holders || 0)}</div>
                                </div>
                                <div class="p-3 bg-card/30 rounded-xl border border-border col-span-2">
                                    <div class="text-[9px] text-gray-500 font-bold uppercase mb-1">Total Supply</div>
                                    <div class="text-sm font-mono text-white">${formatNumber(c.total_supply / Math.pow(10, c.decimals || 6))}</div>
                                </div>
                            </div>
                        </div>

                        <!-- Contract Info -->
                        <div class="space-y-3">
                            <h4 class="text-[10px] font-black uppercase tracking-widest text-gray-500">Contract Information</h4>
                            <div class="p-3 bg-card/30 rounded-xl border border-border">
                                <div class="text-[10px] text-gray-500 mb-2">Contract Address</div>
                                <div class="flex items-center gap-2">
                                    <code class="text-[9px] font-mono text-white truncate flex-1">${c.contract_address}</code>
                                    <button onclick="navigator.clipboard.writeText('${c.contract_address}'); " class="text-up hover:scale-110 transition-transform">
                                        <i class="fas fa-copy text-xs"></i>
                                    </button>
                                </div>
                            </div>
                            ${c.desc ? `<p class="text-xs text-gray-400">${c.desc}</p>` : ''}
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
            <div id="hideTokenModal" class="fixed inset-0 bg-black/90 backdrop-blur-sm z-[650] flex items-center justify-center p-4" onclick="if(event.target === this) this.remove()">
                <div class="bg-card border border-border w-full max-w-sm rounded-[2.5rem] p-8 animate-slide-up" onclick="event.stopPropagation()">
                    <div class="text-center mb-6">
                        <div class="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-eye-slash text-3xl text-yellow-500"></i>
                        </div>
                        <h3 class="text-xl font-black uppercase mb-2">Hide Token?</h3>
                        <p class="text-sm text-gray-400">Hide <span class="text-white font-bold">${token.symbol}</span> from your asset list?</p>
                        <p class="text-xs text-gray-500 mt-2">You can unhide it later in Settings</p>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <button onclick="document.getElementById('hideTokenModal').remove()"
                                class="py-3 bg-surface border border-border text-white rounded-xl font-black text-sm hover:bg-card transition-all">
                            Cancel
                        </button>
                        <button onclick="window.AssetManager.toggleVisibility('${address}'); window.WalletUI.renderAssets(); document.getElementById('hideTokenModal').remove(); "
                                class="py-3 bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 rounded-xl font-black text-sm hover:bg-yellow-500 hover:text-black transition-all">
                            Hide
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    showAssetActions: function(address) {
        const token = window.AssetManager.getTokens().find(t => t.address === address);
        if (!token) return;

        const resolveImageUrl = (url) => {
            if (!url) return '';
            if (url.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${url.replace('ipfs://', '')}`;
            if (url.includes('pinata.cloud/ipfs/')) return url;
            if (url.startsWith('ar://')) return `https://arweave.net/${url.replace('ar://', '')}`;
            if (url.includes('/ipfs/')) return url;
            if (url.startsWith('http://') || url.startsWith('https://')) return url;
            if (url.match(/^[a-zA-Z0-9]{46,}$/)) return `https://ipfs.io/ipfs/${url}`;
            return url;
        };

        const logoUrl = resolveImageUrl(token.logo);

        const modalHtml = `
            <div id="assetActionModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[630] flex items-end" onclick="if(event.target === this) this.remove()">
                <div class="bg-card border-t border-border w-full rounded-t-[2.5rem] p-6 animate-slide-up" onclick="event.stopPropagation()">
                    <div class="w-12 h-1 bg-gray-600 rounded-full mx-auto mb-6"></div>

                    <div class="flex items-center gap-3 mb-6">
                        <div class="w-12 h-12 rounded-full bg-surface border border-border flex items-center justify-center font-black overflow-hidden">
                            ${logoUrl ? `<img src="${logoUrl}" class="w-full h-full object-cover">` : `<span>${token.symbol.charAt(0)}</span>`}
                        </div>
                        <div>
                            <h3 class="text-lg font-black italic uppercase tracking-tighter">${token.name}</h3>
                            <div class="text-[10px] font-mono text-gray-500">${token.symbol}</div>
                        </div>
                    </div>

                    <div class="space-y-3">
                        <button onclick="window.WalletUI.handleBottomSheetAction('${address}', 'send')"
                                class="w-full flex items-center gap-4 p-4 bg-surface border border-border rounded-2xl hover:border-up/50 transition-all group">
                            <div class="w-12 h-12 rounded-full bg-up/10 flex items-center justify-center text-up group-hover:scale-110 transition-transform">
                                <i class="fas fa-paper-plane text-xl"></i>
                            </div>
                            <div class="flex-1 text-left">
                                <div class="text-sm font-black uppercase tracking-widest text-white">Send</div>
                                <div class="text-xs text-gray-500">Transfer to another address</div>
                            </div>
                            <i class="fas fa-chevron-right text-gray-600"></i>
                        </button>

                        <button onclick="window.WalletUI.handleBottomSheetAction('${address}', 'lp')"
                                class="w-full flex items-center gap-4 p-4 bg-surface border border-border rounded-2xl hover:border-blue-500/50 transition-all group">
                            <div class="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                <i class="fas fa-plus-circle text-xl"></i>
                            </div>
                            <div class="flex-1 text-left">
                                <div class="text-sm font-black uppercase tracking-widest text-white">Add Liquidity</div>
                                <div class="text-xs text-gray-500">Provide liquidity to pool</div>
                            </div>
                            <i class="fas fa-chevron-right text-gray-600"></i>
                        </button>

                        <button onclick="window.WalletUI.handleBottomSheetAction('${address}', 'burn')"
                                class="w-full flex items-center gap-4 p-4 bg-surface border border-border rounded-2xl hover:border-down/50 transition-all group">
                            <div class="w-12 h-12 rounded-full bg-down/10 flex items-center justify-center text-down group-hover:scale-110 transition-transform">
                                <i class="fas fa-fire text-xl"></i>
                            </div>
                            <div class="flex-1 text-left">
                                <div class="text-sm font-black uppercase tracking-widest text-white">Burn</div>
                                <div class="text-xs text-gray-500">Permanently destroy tokens</div>
                            </div>
                            <i class="fas fa-chevron-right text-gray-600"></i>
                        </button>
                    </div>

                    <button onclick="document.getElementById('assetActionModal').remove()"
                            class="w-full mt-4 py-4 bg-surface border border-border text-white rounded-2xl font-black text-sm hover:bg-card transition-all">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    handleBottomSheetAction: function(address, action) {
        // Close asset action modal first
        document.getElementById('assetActionModal')?.remove();

        // Set token if not PAXI
        if (address !== 'PAXI' && window.selectPRC20) {
            window.selectPRC20(address);
        }

        // For send, use custom enhanced UI
        if (action === 'send') {
            this.showSendBottomSheet(address);
        } else {
            // For LP and Burn, use original sidebar content
            this.showActionBottomSheet(action);
        }
    },

    showSendBottomSheet: function(selectedAddress) {
        const activeWallet = window.WalletManager.getActiveWallet();
        if (!activeWallet) return;

        const tokens = window.AssetManager.getTokens();
        const selectedToken = selectedAddress ? tokens.find(t => t.address === selectedAddress) : tokens[0];
        
        const resolveImageUrl = (url) => {
            if (!url) return '';
            if (url.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${url.replace('ipfs://', '')}`;
            if (url.includes('pinata.cloud/ipfs/')) return url;
            if (url.startsWith('ar://')) return `https://arweave.net/${url.replace('ar://', '')}`;
            if (url.includes('/ipfs/')) return url;
            if (url.startsWith('http://') || url.startsWith('https://')) return url;
            if (url.match(/^[a-zA-Z0-9]{46,}$/)) return `https://ipfs.io/ipfs/${url}`;
            return url;
        };

        const modalHtml = `
            <div id="sendBottomSheet" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[640] flex items-end" onclick="if(event.target === this) this.remove()">
                <div class="bg-surface border-t border-border w-full rounded-t-[2.5rem] max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
                    <div class="w-12 h-1 bg-gray-600 rounded-full mx-auto mt-3"></div>
                    
                    <div class="px-4 pb-6">
                        <!-- Header -->
                        <div class="flex items-center justify-between py-4">
                            <h3 class="text-xl font-black uppercase italic">Send Token</h3>
                            <button onclick="document.getElementById('sendBottomSheet').remove()" class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center">
                                <i class="fas fa-times text-gray-400"></i>
                            </button>
                        </div>

                        <!-- Token Selector -->
                        <div class="mb-4">
                            <label class="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Select Token</label>
                            <div class="relative">
                                <button id="token-selector-btn" class="w-full p-3 bg-card border border-border rounded-xl flex items-center justify-between hover:border-up/30 transition-all">
                                    <div class="flex items-center gap-3" id="selected-token-display">
                                        <div class="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden">
                                            ${selectedToken && selectedToken.logo ? `<img src="${resolveImageUrl(selectedToken.logo)}" class="w-full h-full">` : `<span class="text-sm font-black">${selectedToken ? selectedToken.symbol.charAt(0) : 'P'}</span>`}
                                        </div>
                                        <div>
                                            <div class="text-sm font-black">${selectedToken ? selectedToken.symbol : 'PAXI'}</div>
                                            <div class="text-[10px] text-gray-500">Balance: <span id="selected-token-balance">0.00</span></div>
                                        </div>
                                    </div>
                                    <i class="fas fa-chevron-down text-gray-500"></i>
                                </button>

                                <!-- Dropdown -->
                                <div id="token-dropdown" class="hidden absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl max-h-64 overflow-y-auto z-10 shadow-xl">
                                    ${tokens.map(token => {
                                        const logoUrl = resolveImageUrl(token.logo);
                                        return `
                                            <button onclick="window.WalletUI.selectSendToken('${token.address}')" class="w-full p-3 flex items-center gap-3 hover:bg-surface transition-all border-b border-border/50 last:border-0">
                                                <div class="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden">
                                                    ${logoUrl ? `<img src="${logoUrl}" class="w-full h-full object-cover">` : `<span class="text-sm font-black">${token.symbol.charAt(0)}</span>`}
                                                </div>
                                                <div class="flex-1 text-left">
                                                    <div class="text-sm font-black">${token.symbol}</div>
                                                    <div class="text-[10px] text-gray-500">${token.name}</div>
                                                </div>
                                                <div class="text-xs font-mono text-gray-400" id="balance-${token.address}">0.00</div>
                                            </button>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- Recipient Address -->
                        <div class="mb-4">
                            <label class="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Recipient Address</label>
                            <input type="text" id="send-recipient" placeholder="paxi1..." class="w-full p-3 bg-card border border-border rounded-xl text-sm font-mono outline-none focus:border-up">
                        </div>

                        <!-- Amount -->
                        <div class="mb-4">
                            <label class="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Amount</label>
                            <div class="relative">
                                <input type="number" id="send-amount" placeholder="0.00" step="any" class="w-full p-3 bg-card border border-border rounded-xl text-sm font-mono outline-none focus:border-up pr-16">
                                <button onclick="window.WalletUI.setMaxAmount()" class="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-up/20 text-up text-xs font-black rounded hover:bg-up/30 transition-all">
                                    MAX
                                </button>
                            </div>
                        </div>

                        <!-- Memo (Optional) -->
                        <div class="mb-4">
                            <label class="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Memo (Optional)</label>
                            <textarea id="send-memo" placeholder="Add a note..." rows="2" class="w-full p-3 bg-card border border-border rounded-xl text-sm outline-none focus:border-up resize-none"></textarea>
                        </div>

                        <!-- Confirmation Details -->
                        <div id="send-confirmation" class="hidden mb-4 p-4 bg-card border border-border rounded-xl space-y-2">
                            <div class="text-xs font-black uppercase text-gray-500 mb-3">Confirmation</div>
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-500">Token</span>
                                <span class="font-bold" id="confirm-token">-</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-500">Amount</span>
                                <span class="font-bold" id="confirm-amount">-</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-500">To Address</span>
                                <span class="font-mono text-xs" id="confirm-address">-</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-500">Balance</span>
                                <span class="font-bold" id="confirm-balance">-</span>
                            </div>
                            <div class="flex justify-between text-sm border-t border-border/50 pt-2">
                                <span class="text-gray-500">Estimated Fee</span>
                                <span class="font-bold text-up" id="confirm-fee">~0.0063 PAXI</span>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="space-y-2">
                            <button onclick="window.WalletUI.reviewSend(event)" class="w-full py-4 bg-up text-black rounded-xl font-black text-sm hover:bg-up/90 transition-all">
                                Review Send
                            </button>
                            <button id="confirm-send-btn" onclick="window.WalletUI.confirmSend()" class="hidden w-full py-4 bg-up text-black rounded-xl font-black text-sm hover:bg-up/90 transition-all">
                                Confirm & Send
                            </button>
                            <button onclick="document.getElementById('sendBottomSheet').remove()" class="w-full py-3 bg-surface border border-border text-white rounded-xl font-bold text-sm hover:bg-card transition-all">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Setup token selector dropdown
        const selectorBtn = document.getElementById('token-selector-btn');
        const dropdown = document.getElementById('token-dropdown');

        if (selectorBtn && dropdown) {
            selectorBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('hidden');
            });

            document.addEventListener('click', () => {
                dropdown.classList.add('hidden');
            });
        }

        // Set initial selected token
        if (selectedToken) {
            this.selectSendToken(selectedToken.address);
        }

        // Update all token balances in dropdown
        this.updateSendTokenBalances();
    },

    selectSendToken: function(address) {
        window.selectedSendToken = address;
        const token = window.AssetManager.getTokens().find(t => t.address === address);
        if (!token) return;

        const resolveImageUrl = (url) => {
            if (!url) return '';
            if (url.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${url.replace('ipfs://', '')}`;
            if (url.includes('pinata.cloud/ipfs/')) return url;
            if (url.startsWith('ar://')) return `https://arweave.net/${url.replace('ar://', '')}`;
            return url;
        };

        // Update display
        const display = document.getElementById('selected-token-display');
        if (display) {
            const logoUrl = resolveImageUrl(token.logo);
            display.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden">
                    ${logoUrl ? `<img src="${logoUrl}" class="w-full h-full object-cover">` : `<span class="text-sm font-black">${token.symbol.charAt(0)}</span>`}
                </div>
                <div>
                    <div class="text-sm font-black">${token.symbol}</div>
                    <div class="text-[10px] text-gray-500">Balance: <span id="selected-token-balance">...</span></div>
                </div>
            `;
        }

        // Close dropdown
        document.getElementById('token-dropdown')?.classList.add('hidden');

        // Update balance
        this.updateSelectedTokenBalance();
    },

    updateSendTokenBalances: async function() {
        const tokens = window.AssetManager.getTokens();
        const activeWallet = window.WalletManager.getActiveWallet();
        if (!activeWallet) return;

        for (const token of tokens) {
            const balEl = document.getElementById(`balance-${token.address}`);
            if (!balEl) continue;

            let balance = 0;
            if (token.balance !== undefined) {
                balance = token.balance / Math.pow(10, token.decimals || 6);
            }
            balEl.textContent = balance.toFixed(4);
        }

        this.updateSelectedTokenBalance();
    },

    updateSelectedTokenBalance: async function() {
        if (!window.selectedSendToken) return;

        const token = window.AssetManager.getTokens().find(t => t.address === window.selectedSendToken);
        if (!token) return;

        let balance = 0;
        if (token.balance !== undefined) {
            balance = token.balance / Math.pow(10, token.decimals || 6);
        }

        const balEl = document.getElementById('selected-token-balance');
        if (balEl) balEl.textContent = balance.toFixed(4);

        window.currentSendTokenBalance = balance;
    },

    setMaxAmount: function() {
        const amountInput = document.getElementById('send-amount');
        if (amountInput && window.currentSendTokenBalance) {
            amountInput.value = window.currentSendTokenBalance;
        }
    },

    reviewSend: function(event) {
        const token = window.AssetManager.getTokens().find(t => t.address === window.selectedSendToken);
        const recipient = document.getElementById('send-recipient')?.value;
        const amount = document.getElementById('send-amount')?.value;

        if (!token || !recipient || !amount) {
                        return;
        }

        // Show confirmation details
        document.getElementById('send-confirmation')?.classList.remove('hidden');
        document.getElementById('confirm-send-btn')?.classList.remove('hidden');

        // Hide review button
        if (event && event.target) {
            event.target.closest('button')?.classList.add('hidden');
        }

        // Fill confirmation
        document.getElementById('confirm-token').textContent = token.symbol;
        document.getElementById('confirm-amount').textContent = `${amount} ${token.symbol}`;
        document.getElementById('confirm-address').textContent = window.shortenAddress(recipient, 10);
        document.getElementById('confirm-balance').textContent = `${window.currentSendTokenBalance || 0} ${token.symbol}`;

        // Scroll to confirmation
        document.getElementById('send-confirmation')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    },

    confirmSend: async function() {
        const tokenAddress = window.selectedSendToken;
        const recipient = document.getElementById('send-recipient')?.value;
        const amount = parseFloat(document.getElementById('send-amount')?.value);
        const memo = document.getElementById('send-memo')?.value || "Send from Canonix";

        if (!tokenAddress || !recipient || isNaN(amount) || amount <= 0) {
                        return;
        }

        const btn = document.getElementById('confirm-send-btn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Sending...';
        }

        try {
            await window.executeSendTransaction(tokenAddress, recipient, amount, memo);

            // Close sheet on success
            document.getElementById('sendBottomSheet')?.remove();

            // Refresh balances
            setTimeout(async () => {
                if (window.AssetManager) {
                    const activeWallet = window.WalletManager.getActiveWallet();
                    if (activeWallet) await window.AssetManager.fetchUserAssets(activeWallet.address);
                }
                if (window.updateBalances) await window.updateBalances();
                this.renderAssets();
            }, 3000);

        } catch (e) {
            console.error('Send failed:', e);
            // Error notif handled by buildAndSendTx
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = 'Confirm & Send';
            }
        }
    },

    showActionBottomSheet: function(action) {
        // Create bottom sheet container
        const modalHtml = `
            <div id="actionBottomSheet" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[640] flex items-end" onclick="if(event.target === this) this.remove()">
                <div class="bg-surface border-t border-border w-full rounded-t-[2.5rem] max-h-[85vh] overflow-y-auto" onclick="event.stopPropagation()">
                    <div class="w-12 h-1 bg-gray-600 rounded-full mx-auto mt-3 mb-4"></div>
                    <div id="bottomSheetContent" class="px-4 pb-6">
                        <!-- Content will be loaded here -->
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Hijack sidebarContent temporarily
        const bottomSheetContent = document.getElementById('bottomSheetContent');
        const originalSidebarContent = document.getElementById('sidebarContent');

        if (bottomSheetContent && window.renderSidebarContent) {
            // Temporarily rename original sidebarContent
            if (originalSidebarContent) {
                originalSidebarContent.id = 'sidebarContent-original';
            }

            // Set bottomSheetContent as sidebarContent
            bottomSheetContent.id = 'sidebarContent';

            // Render content (akan masuk ke bottomSheetContent karena id-nya sidebarContent)
            window.renderSidebarContent(action);

            // Restore IDs
            bottomSheetContent.id = 'bottomSheetContent';
            if (originalSidebarContent) {
                originalSidebarContent.id = 'sidebarContent';
            }
        }
    },

    updateAssetBalances: async function() {
        const tokens = window.AssetManager.getTokens();
        const activeWallet = window.WalletManager.getActiveWallet();
        if (!activeWallet) return;

        // Always fetch fresh PAXI balance (no cache to avoid stale data)
        let paxiBalance = 0;
        try {
            const response = await window.smartFetch(`${window.APP_CONFIG.LCD}/cosmos/bank/v1beta1/balances/${activeWallet.address}`);
            const balances = response.balances || [];
            const paxiBal = balances.find(b => b.denom === 'upaxi');
            paxiBalance = paxiBal ? parseInt(paxiBal.amount) / 1000000 : 0;
        } catch (e) {
            console.error("❌ Error fetching PAXI balance:", e);
        }

        for (const token of tokens) {
            try {
                let amount = 0;

                // Check if balance already available from API response
                if (token.balance !== undefined) {
                    // Balance from my_contract_accounts API
                    amount = token.balance / Math.pow(10, token.decimals || 6);
                } else if (token.address === 'PAXI' || token.symbol === 'PAXI') {
                    // Use fresh PAXI balance
                    amount = paxiBalance;
                } else {
                    // Fallback: token not in API response, might be custom added
                    // Skip updating balance for now to avoid too many requests
                    continue;
                }

                const balEl = document.getElementById(`bal-${token.address}`);
                if (balEl) window.setText(balEl, amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }));

                // Update value display
                const valEl = document.getElementById(`val-${token.address}`);
                if (valEl) {
                    const meta = window.AssetManager.getAssetMeta(token.address);
                    const currentPaxiPrice = window.paxiPriceUSD || 0.05;

                    if (token.address === 'PAXI') {
                        // For PAXI, show USD value directly
                        const usdValue = amount * currentPaxiPrice;
                        window.setText(valEl, `$${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
                    } else {
                        // For PRC20, show USD value derived from PAXI (Sinkron)
                        // Formula: Amount * Price_In_PAXI * PAXI_Price_In_USD
                        const paxiValue = amount * meta.price;
                        const usdValue = paxiValue * currentPaxiPrice;
                        window.setText(valEl, `$${usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
                    }
                }

                // Auto hide zero balance if setting enabled
                if (window.AssetManager.settings.hideZeroBalance && amount === 0) {
                    document.getElementById(`asset-item-${token.address}`)?.classList.add('hidden');
                }
            } catch (e) {
                console.error(`❌ Error updating balance for ${token.symbol}:`, e);
            }
        }
    },


    showReceiveModal: function() {
        const wallet = window.WalletManager.getActiveWallet();
        if (!wallet) return;

        const modalHtml = `
            <div id="qrModal" class="fixed inset-0 bg-black/90 z-[600] flex items-center justify-center p-4 animate-fade-in">
                <div class="bg-card border border-border w-full max-w-sm rounded-[2.5rem] p-8 flex flex-col items-center">
                    <h3 class="text-xl font-black italic uppercase tracking-tighter mb-6">Receive Assets</h3>
                    <div class="bg-white p-4 rounded-3xl mb-6 shadow-2xl">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${wallet.address}" class="w-48 h-48">
                    </div>
                    <div class="bg-surface border border-border rounded-2xl p-4 w-full flex items-center gap-3 mb-6">
                        <code class="text-[10px] font-mono text-gray-400 flex-1">${window.shortenAddress(wallet.address, 10)}</code>
                        <button onclick="window.copyAddress(event, '${wallet.address}')" class="text-up hover:scale-110 transition-transform"><i class="fas fa-copy"></i></button>
                    </div>
                    <button onclick="document.getElementById('qrModal').remove()" class="w-full py-4 bg-surface text-gray-500 font-black rounded-2xl text-xs uppercase italic border border-border hover:text-white transition-all">Close</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    unlockActiveWallet: function() {
        window.showPinSheet('Enter PIN to Unlock', async (pin) => {
            try {
                const wallet = window.WalletManager.getActiveWallet();
                if (!wallet) return;
                await window.WalletSecurity.decrypt(wallet.encryptedData, pin);
                window.WalletSecurity.setSessionPin(pin);
                await window.connectInternalWallet(wallet.id, pin);
                if (window.checkWalletLock) window.checkWalletLock();
                this.renderDashboard();
            } catch (e) {
                console.error("Unlock failed", e);
            }
        });
    },

    handleAssetAction: function(address, action) {
        if (address !== 'PAXI' && window.selectPRC20) {
            window.selectPRC20(address);
        }
        if (action === 'send') this.showSendBottomSheet(address);
        else this.showActionBottomSheet(action);
    },

    showImportTokenModal: function() {
        const modalHtml = `
            <div id="importTokenModal" class="fixed inset-0 bg-black/90 backdrop-blur-sm z-[650] flex items-center justify-center p-4" onclick="if(event.target === this) this.remove()">
                <div class="bg-meme-surface border-4 border-black w-full max-w-sm rounded-none p-8 shadow-brutal animate-fade-in" onclick="event.stopPropagation()">
                    <h3 class="text-3xl font-display italic uppercase mb-6 text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">Track Asset</h3>
                    <div class="space-y-4">
                        <input type="text" id="tokenAddressInput" placeholder="paxi1..." class="w-full bg-black border-4 border-black p-4 text-xs font-mono text-white outline-none focus:border-meme-cyan transition-all italic uppercase">
                        <button onclick="window.AssetManager.addToken(document.getElementById('tokenAddressInput').value); document.getElementById('importTokenModal').remove(); window.WalletUI.renderAssets();" class="w-full py-4 bg-meme-cyan text-black font-display text-2xl border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic">INJECT ASSET</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    showWalletSettings: function(id) {
        console.log('🔧 Opening wallet settings, id:', id);

        if (!window.WalletManager) {
            console.error('❌ WalletManager not found!');
                        return;
        }

        const walletId = id || window.WalletManager.activeId;
        const wallet = window.WalletManager.getWallets().find(w => w.id === walletId);

        if (!wallet) {
            console.error('❌ Wallet not found, id:', walletId);
                        return;
        }

        console.log('✅ Opening settings for wallet:', wallet.name);

        const modalHtml = `
            <div id="settingsModal" class="fixed inset-0 bg-black/90 backdrop-blur-sm z-[610] flex items-center justify-center p-4" onclick="if(event.target === this) this.remove()">
                <div class="bg-card border border-border w-full max-w-sm rounded-[2.5rem] p-8" onclick="event.stopPropagation()">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-black italic uppercase tracking-tighter">Wallet Settings</h3>
                        <button onclick="document.getElementById('settingsModal').remove()" class="text-gray-500 hover:text-white"><i class="fas fa-times"></i></button>
                    </div>

                    <div class="space-y-6">
                        <div>
                            <label class="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Wallet Name</label>
                            <div class="flex gap-2">
                                <input type="text" id="renameInput" value="${wallet.name}" class="flex-1 bg-surface border border-border rounded-xl p-3 text-sm font-bold outline-none focus:border-up">
                                <button onclick="window.WalletUI.processRename('${wallet.id}')" class="px-4 bg-up/10 text-up rounded-xl font-black text-[10px] uppercase italic border border-up/20">Save</button>
                            </div>
                        </div>

                        ${!wallet.isWatchOnly ? `
                            <div class="pt-4 border-t border-border space-y-3">
                                <button onclick="window.WalletUI.exportSecrets('${wallet.id}', 'privatekey')" class="w-full py-3 bg-surface border border-border text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-card transition-all flex items-center justify-center gap-2">
                                    <i class="fas fa-key text-up"></i> Export Private Key
                                </button>
                                <button onclick="window.WalletUI.exportSecrets('${wallet.id}', 'mnemonic')" class="w-full py-3 bg-surface border border-border text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-card transition-all flex items-center justify-center gap-2">
                                    <i class="fas fa-shield-alt text-purple-400"></i> Backup Seed Phrase
                                </button>
                            </div>
                        ` : ''}

                        <div class="pt-4 border-t border-border space-y-3">
                            <button onclick="window.WalletUI.showHiddenTokens()" class="w-full py-3 bg-surface border border-border text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-card transition-all flex items-center justify-center gap-2">
                                <i class="fas fa-eye-slash text-yellow-500"></i> Hidden Tokens
                            </button>
                        </div>

                        <div class="pt-4 border-t border-border">
                            <button onclick="window.WalletUI.processDelete('${wallet.id}')" class="w-full py-3 bg-down/10 border border-down/20 text-down rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-down hover:text-white transition-all">
                                <i class="fas fa-trash-alt mr-2"></i> Delete Wallet
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
        if (newName && window.WalletManager.renameWallet(id, newName)) {
                        document.getElementById('settingsModal').remove();
            this.renderDashboard();
        }
    },

    processDelete: function(id) {
        if (confirm("Are you sure you want to delete this wallet? This action cannot be undone. Make sure you have backed up your secrets!")) {
            if (window.WalletManager.deleteWallet(id)) {
                                document.getElementById('settingsModal').remove();
                this.renderDashboard();
            }
        }
    },

    showHiddenTokens: function() {
        const allTokens = window.AssetManager.getTokens();
        const hiddenTokens = allTokens.filter(t => !window.AssetManager.isTokenVisible(t.address));

        const modalHtml = `
            <div id="hiddenTokensModal" class="fixed inset-0 bg-black/90 backdrop-blur-sm z-[620] flex items-center justify-center p-4" onclick="if(event.target === this) this.remove()">
                <div class="bg-card border border-border w-full max-w-md rounded-[2.5rem] max-h-[80vh] overflow-hidden flex flex-col" onclick="event.stopPropagation()">
                    <div class="p-6 border-b border-border">
                        <div class="flex items-center justify-between">
                            <h3 class="text-xl font-black uppercase tracking-tight">Hidden Tokens</h3>
                            <button onclick="document.getElementById('hiddenTokensModal').remove()" class="text-gray-500 hover:text-white">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <p class="text-xs text-gray-500 mt-2">Tokens you've hidden from your asset list</p>
                    </div>

                    <div class="flex-1 overflow-y-auto p-6">
                        ${hiddenTokens.length === 0 ? `
                            <div class="text-center py-12">
                                <div class="w-16 h-16 rounded-full bg-gray-500/20 flex items-center justify-center mx-auto mb-4">
                                    <i class="fas fa-eye text-2xl text-gray-500"></i>
                                </div>
                                <p class="text-sm text-gray-500 font-bold">No hidden tokens</p>
                                <p class="text-xs text-gray-600 mt-1">Long press any token to hide it</p>
                            </div>
                        ` : `
                            <div class="space-y-2">
                                ${hiddenTokens.map(token => `
                                    <div class="p-4 bg-surface border border-border rounded-xl flex items-center justify-between group hover:border-up/30 transition-all">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-sm font-black">
                                                ${token.logo ? `<img src="${token.logo}" class="w-full h-full rounded-full">` : token.symbol.charAt(0)}
                                            </div>
                                            <div>
                                                <div class="text-sm font-black text-white">${token.name}</div>
                                                <div class="text-xs text-gray-500">${token.symbol}</div>
                                            </div>
                                        </div>
                                        <button onclick="window.AssetManager.toggleVisibility('${token.address}'); window.WalletUI.showHiddenTokens(); window.WalletUI.renderAssets(); "
                                                class="px-4 py-2 bg-up/10 text-up rounded-xl text-xs font-black hover:bg-up hover:text-black transition-all">
                                            <i class="fas fa-eye mr-1"></i> Unhide
                                        </button>
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

        window.showPinSheet('Enter PIN to Reveal', async (pin) => {
            try {
                const decrypted = await window.WalletSecurity.decrypt(wallet.encryptedData, pin);

                const secretModalHtml = `
                    <div id="secretRevealModal" class="fixed inset-0 bg-black/95 z-[620] flex items-center justify-center p-4">
                        <div class="bg-card border border-border w-full max-w-sm rounded-[2.5rem] p-8 text-center">
                            <h3 class="text-xl font-black italic uppercase tracking-tighter mb-4">Your ${type === 'mnemonic' ? 'Seed Phrase' : 'Private Key'}</h3>
                            <p class="text-[9px] text-down font-black uppercase tracking-widest mb-6">⚠️ NEVER SHARE THIS WITH ANYONE!</p>

                            <div class="bg-surface border border-border rounded-2xl p-6 mb-6 relative group">
                                <div id="secretText" class="text-xs font-mono text-gray-300 break-all select-all blur-sm hover:blur-none transition-all duration-300">
                                    ${decrypted}
                                </div>
                                <div class="absolute inset-0 flex items-center justify-center bg-surface/80 rounded-2xl group-hover:hidden">
                                    <span class="text-[10px] font-black uppercase text-gray-500">Hover to Reveal</span>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 gap-3">
                                <button onclick="window.copyAddress(event, '${decrypted}')" class="py-3 bg-up/10 text-up rounded-xl font-black text-[10px] uppercase italic border border-up/20">Copy</button>
                                <button onclick="document.getElementById('secretRevealModal').remove()" class="py-3 bg-surface text-white rounded-xl font-black text-[10px] uppercase italic border border-border">Done</button>
                            </div>
                        </div>
                    </div>
                `;
                document.body.insertAdjacentHTML('beforeend', secretModalHtml);
            } catch (e) {
                            }
        });
    },

    showWalletSwitcher: function() {
        const wallets = window.WalletManager.getWallets();
        const activeId = window.WalletManager.activeId;

        const modalHtml = `
            <div id="switcherModal" class="fixed inset-0 bg-black/90 z-[600] flex items-center justify-center p-4">
                <div class="bg-card border border-border w-full max-w-md rounded-[2.5rem] flex flex-col max-h-[80vh]">
                    <div class="p-6 border-b border-border flex justify-between items-center">
                        <h3 class="text-lg font-black italic uppercase tracking-tighter">My Wallets</h3>
                        <button onclick="document.getElementById('switcherModal').remove()" class="text-gray-500 hover:text-white"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="flex-1 overflow-y-auto p-6 space-y-3 no-scrollbar">
                        ${wallets.map(w => `
                            <div class="p-4 rounded-2xl border ${w.id === activeId ? 'border-up bg-up/5' : 'border-border bg-surface/50'} flex items-center gap-4 hover:border-border/80 cursor-pointer transition-all" onclick="window.WalletUI.switchWallet('${w.id}')">
                                <div class="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-gray-500">
                                    <i class="fas ${w.isWatchOnly ? 'fa-eye' : 'fa-wallet'} ${w.id === activeId ? 'text-up' : ''}"></i>
                                </div>
                                <div class="flex-1 min-w-0" onclick="window.WalletUI.switchWallet('${w.id}')">
                                    <div class="font-black italic text-sm truncate uppercase tracking-tighter">${w.name}</div>
                                    <div class="text-[10px] font-mono text-gray-500 truncate">${w.address}</div>
                                </div>
                                <div class="flex items-center gap-3">
                                    <button onclick="window.WalletUI.showWalletSettings('${w.id}')" class="text-gray-500 hover:text-white p-2">
                                        <i class="fas fa-cog"></i>
                                    </button>
                                    ${w.id === activeId ? '<i class="fas fa-check-circle text-up"></i>' : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="p-6 border-t border-border grid grid-cols-2 gap-3">
                        <button onclick="window.WalletUI.showCreateModal(); document.getElementById('switcherModal').remove()" class="py-3 bg-up/10 text-up rounded-xl font-black text-[10px] uppercase italic border border-up/20">Add Wallet</button>
                        <button onclick="window.WalletUI.showImportModal(); document.getElementById('switcherModal').remove()" class="py-3 bg-card text-white rounded-xl font-black text-[10px] uppercase italic border border-border">Import</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    switchWallet: function(id) {
        window.WalletManager.setActiveWallet(id);
        document.getElementById('switcherModal')?.remove();
        this.renderDashboard();
    },

    showImportModal: function() {
        const modalHtml = `
            <div id="importModal" class="fixed inset-0 bg-black/90 z-[600] flex items-center justify-center p-4">
                <div class="bg-card border border-border w-full max-w-md rounded-[2.5rem] p-8">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-xl font-black italic uppercase tracking-tighter">Import Wallet</h3>
                        <button onclick="document.getElementById('importModal').remove()" class="text-gray-500 hover:text-white"><i class="fas fa-times"></i></button>
                    </div>

                    <div class="space-y-4">
                        <div>
                            <label class="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Import Type</label>
                            <select id="importType" class="w-full bg-surface border border-border rounded-xl p-4 text-xs font-bold outline-none" onchange="window.WalletUI.updateImportFields()">
                                <option value="mnemonic">Recovery Phrase (12/24 words)</option>
                                <option value="privatekey">Private Key (Hex)</option>
                                <option value="watchonly">Watch-only Address</option>
                            </select>
                        </div>

                        <div>
                            <label class="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Wallet Name</label>
                            <input type="text" id="importName" placeholder="My New Wallet" class="w-full bg-surface border border-border rounded-xl p-4 text-xs font-bold outline-none focus:border-up">
                        </div>

                        <div id="importValueContainer">
                            <label class="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Seed Phrase</label>
                            <textarea id="importValue" class="w-full bg-surface border border-border rounded-xl p-4 text-xs font-mono outline-none focus:border-up h-24" placeholder="word1 word2 ..."></textarea>
                        </div>

                        <button onclick="window.WalletUI.processImport()" class="w-full py-4 bg-up text-bg font-black rounded-2xl shadow-brutal-sm text-xs uppercase italic mt-4">Import Wallet</button>
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

        if (type === 'mnemonic') {
            window.setText(label, 'Seed Phrase');
            textarea.placeholder = 'word1 word2 ...';
        } else if (type === 'privatekey') {
            window.setText(label, 'Private Key');
            textarea.placeholder = '0x...';
        } else {
            window.setText(label, 'Paxi Address');
            textarea.placeholder = 'paxi1...';
        }
    },

    processImport: async function() {
        try {
            console.log("📥 Processing Import...");
            const type = document.getElementById('importType').value;
            const name = document.getElementById('importName').value || 'Imported Wallet';
            const value = document.getElementById('importValue').value.trim();

            if (!value) return
            if (type === 'watchonly') {
                console.log("👀 Adding watch-only", { name, value });
                await window.WalletManager.addWatchOnly(name, value);
                const modal = document.getElementById('importModal');
                if (modal) modal.remove();
                                this.renderDashboard();
                return;
            }

            window.showPinSheet('Set 6-Digit PIN', async (pin) => {
            try {
                                if (type === 'mnemonic') {
                    await window.WalletManager.importMnemonic(name, value, pin);
                } else {
                    await window.WalletManager.importPrivateKey(name, value, pin);
                }

                window.WalletSecurity.setSessionPin(pin);
                document.getElementById('importModal').remove();

                // Trigger auto-connect for the new wallet
                const active = window.WalletManager.getActiveWallet();
                if (active) await window.connectInternalWallet(active.id, pin);

                this.renderDashboard();
            } catch (e) {
                            }
            });
        } catch (e) {
            console.error("❌ processImport error:", e);
        }
    },

    showCreateModal: function() {
        window.setupNewWallet();
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => window.WalletUI.init());

// ===== 2. SETTINGS MODULE =====
class SettingsManager {
    constructor() {
        this.storageKey = 'paxi_wallet_settings';
        this.defaults = {
            manualLock: false,
            advancedGas: false,
            defaultSlippage: 1.0,
            currency: 'USD',
            refreshInterval: 30000,
            hideSmallBalance: false,
            customRPC: '',
            theme: 'dark'
        };
        this.config = this.load();
    }

    load() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? { ...this.defaults, ...JSON.parse(data) } : this.defaults;
        } catch (e) {
            return this.defaults;
        }
    }

    save(newConfig) {
        this.config = { ...this.config, ...newConfig };
        localStorage.setItem(this.storageKey, JSON.stringify(this.config));
        window.dispatchEvent(new CustomEvent('paxi_settings_updated', { detail: this.config }));
    }

    get(key) {
        return this.config[key];
    }
}

window.SettingsManager = new SettingsManager();

// UI Methods for Settings
window.WalletUI.showSettingsPanel = function() {
    const cfg = window.SettingsManager.config;

    const modalHtml = `
        <div id="settingsPanelModal" class="fixed inset-0 bg-black/90 z-[700] flex items-center justify-center p-4">
            <div class="bg-card border border-border w-full max-w-md rounded-[2.5rem] flex flex-col max-h-[90vh]">
                <div class="p-6 border-b border-border flex justify-between items-center">
                    <h3 class="text-xl font-black italic uppercase tracking-tighter">Settings</h3>
                    <button onclick="document.getElementById('settingsPanelModal').remove()" class="text-gray-500 hover:text-white"><i class="fas fa-times"></i></button>
                </div>

                <div class="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                    <!-- Security -->
                    <div class="space-y-4">
                        <h4 class="text-[10px] font-black uppercase tracking-widest text-up italic">Security</h4>
                        <div class="flex justify-between items-center">
                            <div>
                                <div class="text-sm font-bold text-white">Manual Lock</div>
                                <div class="text-[10px] text-gray-500">Enable lock option in wallet menu</div>
                            </div>
                            <input type="checkbox" ${cfg.manualLock ? 'checked' : ''} onchange="window.SettingsManager.save({manualLock: this.checked})" class="w-10 h-5 rounded-full appearance-none bg-surface checked:bg-up transition-all relative cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-transform">
                        </div>
                    </div>

                    <!-- Trading -->
                    <div class="space-y-4 border-t border-border pt-6">
                        <h4 class="text-[10px] font-black uppercase tracking-widest text-purple-400 italic">Trading</h4>
                        <div class="flex justify-between items-center">
                            <div>
                                <div class="text-sm font-bold text-white">Advanced Gas</div>
                                <div class="text-[10px] text-gray-500">Show detailed gas breakdown</div>
                            </div>
                            <input type="checkbox" ${cfg.advancedGas ? 'checked' : ''} onchange="window.SettingsManager.save({advancedGas: this.checked})" class="w-10 h-5 rounded-full appearance-none bg-surface checked:bg-up transition-all relative cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-transform">
                        </div>

                        <div class="space-y-2">
                            <div class="text-sm font-bold text-white">Default Slippage (%)</div>
                            <input type="number" step="0.1" value="${cfg.defaultSlippage}" onchange="window.SettingsManager.save({defaultSlippage: parseFloat(this.value)})" class="w-full bg-surface border border-border rounded-xl p-3 text-sm font-bold outline-none focus:border-up">
                        </div>
                    </div>

                    <!-- Preferences -->
                    <div class="space-y-4 border-t border-border pt-6">
                        <h4 class="text-[10px] font-black uppercase tracking-widest text-blue-400 italic">Preferences</h4>
                        <div class="space-y-2">
                            <div class="text-sm font-bold text-white">Currency Display</div>
                            <select onchange="window.SettingsManager.save({currency: this.value})" class="w-full bg-surface border border-border rounded-xl p-3 text-sm font-bold outline-none focus:border-up">
                                <option value="USD" ${cfg.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
                                <option value="IDR" ${cfg.currency === 'IDR' ? 'selected' : ''}>IDR (Rp)</option>
                            </select>
                        </div>

                        <div class="flex justify-between items-center">
                            <div>
                                <div class="text-sm font-bold text-white">Hide Small Balance</div>
                                <div class="text-[10px] text-gray-500">Hide tokens with < $1 value</div>
                            </div>
                            <input type="checkbox" ${cfg.hideSmallBalance ? 'checked' : ''} onchange="window.SettingsManager.save({hideSmallBalance: this.checked})" class="w-10 h-5 rounded-full appearance-none bg-surface checked:bg-up transition-all relative cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-5 before:transition-transform">
                        </div>
                    </div>

                    <!-- Network -->
                    <div class="space-y-4 border-t border-border pt-6">
                        <h4 class="text-[10px] font-black uppercase tracking-widest text-yellow-500 italic">Network</h4>
                        <div class="space-y-2">
                            <div class="text-sm font-bold text-white">Custom RPC Endpoint</div>
                            <input type="text" placeholder="https://..." value="${cfg.customRPC}" onchange="window.SettingsManager.save({customRPC: this.value})" class="w-full bg-surface border border-border rounded-xl p-3 text-xs font-mono outline-none focus:border-up">
                            <div class="text-[8px] text-gray-600 uppercase font-black">Requires app reload to apply</div>
                        </div>
                    </div>
                </div>

                <div class="p-6 border-t border-border">
                    <button onclick="document.getElementById('settingsPanelModal').remove()" class="w-full py-4 bg-surface text-white font-black rounded-2xl text-xs uppercase italic border border-border hover:bg-card transition-all">Close</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
};

// ===== 3. CONNECTION & INTERNAL WALLET LOGIC =====

// Internal Wallet State
window.internalWalletState = {
    currentPin: '',
    pinCallback: null,
    tempMnemonic: ''
};

window.connectInternalWallet = async function(id, pin) {
    try {
        const walletData = window.WalletManager.getWallet(id);
        if (!walletData) throw new Error("Wallet not found");

        if (walletData.isWatchOnly) {
            window.wallet = {
                address: walletData.address,
                name: walletData.name,
                type: 'internal',
                id: walletData.id,
                isWatchOnly: true,
                signer: null
            };
            window.walletType = 'internal';
        } else {
            const mnemonic = await window.WalletSecurity.decrypt(walletData.encryptedData, pin);
            await window.connectWithMnemonic(mnemonic);

            // Ensure window.wallet has ID and watch-only status
            if (window.wallet) {
                window.wallet.id = walletData.id;
                window.wallet.isWatchOnly = false;
                window.wallet.name = walletData.name;
            }
        }

                if (window.WalletUI) window.WalletUI.renderDashboard();
        if (window.renderSwapTerminal) window.renderSwapTerminal();
    } catch (e) {
            }
};

window.connectWallet = async function(type) {
    const btn = document.getElementById('connectBtn');
    window.hideConnectModal();

    if (type === 'internal') {
        window.setSidebarTab('wallet');
        if (window.toggleUnifiedSidebar) window.toggleUnifiedSidebar();
        return;
    }

    btn.innerHTML = '<div class="loading"></div>';
    try {
        if (type === 'keplr') {
            if (!window.keplr) throw new Error('Keplr not installed');
            const chainId = 'paxi-mainnet';
            try {
                await window.keplr.enable(chainId);
            } catch (e) {
                throw new Error('Please add Paxi Mainnet to Keplr');
            }
            const offlineSigner = window.keplr.getOfflineSigner(chainId);
            const accounts = await offlineSigner.getAccounts();
            window.wallet = {
                address: accounts[0].address,
                signer: offlineSigner,
                public_key: accounts[0].pubkey
            };
            window.walletType = 'keplr';
        } else {
            // PaxiHub
            if (typeof window.paxihub === 'undefined') {
                if (/Mobi/.test(navigator.userAgent)) {
                     window.location.href = `paxi://hub/explorer?url=${encodeURIComponent(window.location.href)}`;
                     throw new Error('Redirecting to PaxiHub...');
                }
                throw new Error('PaxiHub not installed');
            }
            const addressInfo = await window.paxihub.paxi.getAddress();
            window.wallet = {
                address: addressInfo.address,
                public_key: addressInfo.public_key,
                signer: window.paxihub.paxi
            };
            window.walletType = 'paxihub';
        }

        btn.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${window.shortenAddress(window.wallet.address)}`;
        btn.className = 'btn-trade px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2 bg-green-600';

        await window.updateBalances();
        await window.updateMyTokens();
        if (window.renderSwapTerminal) window.renderSwapTerminal();

        window.addClass('connectBtn', 'hidden');
        window.addClass('mobileConnectBtn', 'hidden');

                if (window.closeAllSidebars) window.closeAllSidebars();
    } catch (e) {
                btn.innerHTML = '<i class="fas fa-plug"></i><span class="hidden xs:inline">Connect</span>';
        btn.className = 'btn-trade px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2';
    }
};

window.updateBalances = async function() {
    const activeWallet = window.WalletManager?.getActiveWallet();
    if (!activeWallet && !window.wallet) return;

    const walletAddress = activeWallet?.address || window.wallet?.address;
    if (!walletAddress) return;

    try {
        // Always fetch fresh PAXI balance (no cache)
        const response = await window.smartFetch(
            `${window.APP_CONFIG.LCD}/cosmos/bank/v1beta1/balances/${walletAddress}`
        );
        const balances = response.balances || [];
        const paxiBalance = balances.find(b => b.denom === 'upaxi');
        const paxiRaw = paxiBalance ? paxiBalance.amount : '0';
        const paxiAmount = parseInt(paxiRaw) / 1e6;

        const payBalEl = document.getElementById('payBalance');
        const recvBalEl = document.getElementById('recvBalance');

        let prc20Amount = 0;
        let prc20Raw = '0';
        if (window.currentPRC20) {
            const tokenDecimals = window.currentTokenInfo?.decimals || 6;
            const bal = await window.getPRC20Balance(walletAddress, window.currentPRC20);
            prc20Raw = bal.toString();
            prc20Amount = bal / Math.pow(10, tokenDecimals);
        }

        if (window.tradeType === 'buy') {
            if (payBalEl) { window.setText(payBalEl, paxiAmount.toFixed(4)); payBalEl.setAttribute('data-raw', paxiRaw); }
            if (recvBalEl) { window.setText(recvBalEl, prc20Amount.toFixed(4)); recvBalEl.setAttribute('data-raw', prc20Raw); }
        } else {
            if (payBalEl) { window.setText(payBalEl, prc20Amount.toFixed(4)); payBalEl.setAttribute('data-raw', prc20Raw); }
            if (recvBalEl) { window.setText(recvBalEl, paxiAmount.toFixed(4)); recvBalEl.setAttribute('data-raw', paxiRaw); }
        }

        window.setText('walletBalance', paxiAmount.toFixed(2) + ' PAXI');
        if (window.wallet?.address) {
            window.setText('walletAddrShort', window.shortenAddress(window.wallet.address));
        }
        window.removeClass('walletInfo', 'hidden');

        window.setText('mobileWalletBalance', paxiAmount.toFixed(2) + ' PAXI');
        window.removeClass('mobileWalletInfo', 'hidden');
        window.addClass('mobileConnectBtn', 'hidden');

        // Update sidebar PAXI balance
        const sidebarPaxi = document.getElementById('sidebar-paxi-bal');
        if (sidebarPaxi) window.setText(sidebarPaxi, paxiAmount.toFixed(2));

        // Update portfolio USD
        const portfolioUSD = document.getElementById('portfolio-usd');
        if (portfolioUSD) {
            const usdValue = paxiAmount * (window.paxiPriceUSD || 0.05);
            window.setText(portfolioUSD, `$${usdValue.toFixed(2)} USD`);
        }

    } catch (e) {
        console.error('❌ Balance update failed:', e);
    }
};

window.updateLPBalances = async function() {
    if (!window.currentPRC20) return;

    // Ensure lpBalances object exists
    if (!window.lpBalances) {
        window.lpBalances = { paxi: 0, token: 0, lpTokens: 0 };
    }

    try {
        // 1. Handle Wallet Balances if connected
        if (window.wallet) {
            const response = await window.smartFetch(
                `${window.APP_CONFIG.LCD}/cosmos/bank/v1beta1/balances/${window.wallet.address}`
            );
            const balances = response.balances || [];
            const paxiBalance = balances.find(b => b.denom === 'upaxi');
            const paxiRaw = paxiBalance ? paxiBalance.amount : '0';
            window.lpBalances.paxi = parseInt(paxiRaw) / 1000000;
            window.lpBalances.paxiRaw = paxiRaw;

            const tokenDecimals = window.currentTokenInfo?.decimals || 6;
            const tokenBalance = await window.getPRC20Balance(window.wallet.address, window.currentPRC20);
            window.lpBalances.token = tokenBalance / Math.pow(10, tokenDecimals);
            window.lpBalances.tokenRaw = tokenBalance.toString();

            try {
                const posData = await window.smartFetch(
                    `${window.APP_CONFIG.LCD}/paxi/swap/position/${window.wallet.address}/${window.currentPRC20}`
                );
                const lpAmount = posData.position?.lp_amount || '0';
                window.lpBalances.lpTokens = parseFloat(lpAmount) / 1000000;
                window.lpBalances.lpRaw = lpAmount.toString();
            } catch (e) {
                window.lpBalances.lpTokens = 0;
                window.lpBalances.lpRaw = '0';
            }
        }

        const paxiEl = document.getElementById('lpPaxiBalance');
        if (paxiEl) {
            window.setText(paxiEl, (window.lpBalances.paxi || 0).toFixed(6));
            paxiEl.setAttribute('data-raw', window.lpBalances.paxiRaw || '0');
        }
        const tokenEl = document.getElementById('lpTokenBalance');
        if (tokenEl) {
            window.setText(tokenEl, (window.lpBalances.token || 0).toFixed(6));
            tokenEl.setAttribute('data-raw', window.lpBalances.tokenRaw || '0');
        }
        const yourLP = document.getElementById('yourLPTokens');
        if (yourLP) {
            window.setText(yourLP, (window.lpBalances.lpTokens || 0).toFixed(6));
            yourLP.setAttribute('data-raw', window.lpBalances.lpRaw || '0');
        }
        const maxLP = document.getElementById('maxLPTokens');
        if (maxLP) {
            window.setText(maxLP, (window.lpBalances.lpTokens || 0).toFixed(6));
            maxLP.setAttribute('data-raw', window.lpBalances.lpRaw || '0');
        }

        // 3. Handle Pool Data & Ratio (Always update if currentPRC20 exists)
        if (!window.poolData) {
            await window.fetchPoolData();
        }

        if (window.poolData) {
            const reservePaxi = parseFloat(window.poolData.reserve_paxi || 0) / 1000000;
            const reserveToken = parseFloat(window.poolData.reserve_prc20 || 0) / Math.pow(10, window.currentTokenInfo?.decimals || 6);
            const ratio = reservePaxi > 0 ? (reserveToken / reservePaxi).toFixed(6) : '0';

            if (document.getElementById('poolRatioDisplay')) {
                window.setText('poolRatioDisplay', `1 PAXI = ${ratio} ${window.currentTokenInfo?.symbol || 'TOKEN'}`);
            }

            const posInfo = document.getElementById('yourPositionDetails');
            if (posInfo) {
                if (window.lpBalances.lpTokens > 0) {
                    const totalLP = parseFloat(window.poolData.total_lp_amount || window.poolData.total_lp || 1) / 1000000;
                    const share = window.lpBalances.lpTokens / totalLP;
                    const myPaxi = reservePaxi * share;
                    const myToken = reserveToken * share;

                    posInfo.innerHTML = `
                        <div class="flex justify-between text-[10px] mt-1 border-t border-border pt-1">
                            <span class="text-gray-500">Pooled PAXI</span>
                            <span class="text-gray-300 font-mono">${myPaxi.toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between text-[10px]">
                            <span class="text-gray-500">Pooled ${window.currentTokenInfo?.symbol || 'TOKEN'}</span>
                            <span class="text-gray-300 font-mono">${myToken.toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between text-[10px]">
                            <span class="text-gray-500">Share of Pool</span>
                            <span class="text-gray-300 font-mono">${(share * 100).toFixed(4)}%</span>
                        </div>
                    `;
                } else {
                    posInfo.innerHTML = ''; // Clear if no position
                }
            }
        }

    } catch (e) {
        console.error('Failed to update LP balances:', e);
    }
};


window.disconnectWallet = function() {
    window.wallet = null;
    window.walletType = null;
    localStorage.removeItem('paxi_wallet_type');
    window.removeClass('connectBtn', 'hidden');
    window.removeClass('mobileConnectBtn', 'hidden');
    window.addClass('walletInfo', 'hidden');
    window.addClass('mobileWalletInfo', 'hidden');

    if (window.renderSwapTerminal) window.renderSwapTerminal();
    if (window.WalletUI) window.WalletUI.renderDashboard();
};

// Internal Wallet UI Logic
window.showInternalWalletSheet = function() {
    const sheet = document.getElementById('internalWalletSheet');
    if (!sheet) return;

    if (sheet.querySelector('.close-sheet')) {
    } else {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-sheet absolute top-4 right-4 text-gray-500 hover:text-white';
        closeBtn.innerHTML = '<i class="fas fa-times text-xl"></i>';
        closeBtn.onclick = window.hideInternalWalletSheet;
        sheet.appendChild(closeBtn);
    }
    window.removeClass(sheet, 'translate-y-full');
    window.removeClass('sheetOverlay', 'hidden');
    window.renderWalletOptions();
};

window.hideInternalWalletSheet = function() {
    window.addClass('internalWalletSheet', 'translate-y-full');
    window.addClass('sheetOverlay', 'hidden');
};

window.showPinSheet = function(title, callback) {
    window.internalWalletState.currentPin = '';
    window.internalWalletState.pinCallback = callback;
    window.setText('pinTitle', title);
    window.removeClass('pinSheet', 'hidden');
    window.addClass('pinSheet', 'flex');
    const sheet = document.getElementById('pinSheet');
    if (sheet) {
        sheet.classList.add('z-[100000]');
    }
    window.updatePinDots();

    if (localStorage.getItem('paxi_biometric_enabled') === 'true') {
        window.removeClass('biometricBtn', 'hidden');
    } else {
        window.addClass('biometricBtn', 'hidden');
    }
};

window.hidePinSheet = function() {
    window.addClass('pinSheet', 'hidden');
    window.removeClass('pinSheet', 'flex');
};

window.updatePinDots = function() {
    const dots = document.querySelectorAll('#pinDots div');
    const len = window.internalWalletState.currentPin.length;
    dots.forEach((dot, i) => {
        if (i < len) {
            dot.classList.remove('bg-gray-700');
            dot.classList.add('bg-cyan-400');
        } else {
            dot.classList.remove('bg-cyan-400');
            dot.classList.add('bg-gray-700');
        }
    });
};

window.pressPin = function(n) {
    if (window.internalWalletState.currentPin.length < 6) {
        window.internalWalletState.currentPin += n;
        window.updatePinDots();

        if (window.internalWalletState.currentPin.length === 6) {
            const pin = window.internalWalletState.currentPin;
            setTimeout(() => {
                window.hidePinSheet();
                if (window.internalWalletState.pinCallback) {
                    window.internalWalletState.pinCallback(pin);
                }
            }, 300);
        }
    }
};

window.clearPin = function() {
    window.internalWalletState.currentPin = '';
    window.updatePinDots();
};

window.backspacePin = function() {
    window.internalWalletState.currentPin = window.internalWalletState.currentPin.slice(0, -1);
    window.updatePinDots();
};

window.renderWalletOptions = function() {
    const content = document.getElementById('walletSheetContent');
    const hasWallet = localStorage.getItem('paxi_internal_wallet') !== null;

    if (hasWallet) {
        content.innerHTML = `
            <div class="text-center mb-6">
                <div class="w-16 h-16 bg-cyan-400/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i class="fas fa-shield-alt text-2xl text-cyan-400"></i>
                </div>
                <h3 class="text-xl font-bold">Internal Wallet</h3>
                <p class="text-sm text-gray-400">Wallet found on this device</p>
            </div>
            <div class="space-y-3">
                <button onclick="unlockInternalWallet()" class="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold">
                    UNLOCK WALLET
                </button>
                <button onclick="confirmRemoveWallet()" class="w-full py-3 text-red-400 font-semibold text-sm">
                    REMOVE WALLET
                </button>
            </div>
        `;
    } else {
        content.innerHTML = `
            <div class="text-center mb-6">
                <div class="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i class="fas fa-plus-circle text-2xl text-purple-400"></i>
                </div>
                <h3 class="text-xl font-bold">Setup Wallet</h3>
                <p class="text-sm text-gray-400">Create a new wallet or import existing one</p>
            </div>
            <div class="space-y-3">
                <button onclick="setupNewWallet()" class="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold">
                    CREATE NEW WALLET
                </button>
                <button onclick="setupImportWallet()" class="w-full py-4 bg-dark border border-gray-700 rounded-xl font-bold">
                    IMPORT SEED PHRASE
                </button>
            </div>
        `;
    }
};

window.setupNewWallet = async function() {
        try {
        const paxi = await window.waitForLibrary('PaxiCosmJS');

        if (!window.DirectSecp256k1HdWallet && !paxi.DirectSecp256k1HdWallet) {
            await new Promise(r => {
                const check = setInterval(() => {
                    if (window.DirectSecp256k1HdWallet || paxi.DirectSecp256k1HdWallet) {
                        clearInterval(check);
                        r();
                    }
                }, 100);
                setTimeout(() => { clearInterval(check); r(); }, 5000);
            });
        }

        const HDWallet = paxi.DirectSecp256k1HdWallet || window.DirectSecp256k1HdWallet;
        if (!HDWallet) {
             throw new Error('DirectSecp256k1HdWallet component missing in PaxiCosmJS bundle');
        }

                const wallet = await HDWallet.generate(12, { prefix: "paxi" });
        const mnemonic = wallet.mnemonic;

        window.internalWalletState.tempMnemonic = mnemonic;

        const content = document.getElementById('walletSheetContent');
        content.innerHTML = `
            <h3 class="text-lg font-bold mb-2">Back up your Seed Phrase</h3>
            <p class="text-xs text-gray-400 mb-4">Write down these 12 words in order and keep them safe.</p>
            <div class="bg-black/40 p-4 rounded-xl grid grid-cols-3 gap-2 mb-6 border border-gray-800">
                ${mnemonic.split(' ').map((w, i) => `<div class="text-[10px]"><span class="text-gray-600 mr-1">${i+1}.</span>${w}</div>`).join('')}
            </div>
            <button onclick="confirmBackup()" class="w-full py-4 bg-cyan-500 rounded-xl font-bold">
                I HAVE WRITTEN IT DOWN
            </button>
        `;
    } catch (e) {
            }
};

window.confirmBackup = function() {
    window.showPinSheet('Set 6-Digit PIN', async (pin) => {
        try {
            const encryptedMnemonic = await window.cryptoUtils.encrypt(window.internalWalletState.tempMnemonic, pin);
            localStorage.setItem('paxi_internal_wallet', encryptedMnemonic);
            window.internalWalletState.tempMnemonic = '';
                        window.renderWalletOptions();
        } catch (e) {
                    }
    });
};

window.setupImportWallet = function() {
    const content = document.getElementById('walletSheetContent');
    content.innerHTML = `
        <h3 class="text-lg font-bold mb-2">Import Wallet</h3>
        <p class="text-xs text-gray-400 mb-4">Enter your 12 or 24-word seed phrase.</p>
        <textarea id="importMnemonic" class="w-full h-32 bg-black/40 border border-gray-800 rounded-xl p-4 text-sm mb-4" placeholder="word1 word2 ..."></textarea>
        <button onclick="processImport()" class="w-full py-4 bg-cyan-500 rounded-xl font-bold">
            IMPORT WALLET
        </button>
    `;
};

window.unlockInternalWallet = function() {
    window.showPinSheet('Enter PIN to Unlock', async (pin) => {
        try {
            const encrypted = localStorage.getItem('paxi_internal_wallet');
            const mnemonic = await window.cryptoUtils.decrypt(encrypted, pin);
            await window.connectWithMnemonic(mnemonic);
            window.hideInternalWalletSheet();
        } catch (e) {
                    }
    });
};

window.connectWithMnemonic = async function(mnemonic) {
        try {
        const paxi = await window.waitForLibrary('PaxiCosmJS');
        if (!window.DirectSecp256k1HdWallet && !paxi.DirectSecp256k1HdWallet) {
            await new Promise(r => {
                const check = setInterval(() => {
                    if (window.DirectSecp256k1HdWallet || paxi.DirectSecp256k1HdWallet) {
                        clearInterval(check);
                        r();
                    }
                }, 100);
                setTimeout(() => { clearInterval(check); r(); }, 5000);
            });
        }

        const HDWallet = paxi.DirectSecp256k1HdWallet || window.DirectSecp256k1HdWallet;
        if (!HDWallet) throw new Error('DirectSecp256k1HdWallet component missing in PaxiCosmJS bundle');

                const wallet = await HDWallet.fromMnemonic(mnemonic, { prefix: "paxi" });
        const accounts = await wallet.getAccounts();

        window.wallet = {
            address: accounts[0].address,
            public_key: accounts[0].pubkey,
            signer: wallet,
            type: 'internal'
        };
        window.walletType = 'internal';

        const btn = document.getElementById('connectBtn');
        btn.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${window.shortenAddress(window.wallet.address)}`;
        btn.className = 'btn-trade px-3 sm:px-5 py-2 rounded-lg text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2 bg-green-600';

        await window.updateBalances();
        await window.updateMyTokens();
                if (window.closeAllSidebars) window.closeAllSidebars();

    } catch (e) {
            }
};

window.confirmRemoveWallet = function() {
    if (confirm('Are you sure you want to remove this wallet? Make sure you have your seed phrase backed up!')) {
        localStorage.removeItem('paxi_internal_wallet');
        window.renderWalletOptions();
    }
};

window.authenticateBiometric = async function() {
    try {
        const challenge = crypto.getRandomValues(new Uint8Array(32));
        const options = {
            publicKey: {
                challenge: challenge,
                rp: { name: "Canonix" },
                user: { id: new Uint8Array(16), name: "user", displayName: "User" },
                pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                authenticatorSelection: { authenticatorAttachment: "platform" },
                timeout: 60000
            }
        };
        const credential = await navigator.credentials.get(options);
        if (credential) {
                    }
    } catch (e) {
            }
};