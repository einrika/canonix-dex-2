export const AboutTokenUI = (props) => {
    return `
        <div id="tokenDetailsCard" class="px-3 md:px-4 pb-4 hidden">
            <div class="bg-meme-surface border-2 border-black p-4 shadow-brutal">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="text-lg font-display text-meme-cyan mb-2 italic uppercase tracking-tighter">ABOUT</h4>
                        <p id="tokenDesc" class="font-mono text-[9px] text-gray-400 leading-relaxed uppercase italic">NO DESCRIPTION AVAILABLE.</p>
                    </div>
                    <div>
                        <h4 class="text-lg font-display text-meme-yellow mb-2 italic uppercase tracking-tighter">MARKETING</h4>
                        <div class="flex items-center gap-2 bg-black p-2 border border-black">
                            <code id="mktAddr" class="text-[10px] font-mono text-gray-500 break-all flex-1 uppercase tracking-tighter italic">N/A</code>
                            <button id="copyMktBtn" class="text-meme-yellow hover:scale-110 transition-transform"><i class="fas fa-copy text-sm"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};
