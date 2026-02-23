window.UIManager.registerUI('FAQModal', (props) => {
    return `
<!-- FAQ MODAL -->
<div id="faqModal" class="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm hidden">
    <div class="bg-surface border-4 border-card w-full max-w-2xl shadow-brutal animate-scale-in flex flex-col max-h-[90vh]">
        <div class="p-6 border-b-4 border-card flex items-center justify-between bg-card">
            <div>
                <h3 class="font-display text-4xl text-meme-cyan italic uppercase tracking-tighter leading-none">HELP & INTEL</h3>
                <p class="font-mono text-[10px] text-secondary-text font-bold uppercase tracking-widest mt-1">DEX OPERATION MANUAL</p>
            </div>
            <button onclick="window.hideFAQ()" class="w-12 h-12 border-4 border-card bg-surface text-primary-text hover:bg-meme-pink transition-colors flex items-center justify-center text-xl shadow-brutal-sm hover:shadow-none">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="p-8 overflow-y-auto space-y-6">
            <div class="faq-item group">
                <button onclick="window.toggleFAQ(this)" class="faq-btn w-full flex items-center justify-between p-6 bg-surface border-2 border-card hover:border-meme-cyan transition-all group shadow-brutal-sm">
                    <span class="font-display text-2xl text-primary-text uppercase italic tracking-tighter">WHAT IS CANONIX?</span>
                    <i class="fas fa-chevron-down transition-transform group-[.active]:rotate-180"></i>
                </button>
                <div class="faq-answer hidden p-8 bg-card border-x-2 border-b-2 border-card font-mono text-sm text-secondary-text leading-relaxed italic">
                    CANONIX IS THE PREMIER DECENTRALIZED EXCHANGE ON THE PAXI NETWORK. WE PROVIDE ULTRA-FAST TRADING, LIQUIDITY PROVISION, AND ADVANCED ANALYTICS FOR PRC20 TOKENS.
                </div>
            </div>
            <div class="faq-item group">
                <button onclick="window.toggleFAQ(this)" class="faq-btn w-full flex items-center justify-between p-6 bg-surface border-2 border-card hover:border-meme-cyan transition-all group shadow-brutal-sm">
                    <span class="font-display text-2xl text-primary-text uppercase italic tracking-tighter">HOW TO TRADE?</span>
                    <i class="fas fa-chevron-down transition-transform group-[.active]:rotate-180"></i>
                </button>
                <div class="faq-answer hidden p-8 bg-card border-x-2 border-b-2 border-card font-mono text-sm text-secondary-text leading-relaxed italic">
                    CONNECT YOUR WALLET, SELECT A TOKEN, ENTER THE AMOUNT OF PAXI YOU WANT TO SPEND, AND HIT SWAP. ALL TRANSACTIONS REQUIRE UP-FRONT GAS IN PAXI.
                </div>
            </div>
            <div class="faq-item group">
                <button onclick="window.toggleFAQ(this)" class="faq-btn w-full flex items-center justify-between p-6 bg-surface border-2 border-card hover:border-meme-cyan transition-all group shadow-brutal-sm">
                    <span class="font-display text-2xl text-primary-text uppercase italic tracking-tighter">ARE MY FUNDS SAFE?</span>
                    <i class="fas fa-chevron-down transition-transform group-[.active]:rotate-180"></i>
                </button>
                <div class="faq-answer hidden p-8 bg-card border-x-2 border-b-2 border-card font-mono text-sm text-secondary-text leading-relaxed italic">
                    CANONIX IS NON-CUSTODIAL. YOUR PRIVATE KEYS NEVER LEAVE YOUR DEVICE. HOWEVER, TRADING DEFI ASSETS INVOLVES RISK. ALWAYS DYOR (DO YOUR OWN REKT-CHECK).
                </div>
            </div>
        </div>
        <div class="p-6 bg-card border-t-4 border-card text-center">
            <p class="font-mono text-[10px] text-muted-text font-bold uppercase tracking-widest">STILL LOST? JOIN THE <a href="#" class="text-meme-cyan hover:underline">INTEL CHANNEL</a></p>
        </div>
    </div>
</div>`;
});
