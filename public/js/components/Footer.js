// ============================================
// FOOTER COMPONENT (ES Module)
// ============================================

export const Footer = {
    render: () => {
        return `
            <div class="max-w-7xl mx-auto px-4 py-12 md:py-20">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 border-b-4 border-card pb-12">
                    <div class="space-y-6">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-meme-green border-4 border-card shadow-brutal flex items-center justify-center rotate-[-5deg]">
                                <i class="fas fa-bolt text-black"></i>
                            </div>
                            <span class="text-3xl font-display italic tracking-tighter">CANONIX</span>
                        </div>
                        <p class="font-mono text-sm text-muted-text leading-relaxed uppercase tracking-tight">
                            PREMIUM TRADING PROTOCOL ON PAXI NETWORK. BRUTAL EFFICIENCY. DEGEN PROOF.
                        </p>
                    </div>
                    <div>
                        <h4 class="font-display text-xl mb-6 text-meme-cyan italic uppercase">Terminal</h4>
                        <ul class="space-y-4 font-mono text-xs uppercase font-bold tracking-widest">
                            <li><a href="trade.html" class="hover:text-meme-green transition-colors flex items-center gap-2"><i class="fas fa-angle-right"></i> Degen Swap</a></li>
                            <li><a href="trade.html" class="hover:text-meme-cyan transition-colors flex items-center gap-2"><i class="fas fa-angle-right"></i> Markets</a></li>
                            <li><a href="trade.html" class="hover:text-meme-pink transition-colors flex items-center gap-2"><i class="fas fa-angle-right"></i> Liquidity</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-display text-xl mb-6 text-meme-pink italic uppercase">Knowledge</h4>
                        <ul class="space-y-4 font-mono text-xs uppercase font-bold tracking-widest">
                            <li><a href="faq.html" class="hover:text-meme-yellow transition-colors flex items-center gap-2"><i class="fas fa-angle-right"></i> Whitepaper</a></li>
                            <li><a href="faq.html" class="hover:text-meme-green transition-colors flex items-center gap-2"><i class="fas fa-angle-right"></i> API Docs</a></li>
                            <li><a href="faq.html" class="hover:text-meme-cyan transition-colors flex items-center gap-2"><i class="fas fa-angle-right"></i> Security</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-display text-xl mb-6 text-meme-green italic uppercase">Socials</h4>
                        <div class="flex gap-4">
                            <a href="#" class="w-10 h-10 bg-surface border-4 border-card flex items-center justify-center text-xl hover:bg-meme-cyan hover:text-black transition-all shadow-brutal-sm hover:shadow-none"><i class="fab fa-twitter"></i></a>
                            <a href="#" class="w-10 h-10 bg-surface border-4 border-card flex items-center justify-center text-xl hover:bg-meme-pink hover:text-black transition-all shadow-brutal-sm hover:shadow-none"><i class="fab fa-telegram"></i></a>
                            <a href="#" class="w-10 h-10 bg-surface border-4 border-card flex items-center justify-center text-xl hover:bg-meme-yellow hover:text-black transition-all shadow-brutal-sm hover:shadow-none"><i class="fab fa-discord"></i></a>
                        </div>
                    </div>
                </div>
                <div class="flex flex-col md:flex-row justify-between items-center gap-6 font-mono text-[10px] text-muted-text uppercase tracking-widest">
                    <p>© 2024 CANONIX PROTOCOL. ALL RIGHTS RESERVED.</p>
                    <div class="flex gap-8">
                        <a href="#" class="hover:text-meme-cyan">Terms of service</a>
                        <a href="#" class="hover:text-meme-pink">Privacy policy</a>
                    </div>
                </div>
            </div>
        `;
    },
    init: () => {}
};
