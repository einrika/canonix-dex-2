export const AIModalUI = (props) => {
    return `
        <div id="aiModal" class="hidden fixed inset-0 bg-black/95 z-[444] flex items-center justify-center p-4">
            <div class="bg-meme-surface border-4 border-black shadow-brutal w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div class="p-4 border-b-4 border-black flex justify-between items-center bg-meme-cyan">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-brain text-black text-xl"></i>
                        <h3 class="text-2xl font-display text-black italic uppercase tracking-tighter">AI Analysis</h3>
                    </div>
                    <button id="closeAI" class="text-black hover:rotate-90 transition-transform"><i class="fas fa-times text-xl"></i></button>
                </div>
                <div id="aiContent" class="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar"></div>
            </div>
        </div>
    `;
};
