export const AIModalUI = () => {
    return `
        <div id="aiModal" class="hidden fixed inset-0 bg-primary/95 z-[120] flex items-center justify-center p-4">
            <div class="bg-secondary border border-secondary shadow-minimal w-full max-w-lg max-h-[70vh] overflow-y-auto no-scrollbar relative">
                <div class="p-3 border-b border-secondary flex justify-between items-center sticky top-0 bg-secondary z-10">
                    <h3 class="text-xl font-display text-soft-success uppercase"><i class="fas fa-brain mr-2 text-base"></i>AI ORACLE</h3>
                    <button id="close-ai-modal" class="text-soft-failed hover:scale-110 transition-transform"><i class="fas fa-times text-lg"></i></button>
                </div>
                <div id="aiContent" class="p-4 font-mono text-[9px] text-muted-text leading-relaxed uppercase tracking-wide"></div>
            </div>
        </div>
    `;
};
