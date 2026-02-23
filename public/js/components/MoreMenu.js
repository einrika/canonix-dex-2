// ============================================
// MOREMENU COMPONENT (ES Module)
// ============================================

export const MoreMenu = {
    render: () => {
        return `
            <div id="moreMenuModal" class="fixed inset-0 bg-black/90 backdrop-blur-xl z-[5000] hidden items-end justify-center p-4">
                <div class="bg-surface border-4 border-card w-full max-w-md shadow-brutal p-8 animate-slide-up relative">
                    <button id="closeMoreMenu" class="absolute top-4 right-4 text-muted-text hover:text-primary-text">
                        <i class="fas fa-times text-xl"></i>
                    </button>

                    <h2 class="font-display text-3xl italic uppercase tracking-tighter mb-8">System <span class="text-accent">Utilities</span></h2>

                    <div class="grid grid-cols-2 gap-4">
                        <a href="reward.html" class="p-4 bg-card border-2 border-card flex flex-col items-center gap-2 hover:bg-meme-yellow hover:text-black transition-all group">
                            <i class="fas fa-gift text-2xl group-hover:scale-110 transition-transform"></i>
                            <span class="font-display text-sm uppercase italic">Rewards</span>
                        </a>
                        <a href="daily.html" class="p-4 bg-card border-2 border-card flex flex-col items-center gap-2 hover:bg-meme-green hover:text-black transition-all group">
                            <i class="fas fa-calendar-check text-2xl group-hover:scale-110 transition-transform"></i>
                            <span class="font-display text-sm uppercase italic">Daily</span>
                        </a>
                        <a href="lottery.html" class="p-4 bg-card border-2 border-card flex flex-col items-center gap-2 hover:bg-meme-pink hover:text-black transition-all group">
                            <i class="fas fa-ticket-alt text-2xl group-hover:scale-110 transition-transform"></i>
                            <span class="font-display text-sm uppercase italic">Lottery</span>
                        </a>
                        <button id="openAI" class="p-4 bg-card border-2 border-card flex flex-col items-center gap-2 hover:bg-meme-cyan hover:text-black transition-all group">
                            <i class="fas fa-brain text-2xl group-hover:scale-110 transition-transform"></i>
                            <span class="font-display text-sm uppercase italic">AI Oracle</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },
    init: (container) => {
        container.querySelector('#closeMoreMenu')?.addEventListener('click', () => {
            container.querySelector('#moreMenuModal').classList.add('hidden');
        });

        container.querySelector('#openAI')?.addEventListener('click', () => {
             // Toggle AI modal
        });
    }
};
