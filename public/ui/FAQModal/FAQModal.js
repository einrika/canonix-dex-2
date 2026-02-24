export const FAQModalUI = (props) => {
    return `
        <div id="faqModal" class="hidden fixed inset-0 bg-black/95 z-[555] flex items-center justify-center p-4">
            <div class="bg-meme-surface border-4 border-black shadow-brutal w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div class="p-4 border-b-4 border-black flex justify-between items-center bg-meme-pink text-white">
                    <h3 class="text-2xl font-display italic uppercase tracking-tighter">Knowledge Base</h3>
                    <button id="closeFAQ" class="hover:rotate-90 transition-transform"><i class="fas fa-times text-xl"></i></button>
                </div>
                <div class="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-bg" id="faqContent"></div>
            </div>
        </div>
    `;
};
