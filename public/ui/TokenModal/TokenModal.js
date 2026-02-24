export const TokenModalUI = (props) => {
    return `
        <div id="tokenModal" class="hidden fixed inset-0 bg-black/90 z-[333] flex items-center justify-center p-4">
            <div class="bg-meme-surface border-2 border-black shadow-brutal-lg w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
                <div class="p-4 border-b-2 border-black flex justify-between items-center bg-meme-pink">
                    <h3 class="text-2xl font-display text-white italic uppercase tracking-widest">Select Token</h3>
                    <button id="hideTokenSelector" class="text-white hover:rotate-90 transition-transform">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div class="p-4 bg-meme-card border-b-2 border-black">
                    <input type="text" id="tokenSearch" placeholder="SEARCH..." class="w-full px-3 py-3 bg-black border-2 border-black text-white font-display text-lg outline-none focus:border-meme-green placeholder:text-gray-800 uppercase italic">
                </div>
                <div id="tokenList" class="flex-1 overflow-y-auto no-scrollbar bg-bg"></div>
            </div>
        </div>
    `;
};
