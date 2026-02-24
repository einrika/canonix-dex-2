window.UIManager.registerUI('LandingFeatures', () => {
    return `
        <section class="py-16 bg-meme-yellow border-y-4 border-card px-4">
            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-16 reveal active opacity-100 translate-y-0 transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]">
                    <h2 class="text-4xl font-display text-black italic uppercase tracking-tighter leading-none mb-4 drop-shadow-[4px_4px_0_rgba(255,255,255,1)]">Degen Protocols</h2>
                    <p class="font-mono text-black font-black uppercase tracking-widest text-sm italic">Cutting-edge tech for bottom-feeding traders.</p>
                </div>

                <div class="grid md:grid-cols-3 gap-6">
                    <div class="reveal active opacity-100 translate-y-0 transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)] p-6 bg-surface border-4 border-card shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                        <div class="w-12 h-12 bg-meme-green border-2 border-card flex items-center justify-center text-black text-xl mb-6"><i class="fas fa-bolt"></i></div>
                        <h4 class="text-3xl font-display text-primary-text mb-4 italic uppercase tracking-tighter">Speed</h4>
                        <p class="font-mono text-secondary-text text-[10px] font-bold uppercase tracking-wide leading-relaxed italic">Paxi Network native settlement. Front-run the rugs with sub-second execution latency.</p>
                    </div>
                    <div class="reveal active opacity-100 translate-y-0 transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)] p-6 bg-surface border-4 border-card shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all delay-[100ms]">
                        <div class="w-12 h-12 bg-meme-pink border-2 border-card flex items-center justify-center text-primary-text text-xl mb-6"><i class="fas fa-brain"></i></div>
                        <h4 class="text-3xl font-display text-primary-text mb-4 italic uppercase tracking-tighter">AI Oracle</h4>
                        <p class="font-mono text-secondary-text text-[10px] font-bold uppercase tracking-wide leading-relaxed italic">Gemini AI scanning every transaction. Real-time alpha from pure noise.</p>
                    </div>
                </div>
            </div>
        </section>
    `;
});

// ============================================
// LANDINGFEATURES LOGIC
// ============================================

window.UIManager.registerLogic('LandingFeatures', (container) => {
    // Mostly static
});
