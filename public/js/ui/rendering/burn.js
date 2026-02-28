
// ===== RENDER BURN TERMINAL (SIDEBAR) =====
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