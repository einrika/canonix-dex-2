export const LandingAIScanUI = () => {
    return `
        <section class="py-16 bg-bg relative px-4">
            <div class="max-w-7xl mx-auto">
                <div class="bg-surface border-4 border-card p-8 relative overflow-hidden reveal active opacity-100 translate-y-0 transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)] group">
                    <div class="absolute -bottom-20 -left-20 w-64 h-64 bg-meme-cyan opacity-10 blur-3xl rounded-full animate-pulse"></div>

                    <div id="index-ai-content" class="relative z-10">
                        <div class="flex items-center gap-6 mb-8">
                            <div class="w-16 h-16 bg-meme-green border-2 border-card shadow-brutal flex items-center justify-center rotate-[-10deg]">
                                <i class="fas fa-brain text-black text-3xl animate-pulse"></i>
                            </div>
                            <div>
                                <h3 class="font-display italic uppercase text-4xl text-primary-text tracking-tighter mb-1">Network Oracle</h3>
                                <p class="font-mono text-meme-cyan font-black uppercase tracking-widest text-[10px] animate-glitch">GEMINI PRO 1.5 DEEP SCAN ACTIVE</p>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div class="h-20 bg-surface border-2 border-card p-4 animate-pulse"></div>
                            <div class="h-20 bg-surface border-2 border-card p-4 animate-pulse"></div>
                            <div class="h-20 bg-surface border-2 border-card p-4 animate-pulse"></div>
                            <div class="h-20 bg-surface border-2 border-card p-4 animate-pulse"></div>
                        </div>
                        <div class="bg-surface border-2 border-card p-8 h-40 relative overflow-hidden flex items-center justify-center">
                            <div class="absolute inset-0 bg-meme-green/5 animate-pulse"></div>
                            <div class="relative z-10 font-mono text-muted-text font-bold uppercase tracking-widest text-xs italic">Awaiting block intelligence...</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
};
