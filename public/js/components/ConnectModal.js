// ============================================
// CONNECTMODAL COMPONENT (ES Module)
// ============================================

export const ConnectModal = {
    render: () => {
        return `
            <div id="connectModal" class="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] hidden items-center justify-center p-4">
                <div class="bg-surface border-4 border-card w-full max-w-sm shadow-brutal p-6 md:p-8 animate-slide-up relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-32 h-32 bg-meme-cyan/10 blur-3xl -z-10"></div>

                    <button id="closeConnect" class="absolute top-4 right-4 text-muted-text hover:text-primary-text transition-colors">
                        <i class="fas fa-times text-xl"></i>
                    </button>

                    <div class="text-center mb-8">
                        <div class="w-16 h-16 bg-meme-cyan border-4 border-card shadow-brutal flex items-center justify-center mx-auto mb-4 rotate-[-5deg]">
                            <i class="fas fa-plug text-black text-2xl"></i>
                        </div>
                        <h2 class="font-display text-3xl italic uppercase tracking-tighter">Terminal <span class="text-meme-cyan">Connect</span></h2>
                        <p class="font-mono text-[10px] text-muted-text mt-2 uppercase tracking-widest font-bold">Secure Web3 Handshake</p>
                    </div>

                    <div class="space-y-4">
                        <button id="connectPaxi" class="w-full group bg-card border-4 border-transparent hover:border-meme-green p-4 flex items-center justify-between transition-all shadow-brutal-sm hover:shadow-none translate-x-0 hover:translate-x-1 hover:translate-y-1">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 bg-surface border-2 border-card flex items-center justify-center text-meme-green group-hover:scale-110 transition-transform">
                                    <i class="fas fa-wallet text-xl"></i>
                                </div>
                                <div class="text-left">
                                    <div class="font-display text-xl italic uppercase group-hover:text-meme-green transition-colors">Paxi Extension</div>
                                    <div class="font-mono text-[8px] text-muted-text uppercase font-bold tracking-widest">Chrome / Brave / Mobile</div>
                                </div>
                            </div>
                            <i class="fas fa-arrow-right text-muted-text group-hover:text-meme-green transition-colors"></i>
                        </button>

                        <button id="connectMnemonic" class="w-full group bg-card border-4 border-transparent hover:border-meme-cyan p-4 flex items-center justify-between transition-all shadow-brutal-sm hover:shadow-none translate-x-0 hover:translate-x-1 hover:translate-y-1">
                            <div class="flex items-center gap-4">
                                <div class="w-10 h-10 bg-surface border-2 border-card flex items-center justify-center text-meme-cyan group-hover:scale-110 transition-transform">
                                    <i class="fas fa-key text-xl"></i>
                                </div>
                                <div class="text-left">
                                    <div class="font-display text-xl italic uppercase group-hover:text-meme-cyan transition-colors">Import Key</div>
                                    <div class="font-mono text-[8px] text-muted-text uppercase font-bold tracking-widest">Mnemonic / Private Key</div>
                                </div>
                            </div>
                            <i class="fas fa-arrow-right text-muted-text group-hover:text-meme-cyan transition-colors"></i>
                        </button>
                    </div>

                    <div class="mt-8 pt-6 border-t-2 border-card text-center">
                        <p class="font-mono text-[8px] text-muted-text uppercase font-bold tracking-[0.2em] mb-4 italic">Security Verified by Canonix Brain</p>
                        <div class="flex justify-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
                            <i class="fas fa-shield-alt"></i>
                            <i class="fas fa-lock"></i>
                            <i class="fas fa-check-circle"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    init: (container) => {
        container.querySelector('#closeConnect')?.addEventListener('click', () => {
            container.querySelector('#connectModal').classList.add('hidden');
            container.querySelector('#connectModal').classList.remove('flex');
        });

        container.querySelector('#connectPaxi')?.addEventListener('click', async () => {
            if (window.PaxiCosmJS) {
                try {
                   await window.PaxiCosmJS.connect();
                   // Success handling here
                } catch (e) {
                   console.error(e);
                }
            }
        });

        container.querySelector('#connectMnemonic')?.addEventListener('click', () => {
            // Show PIN sheet or Mnemonic entry
            window.showPINSheet?.();
        });
    }
};
