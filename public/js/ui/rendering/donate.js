// ===== RENDER DONATE TERMINAL (SIDEBAR) =====
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
