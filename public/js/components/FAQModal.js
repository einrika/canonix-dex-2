// ============================================
// FAQMODAL COMPONENT (ES Module)
// ============================================

export const FAQModal = {
    render: () => {
        return `
            <div id="faqModal" class="fixed inset-0 bg-black/90 backdrop-blur-xl z-[950] hidden items-center justify-center p-4">
                <div class="bg-surface border-4 border-card w-full max-w-4xl shadow-brutal p-6 md:p-12 animate-slide-up relative overflow-y-auto max-h-[90vh]">
                    <button id="closeFAQ" class="absolute top-6 right-6 text-muted-text hover:text-primary-text transition-colors">
                        <i class="fas fa-times text-2xl"></i>
                    </button>

                    <h2 class="font-display text-4xl italic uppercase tracking-tighter mb-12 border-b-4 border-card pb-4">Knowledge <span class="text-meme-yellow">Base</span></h2>

                    <div class="space-y-8">
                        <div>
                            <h3 class="font-display text-2xl text-meme-cyan italic uppercase mb-3">What is Canonix?</h3>
                            <p class="font-mono text-sm text-secondary-text leading-relaxed uppercase">Canonix is a high-performance decentralized exchange protocol built for the Paxi Network. We specialize in PRC20 assets with a focus on speed, security, and a brutal meme aesthetic.</p>
                        </div>
                        <div>
                            <h3 class="font-display text-2xl text-meme-green italic uppercase mb-3">How to use the Terminal?</h3>
                            <p class="font-mono text-sm text-secondary-text leading-relaxed uppercase">Connect your wallet using the Paxi extension or import your mnemonic. Once connected, select a token from the sidebar and use the Swap terminal to execute trades instantly.</p>
                        </div>
                        <div>
                            <h3 class="font-display text-2xl text-meme-pink italic uppercase mb-3">Is it Secure?</h3>
                            <p class="font-mono text-sm text-secondary-text leading-relaxed uppercase">Yes. Our smart contracts are verified and the interface uses direct blockchain communication. Always double-check contract addresses before trading.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    init: (container) => {
        container.querySelector('#closeFAQ')?.addEventListener('click', () => {
            container.querySelector('#faqModal').classList.add('hidden');
            container.querySelector('#faqModal').classList.remove('flex');
        });
    }
};
