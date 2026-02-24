export const UnifiedSidebarUI = (props) => {
    return `
        <div class="flex bg-meme-surface border-b-2 border-black p-1.5 gap-1.5 overflow-x-auto no-scrollbar">
            <button data-tab="wallet" id="side-tab-wallet" class="px-4 py-2 bg-black border border-black text-meme-green font-display text-xs shadow-brutal-sm hover:shadow-none transition-all uppercase italic flex-shrink-0">Wallet</button>
            <button data-tab="swap" id="side-tab-swap" class="px-4 py-2 bg-black border border-black text-gray-500 font-display text-xs shadow-brutal-sm hover:shadow-none transition-all uppercase italic flex-shrink-0">Swap</button>
            <button data-tab="lp" id="side-tab-lp" class="px-4 py-2 bg-black border border-black text-gray-500 font-display text-xs shadow-brutal-sm hover:shadow-none transition-all uppercase italic flex-shrink-0">Pool</button>
            <button data-tab="history" id="side-tab-history" class="px-4 py-2 bg-black border border-black text-gray-500 font-display text-xs shadow-brutal-sm hover:shadow-none transition-all uppercase italic flex-shrink-0">History</button>
            <button data-tab="settings" id="side-tab-settings" class="px-4 py-2 bg-black border border-black text-gray-500 font-display text-xs shadow-brutal-sm hover:shadow-none transition-all uppercase italic flex-shrink-0">Settings</button>
        </div>

        <div id="sidebarContent" class="flex-1 overflow-y-auto p-4 no-scrollbar bg-bg">
            <div class="text-center py-24 flex flex-col items-center">
                <div class="w-16 h-16 bg-meme-card border-2 border-black shadow-brutal flex items-center justify-center text-gray-700 text-3xl mb-6 rotate-[-10deg]">
                    <i class="fas fa-lock"></i>
                </div>
                <p class="font-display text-xl text-gray-600 uppercase italic tracking-tighter">Terminal Locked</p>
                <p class="font-mono text-[8px] text-gray-700 mt-1.5 font-bold uppercase tracking-widest italic">Connect wallet to start</p>
            </div>
        </div>
    `;
};
