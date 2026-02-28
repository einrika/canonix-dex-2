// ============================================
// BURN-TOKEN.JS - Burn Token Feature
// ============================================

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
                    <div class="flex justify-between text-[9px] text-secondary-text mb-1">Amount of <span class="token-symbol-text">${symbol}</span> to Burn <span id="burnBalance" class="text-[8px] opacity-60">Bal: 0.00</span></div>
                    <input type="number" id="burnAmount" placeholder="0.0" class="bg-transparent w-full text-primary-text font-bold outline-none" oninput="window.updateBurnSliderFromInput()">
                    <input type="range" id="burnSlider" min="0" max="100" step="1" value="0" class="w-full mt-3 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-down" oninput="window.setBurnPercent(this.value)">
                </div>
                <button onclick="window.executeBurn()" class="w-full py-4 bg-down text-primary-text rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(255,0,128,0.3)] hover:scale-[1.02] transition-all">Start The Fire</button>
            </div>
        </div>`;
    window.updateBurnBalanceDisplay();
};

window.executeBurn = async function() {
    if (!window.wallet) {
        return;
    }

    if (!window.currentPRC20) {
        return;
    }

    const amount = parseFloat(document.getElementById('burnAmount')?.value);

    if (!amount || amount <= 0) {
        return;
    }

    try {
        await window.executeBurnTransaction(window.currentPRC20, amount);

        // Close bottom sheet if open
        document.getElementById('actionBottomSheet')?.remove();

        // Refresh balances
        setTimeout(async () => {
            if (window.updateBalances) await window.updateBalances();
            if (window.updateBurnBalanceDisplay) await window.updateBurnBalanceDisplay();
            if (window.WalletUI && window.WalletUI.renderAssets) window.WalletUI.renderAssets();
        }, 3000);

    } catch (e) {
        console.error("Burn failed:", e);
    }
};

window.setBurnPercent = function(percent) {
    if (!window.currentPRC20 || !window.wallet) return;

    const balance = window.myTokenBalances.get(window.currentPRC20) || 0;
    const amount = (balance * percent / 100).toFixed(6);

    window.setValue('burnAmount', amount > 0 ? amount : '');
    window.updateSliderGradient('burnSlider', percent);
};

window.updateBurnSliderFromInput = function() {
    if (!window.currentPRC20) return;

    const balance = window.myTokenBalances.get(window.currentPRC20) || 0;
    const amount = parseFloat(document.getElementById('burnAmount')?.value) || 0;
    const percent = balance > 0 ? Math.min(100, (amount / balance * 100)) : 0;

    const slider = document.getElementById('burnSlider');
    if (slider) {
        slider.value = percent;
        window.updateSliderGradient('burnSlider', percent);
    }
};

window.updateBurnBalanceDisplay = async function() {
    if (!window.currentPRC20 || !window.wallet) return;

    const balEl = document.getElementById('burnBalance');
    if (!balEl) return;

    const tokenDecimals = window.currentTokenInfo?.decimals || 6;
    const balance = await window.getPRC20Balance(window.wallet.address, window.currentPRC20);
    const amount = balance / Math.pow(10, tokenDecimals);
    window.myTokenBalances.set(window.currentPRC20, amount);
    window.setText(balEl, `Bal: ${amount.toFixed(2)}`);
};