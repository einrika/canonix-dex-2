
// ===== RENDER SEND TERMINAL (SIDEBAR) =====
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