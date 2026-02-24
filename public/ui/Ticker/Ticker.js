export const TickerUI = (props) => {
    return `
        <div class="bg-meme-yellow border-b-2 border-black py-0.5 overflow-hidden whitespace-nowrap z-[60] relative">
            <div class="animate-marquee inline-block">
                <span class="text-black font-display text-sm mx-4 italic uppercase">Soon $$$</span>
                <span class="text-black font-display text-sm mx-4 italic uppercase">Degens Only</span>
                <span class="text-black font-display text-sm mx-4 italic uppercase">PRC20 Revolution</span>
                <span class="text-black font-display text-sm mx-4 italic uppercase">Rugs Allowed</span>
                <span class="text-black font-display text-sm mx-4 italic uppercase">Pump it harder</span>
                <span class="text-black font-display text-sm mx-4 italic uppercase">$$$ Moon Soon $$$</span>
                <!-- Duplicate for seamless loop -->
                <span class="text-black font-display text-sm mx-4 italic uppercase">Soon $$$</span>
                <span class="text-black font-display text-sm mx-4 italic uppercase">Degens Only</span>
                <span class="text-black font-display text-sm mx-4 italic uppercase">PRC20 Revolution</span>
                <span class="text-black font-display text-sm mx-4 italic uppercase">Rugs Allowed</span>
                <span class="text-black font-display text-sm mx-4 italic uppercase">Pump it harder</span>
                <span class="text-black font-display text-sm mx-4 italic uppercase">$$$ Moon Soon $$$</span>
            </div>
        </div>
    `;
};
