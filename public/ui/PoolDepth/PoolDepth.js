export const PoolDepthUI = (props) => {
    return `
        <div class="bg-meme-surface border-2 border-black p-4 shadow-brutal rotate-[0.5deg]">
            <h4 class="text-lg font-display text-meme-cyan mb-4 flex items-center gap-2 italic uppercase tracking-tighter">
                <i class="fas fa-droplet text-sm"></i> POOL DEPTH
            </h4>
            <div class="space-y-3">
                <div class="flex justify-between items-center">
                    <span class="font-mono text-[9px] text-gray-500 font-bold uppercase tracking-widest">PAXI</span>
                    <span id="resPaxi" class="font-display text-xl text-white italic">0.00</span>
                </div>
                <div class="flex justify-between items-center">
                    <span id="resTokenLabel" class="font-mono text-[9px] text-gray-500 font-bold uppercase tracking-widest truncate max-w-[80px]">PRC20</span>
                    <span id="resToken" class="font-display text-xl text-white italic">0.00</span>
                </div>
                <div class="flex justify-between items-center border-t border-black pt-3">
                    <span class="font-mono text-[9px] text-gray-500 font-bold uppercase tracking-widest">APES</span>
                    <span id="holderCount" class="font-display text-xl text-meme-cyan italic">0</span>
                </div>
            </div>
        </div>
    `;
};
