window.UIManager.registerUI('EventBanner', () => {
    return `
        <section class="py-10 bg-meme-pink border-y-4 border-card relative overflow-hidden px-4">
            <div class="absolute inset-0 opacity-20 bg-[radial-gradient(circle,#000_1px,transparent_1px)] bg-[length:15px_15px]"></div>
            <div class="max-w-7xl mx-auto relative z-10 text-center">
                <div class="inline-block px-4 py-1 bg-surface text-primary-text font-display text-base uppercase italic rotate-[-1deg] mb-6">Live Competition (coming soon)</div>
                <h2 class="text-3xl md:text-6xl font-display text-primary-text italic uppercase tracking-tighter mb-8 drop-shadow-[4px_4px_0_rgba(11,12,13,1)]">Trading War</h2>

                <div class="grid md:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
                    <div class="bg-surface border-2 border-card p-4 shadow-brutal rotate-[-2deg]">
                        <div class="text-meme-yellow font-display text-3xl italic uppercase mb-1">?k PAXI & CNX</div>
                        <div class="text-primary-text font-mono text-[8px] font-black uppercase tracking-widest italic">Prize Pool</div>
                    </div>
                    <div class="bg-white border-2 border-card p-6 shadow-brutal rotate-[1deg]">
                        <div class="text-black font-display text-3xl italic uppercase mb-1">0</div>
                        <div class="text-black font-mono text-[8px] font-black uppercase tracking-widest italic">Participants</div>
                    </div>
                    <div class="bg-meme-green border-2 border-card p-6 shadow-brutal rotate-[-1deg]">
                        <div class="text-black font-display text-3xl italic uppercase mb-1">?? : ??</div>
                        <div class="text-black font-mono text-[8px] font-black uppercase tracking-widest italic">Time Left</div>
                    </div>
                </div>

                <button class="bg-white text-black font-display text-2xl px-8 py-3 border-4 border-card shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic">JOIN NOW</button>
            </div>
        </section>
    `;
});

// ============================================
// EVENTBANNER LOGIC
// ============================================

window.UIManager.registerLogic('EventBanner', (container) => {
    // Static banner logic if needed
});
