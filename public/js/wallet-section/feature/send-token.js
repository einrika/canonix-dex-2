// ============================================
// SEND-TOKEN.JS - Send Token Feature
// ============================================

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
    window.populateSendTokens();
};

window.executeSend = async function() {
    const token = document.getElementById('sendTokenSelect')?.value;
    const recipient = document.getElementById('sendRecipient')?.value.trim();
    const amount = parseFloat(document.getElementById('sendAmount')?.value);

    if (!recipient || amount <= 0) {
        return;
    }

    try {
        await window.executeSendTransaction(token, recipient, amount);
        window.hideWalletActions();
    } catch (e) {
        console.error(e);
    }
};

window.WalletUI = window.WalletUI || {};

Object.assign(window.WalletUI, {
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
            <div id="sendBottomSheet" class="fixed inset-0 bg-surface/80 backdrop-blur-sm z-[640] flex items-end" onclick="if(event.target === this) this.remove()">
                <div class="bg-surface border-t border-border w-full rounded-t-[2.5rem] max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
                    <div class="w-12 h-1 bg-gray-600 rounded-full mx-auto mt-3"></div>

                    <div class="px-4 pb-6">
                        <!-- Header -->
                        <div class="flex items-center justify-between py-4">
                            <h3 class="text-xl font-black uppercase italic">Send Token</h3>
                            <button onclick="document.getElementById('sendBottomSheet').remove()" class="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center">
                                <i class="fas fa-times text-secondary-text"></i>
                            </button>
                        </div>

                        <!-- Token Selector -->
                        <div class="mb-4">
                            <label class="text-[10px] font-black uppercase tracking-widest text-secondary-text mb-2 block">Select Token</label>
                            <div class="relative">
                                <button id="token-selector-btn" class="w-full p-3 bg-card border border-border rounded-xl flex items-center justify-between hover:border-up/30 transition-all">
                                    <div class="flex items-center gap-3" id="selected-token-display">
                                        <div class="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden">
                                            \${selectedToken && selectedToken.logo ? \`<img src="\${resolveImageUrl(selectedToken.logo)}" class="w-full h-full">\` : \`<span class="text-sm font-black">\${selectedToken ? selectedToken.symbol.charAt(0) : 'P'}</span>\`}
                                        </div>
                                        <div>
                                            <div class="text-sm font-black">\${selectedToken ? selectedToken.symbol : 'PAXI'}</div>
                                            <div class="text-[10px] text-secondary-text">Balance: <span id="selected-token-balance">0.00</span></div>
                                        </div>
                                    </div>
                                    <i class="fas fa-chevron-down text-secondary-text"></i>
                                </button>

                                <!-- Dropdown -->
                                <div id="token-dropdown" class="hidden absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl max-h-64 overflow-y-auto z-10 shadow-xl">
                                    \${tokens.map(token => {
                                        const logoUrl = resolveImageUrl(token.logo);
                                        return \`
                                            <button onclick="window.WalletUI.selectSendToken('\${token.address}')" class="w-full p-3 flex items-center gap-3 hover:bg-surface transition-all border-b border-border/50 last:border-0">
                                                <div class="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden">
                                                    \${logoUrl ? \`<img src="\${logoUrl}" class="w-full h-full object-cover">\` : \`<span class="text-sm font-black">\${token.symbol.charAt(0)}</span>\`}
                                                </div>
                                                <div class="flex-1 text-left">
                                                    <div class="text-sm font-black">\${token.symbol}</div>
                                                    <div class="text-[10px] text-secondary-text">\${token.name}</div>
                                                </div>
                                                <div class="text-xs font-mono text-secondary-text" id="balance-\${token.address}">0.00</div>
                                            </button>
                                        \`;
                                    }).join('')}
                                </div>
                            </div>
                        </div>

                        <!-- Recipient Address -->
                        <div class="mb-4">
                            <label class="text-[10px] font-black uppercase tracking-widest text-secondary-text mb-2 block">Recipient Address</label>
                            <input type="text" id="send-recipient" placeholder="paxi1..." class="w-full p-3 bg-card border border-border rounded-xl text-sm font-mono outline-none focus:border-up">
                        </div>

                        <!-- Amount -->
                        <div class="mb-4">
                            <label class="text-[10px] font-black uppercase tracking-widest text-secondary-text mb-2 block">Amount</label>
                            <div class="relative">
                                <input type="number" id="send-amount" placeholder="0.00" step="any" class="w-full p-3 bg-card border border-border rounded-xl text-sm font-mono outline-none focus:border-up pr-16">
                                <button onclick="window.WalletUI.setMaxAmount()" class="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-up/20 text-up text-xs font-black rounded hover:bg-up/30 transition-all">
                                    MAX
                                </button>
                            </div>
                        </div>

                        <!-- Memo (Optional) -->
                        <div class="mb-4">
                            <label class="text-[10px] font-black uppercase tracking-widest text-secondary-text mb-2 block">Memo (Optional)</label>
                            <textarea id="send-memo" placeholder="Add a note..." rows="2" class="w-full p-3 bg-card border border-border rounded-xl text-sm outline-none focus:border-up resize-none"></textarea>
                        </div>

                        <!-- Confirmation Details -->
                        <div id="send-confirmation" class="hidden mb-4 p-4 bg-card border border-border rounded-xl space-y-2">
                            <div class="text-xs font-black uppercase text-secondary-text mb-3">Confirmation</div>
                            <div class="flex justify-between text-sm">
                                <span class="text-secondary-text">Token</span>
                                <span class="font-bold" id="confirm-token">-</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-secondary-text">Amount</span>
                                <span class="font-bold" id="confirm-amount">-</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-secondary-text">To Address</span>
                                <span class="font-mono text-xs" id="confirm-address">-</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-secondary-text">Balance</span>
                                <span class="font-bold" id="confirm-balance">-</span>
                            </div>
                            <div class="flex justify-between text-sm border-t border-border/50 pt-2">
                                <span class="text-secondary-text">Estimated Fee</span>
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
                            <button onclick="document.getElementById('sendBottomSheet').remove()" class="w-full py-3 bg-surface border border-border text-primary-text rounded-xl font-bold text-sm hover:bg-card transition-all">
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
            if (url.startsWith('ipfs://')) return \`https://ipfs.io/ipfs/\${url.replace('ipfs://', '')}\`;
            if (url.includes('pinata.cloud/ipfs/')) return url;
            if (url.startsWith('ar://')) return \`https://arweave.net/\${url.replace('ar://', '')}\`;
            return url;
        };

        // Update display
        const display = document.getElementById('selected-token-display');
        if (display) {
            const logoUrl = resolveImageUrl(token.logo);
            display.innerHTML = \`
                <div class="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center overflow-hidden">
                    \${logoUrl ? \`<img src="\${logoUrl}" class="w-full h-full object-cover">\` : \`<span class="text-sm font-black">\${token.symbol.charAt(0)}</span>\`}
                </div>
                <div>
                    <div class="text-sm font-black">\${token.symbol}</div>
                    <div class="text-[10px] text-secondary-text">Balance: <span id="selected-token-balance">...</span></div>
                </div>
            \`;
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
            const balEl = document.getElementById(\`balance-\${token.address}\`);
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
        document.getElementById('confirm-amount').textContent = \`\${amount} \${token.symbol}\`;
        document.getElementById('confirm-address').textContent = window.shortenAddress(recipient, 10);
        document.getElementById('confirm-balance').textContent = \`\${window.currentSendTokenBalance || 0} \${token.symbol}\`;

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
            # Error notif handled by buildAndSendTx
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = 'Confirm & Send';
            }
        }
    }
});