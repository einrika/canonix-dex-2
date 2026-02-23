export const TickerUI = (props) => {
    const isLanding = props.type === 'landing';
    const bgColor = isLanding ? 'bg-meme-yellow' : 'bg-soft-warning';
    const borderColor = isLanding ? 'border-card' : 'border-secondary';
    const textColor = 'text-black';
    const textSize = isLanding ? 'text-sm' : 'text-[9px] md:text-xs';

    return `
        <div class="${bgColor} border-b ${isLanding ? 'border-b-2' : ''} ${borderColor} py-0.5 overflow-hidden whitespace-nowrap z-[60] relative flex items-center min-h-[24px] md:min-h-[28px]">
            <div id="tickerContent" class="animate-marquee inline-block">
                <span class="inline-block ${textColor} font-display ${textSize} mx-4 md:mx-6 italic uppercase tracking-tight">LOADING MARKET DATA...</span>
                <span class="inline-block ${textColor} font-display ${textSize} mx-4 md:mx-6 italic uppercase tracking-tight">$$$ MOON SOON $$$</span>
                <span class="inline-block ${textColor} font-display ${textSize} mx-4 md:mx-6 italic uppercase tracking-tight">PUMP IT HARDER</span>
            </div>
        </div>
    `;
};
