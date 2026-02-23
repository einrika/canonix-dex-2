export const ConnectModalUI = () => {
    return `
        <div id="connectModal" class="hidden fixed inset-0 z-[60000] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-bg/90 backdrop-blur-md" onclick="window.hideConnectModal()"></div>
            <div class="relative w-full max-w-md bg-secondary border-4 border-card shadow-brutal-lg p-8 animate-fade-in">
                <div class="flex justify-between items-center mb-8">
                    <h3 class="text-4xl font-display text-primary-text italic uppercase">Auth Protocol</h3>
                    <button onclick="window.hideConnectModal()" class="w-10 h-10 border-2 border-card flex items-center justify-center text-muted-text hover:text-meme-pink"><i class="fas fa-times"></i></button>
                </div>

                <div class="space-y-4">
                    <button onclick="window.connectPaxiHub()" class="w-full flex items-center justify-between p-6 bg-bg border-4 border-card shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-meme-cyan/20 border-2 border-meme-cyan flex items-center justify-center rotate-[-5deg] group-hover:rotate-0 transition-transform">
                                <img src="https://raw.githubusercontent.com/paxinetwork/logos/main/paxi.png" class="w-8 h-8">
                            </div>
                            <div class="text-left">
                                <p class="font-display text-2xl text-primary-text italic uppercase">PaxiHub</p>
                                <p class="font-mono text-[8px] text-muted-text uppercase font-bold">Extension Required</p>
                            </div>
                        </div>
                        <i class="fas fa-chevron-right text-muted-text group-hover:text-meme-cyan"></i>
                    </button>

                    <button onclick="window.connectKeplr()" class="w-full flex items-center justify-between p-6 bg-bg border-4 border-card shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-meme-pink/20 border-2 border-meme-pink flex items-center justify-center rotate-[5deg] group-hover:rotate-0 transition-transform">
                                <img src="https://avatars.githubusercontent.com/u/51445611?s=200&v=4" class="w-8 h-8 rounded-full">
                            </div>
                            <div class="text-left">
                                <p class="font-display text-2xl text-primary-text italic uppercase">Keplr</p>
                                <p class="font-mono text-[8px] text-muted-text uppercase font-bold">Interchain Standard</p>
                            </div>
                        </div>
                        <i class="fas fa-chevron-right text-muted-text group-hover:text-meme-pink"></i>
                    </button>

                    <div class="py-4 flex items-center gap-4">
                        <div class="flex-1 h-0.5 bg-card"></div>
                        <span class="font-mono text-[8px] text-muted-text font-black uppercase tracking-widest">OR</span>
                        <div class="flex-1 h-0.5 bg-card"></div>
                    </div>

                    <button onclick="window.showInternalWalletSheet()" class="w-full flex items-center justify-between p-6 bg-meme-green text-black border-4 border-card shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 bg-black border-2 border-card flex items-center justify-center rotate-[-3deg] group-hover:rotate-0 transition-transform">
                                <i class="fas fa-shield-alt text-meme-green text-xl"></i>
                            </div>
                            <div class="text-left">
                                <p class="font-display text-2xl italic uppercase">Native Core</p>
                                <p class="font-mono text-[8px] uppercase font-bold opacity-70">Secured In-Browser</p>
                            </div>
                        </div>
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>

                <p class="mt-8 font-mono text-[8px] text-muted-text text-center uppercase font-bold italic px-4">
                    Connecting your wallet signifies your acceptance of the <a href="#" class="text-meme-cyan hover:underline">Intergalactic Terms of Service</a>.
                </p>
            </div>
        </div>
    `;
};
