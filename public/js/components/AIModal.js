// ============================================
// AIMODAL COMPONENT (ES Module)
// ============================================

export const AIModal = {
    render: () => {
        return `
            <div id="aiModal" class="fixed inset-0 bg-black/90 backdrop-blur-xl z-[6000] hidden items-center justify-center p-4">
                <div class="bg-black border-4 border-meme-cyan w-full max-w-2xl shadow-[0_0_50px_rgba(0,209,255,0.2)] p-8 animate-slide-up relative overflow-hidden">
                    <div class="absolute -top-20 -right-20 w-64 h-64 bg-meme-cyan/10 blur-3xl rounded-full"></div>

                    <button id="closeAI" class="absolute top-6 right-6 text-meme-cyan hover:text-white transition-colors">
                        <i class="fas fa-times text-2xl"></i>
                    </button>

                    <div class="flex items-center gap-6 mb-10 border-b border-meme-cyan/20 pb-6">
                        <div class="w-16 h-16 bg-surface border-2 border-meme-cyan flex items-center justify-center text-meme-cyan text-3xl shadow-brutal-sm rotate-[-5deg]">
                            <i class="fas fa-brain"></i>
                        </div>
                        <div>
                            <h2 class="font-display text-4xl italic uppercase tracking-tighter text-primary-text">Oracle <span class="text-meme-cyan">Analysis</span></h2>
                            <p class="font-mono text-[10px] text-meme-cyan/60 uppercase tracking-[0.3em] font-bold">Gemini Pro 1.5 Cognitive Engine</p>
                        </div>
                    </div>

                    <div id="aiContent" class="space-y-6">
                        <div class="flex items-center gap-4 text-meme-cyan animate-pulse">
                            <i class="fas fa-sync fa-spin"></i>
                            <span class="font-mono text-xs uppercase font-black tracking-widest">Synthesizing On-Chain Data...</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    init: (container) => {
        container.querySelector('#closeAI')?.addEventListener('click', () => {
            container.querySelector('#aiModal').classList.add('hidden');
        });
    }
};
