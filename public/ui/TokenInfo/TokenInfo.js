export const TokenInfoUI = (props) => {
    return `
        <div class="bg-meme-surface border-2 border-black p-4 shadow-brutal rotate-[-0.3deg]">
            <h4 class="text-lg font-display text-meme-yellow mb-4 flex items-center gap-2 italic uppercase tracking-tighter">
                <i class="fas fa-info-circle text-sm"></i> TOKEN INFO
            </h4>
            <div class="space-y-3">
                <div class="flex justify-between items-center">
                    <span class="font-mono text-[9px] text-gray-500 font-bold uppercase tracking-widest">SUPPLY</span>
                    <span id="totalSupply" class="font-mono text-[10px] font-bold text-white uppercase italic">0</span>
                </div>
                <div class="flex flex-col gap-1.5">
                    <span class="font-mono text-[8px] text-gray-600 font-bold uppercase tracking-widest">CONTRACT CA</span>
                    <div class="flex items-center gap-2 bg-black p-2 border border-black shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                        <code id="caAddr" class="text-[10px] font-mono text-meme-green flex-1 uppercase tracking-tighter break-all">paxi...</code>
                        <button id="copyCaBtn" class="text-meme-yellow hover:scale-110 transition-transform"><i class="fas fa-copy text-sm"></i></button>
                    </div>
                </div>
                <div class="flex justify-between items-center">
                    <span class="font-mono text-[9px] text-gray-500 font-bold uppercase tracking-widest">MINTING</span>
                    <span id="minterStatus" class="font-display text-base text-meme-green uppercase italic tracking-tighter">LOCKED</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="font-mono text-[9px] text-gray-500 font-bold uppercase tracking-widest">VERIFIED</span>
                    <span id="verifyStatus" class="font-display text-base text-meme-cyan uppercase italic tracking-tighter">OFFICIAL</span>
                </div>
                <div id="socialLinks" class="flex gap-3 pt-1"></div>
            </div>
        </div>
    `;
};
