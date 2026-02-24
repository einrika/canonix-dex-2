export const SwapTerminalUI = (props) => {
    return `
        <div id="mainSwapContainer" class="px-3 md:px-4 pb-4">
            <div class="bg-meme-surface border-2 border-black shadow-brutal p-4" id="mainSwapTerminal">
                <div class="flex bg-black p-1 border-2 border-black shadow-brutal mb-4">
                    <button id="buyTab" class="flex-1 py-2 font-display text-xl transition-all bg-meme-green text-black italic">BUY</button>
                    <button id="sellTab" class="flex-1 py-2 font-display text-xl transition-all text-gray-600 italic hover:text-white">SELL</button>
                </div>

                <div class="space-y-4">
                    <div class="bg-meme-surface p-4 border-4 border-black shadow-brutal-sm">
                        <div class="flex justify-between text-[10px] text-gray-600 mb-2 font-black uppercase italic">Pay <span id="payBalance" class="cursor-pointer">0.00</span></div>
                        <div class="flex items-center gap-3">
                            <input type="number" id="tradePayAmount" placeholder="0.0" class="bg-transparent text-3xl font-display outline-none w-full text-white italic uppercase">
                            <div class="px-3 py-1 bg-black border-2 border-black text-meme-cyan font-display text-lg italic uppercase" id="payTokenSymbol">PAXI</div>
                        </div>
                        <div class="flex gap-1 mt-3">
                            <button data-percent="25" class="flex-1 py-1 bg-black border border-gray-800 text-[10px] text-gray-500 hover:text-white">25%</button>
                            <button data-percent="50" class="flex-1 py-1 bg-black border border-gray-800 text-[10px] text-gray-500 hover:text-white">50%</button>
                            <button data-percent="75" class="flex-1 py-1 bg-black border border-gray-800 text-[10px] text-gray-500 hover:text-white">75%</button>
                            <button data-percent="100" class="flex-1 py-1 bg-black border border-gray-800 text-[10px] text-gray-500 hover:text-white">MAX</button>
                        </div>
                    </div>

                    <div class="bg-meme-surface p-4 border-4 border-black shadow-brutal-sm">
                        <div class="flex justify-between text-[10px] text-gray-600 mb-2 font-black uppercase italic">Receive <span id="recvBalance">0.00</span></div>
                        <div class="flex items-center gap-3">
                            <input type="number" id="tradeRecvAmount" placeholder="0.0" class="bg-transparent text-3xl font-display outline-none w-full text-gray-500 italic uppercase" readonly>
                            <div class="px-3 py-1 bg-black border-2 border-black text-meme-yellow font-display text-lg italic uppercase" id="recvTokenSymbol">TOKEN</div>
                        </div>
                    </div>

                    <div class="p-4 bg-black border-2 border-black space-y-2 font-mono text-[9px] uppercase">
                        <div class="flex justify-between text-gray-500"><span>Rate</span><span id="tradeRate" class="text-white">-</span></div>
                        <div class="flex justify-between text-gray-500"><span>Min Recv</span><span id="minRecv" class="text-white">-</span></div>
                        <div class="flex justify-between text-gray-500"><span>Price Impact</span><span id="priceImpact" class="text-meme-green">0.00%</span></div>
                        <div class="flex justify-between text-gray-500"><span>Fee</span><span id="networkFee" class="text-gray-700">~0.0063 PAXI</span></div>
                    </div>

                    <button id="swap-execute-btn" class="w-full py-5 bg-meme-green text-black border-4 border-black font-display text-3xl uppercase italic transition-all shadow-brutal-green">
                        BUY NOW
                    </button>
                </div>
            </div>
        </div>
    `;
};
