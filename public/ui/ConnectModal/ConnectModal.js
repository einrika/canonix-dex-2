export const ConnectModalUI = (props) => {
    return `
        <div id="connectModal" class="hidden fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4">
            <div class="bg-meme-surface border-2 border-black shadow-brutal w-full max-w-sm overflow-hidden">
                <div class="p-4 border-b-2 border-black flex justify-between items-center bg-meme-cyan">
                    <h3 class="text-2xl font-display text-black italic uppercase tracking-tighter">Connect Wallet</h3>
                    <button id="hideConnectModal" class="text-black hover:scale-125 transition-transform"><i class="fas fa-times text-lg"></i></button>
                </div>
                <div class="p-6 space-y-4">
                    <button data-wallet="paxi" class="wallet-option w-full p-4 bg-black border-2 border-black flex items-center justify-between group hover:border-meme-green transition-all shadow-brutal-sm hover:shadow-none">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 bg-meme-green border-2 border-black flex items-center justify-center text-black group-hover:rotate-12 transition-transform"><i class="fas fa-wallet text-xl"></i></div>
                            <span class="font-display text-xl text-white uppercase italic">PAXI Wallet</span>
                        </div>
                        <i class="fas fa-chevron-right text-gray-800"></i>
                    </button>
                    <button data-wallet="keplr" class="wallet-option w-full p-4 bg-black border-2 border-black flex items-center justify-between group hover:border-meme-cyan transition-all shadow-brutal-sm hover:shadow-none">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 bg-meme-cyan border-2 border-black flex items-center justify-center text-black group-hover:rotate-12 transition-transform"><i class="fas fa-plug text-xl"></i></div>
                            <span class="font-display text-xl text-white uppercase italic">Keplr</span>
                        </div>
                        <i class="fas fa-chevron-right text-gray-800"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
};
