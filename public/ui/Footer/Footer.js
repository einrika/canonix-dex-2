export const FooterUI = (props) => {
    return `
        <footer class="py-16 bg-bg border-t-4 border-black">
            <div class="max-w-7xl mx-auto text-center">
                <div class="flex items-center justify-center gap-4 mb-12">
                    <div class="w-12 h-12 bg-meme-pink border-2 border-black shadow-brutal flex items-center justify-center rotate-[10deg]">
                        <i class="fas fa-exchange-alt text-white text-2xl"></i>
                    </div>
                    <span class="text-3xl md:text-5xl font-display tracking-widest text-white italic">CANONIX</span>
                </div>
                <div class="flex flex-wrap justify-center gap-8 font-display text-xl mb-12">
                    <a href="#" class="text-gray-600 hover:text-meme-green transition-colors uppercase italic">Docs</a>
                    <a href="#" class="text-gray-600 hover:text-meme-pink transition-colors uppercase italic">Github</a>
                    <a href="#" class="text-gray-600 hover:text-meme-cyan transition-colors uppercase italic">Twitter</a>
                    <a href="#" class="text-gray-600 hover:text-meme-yellow transition-colors uppercase italic">Telegram</a>
                </div>
                <div class="font-mono text-[8px] text-gray-800 font-black uppercase tracking-[0.5em]">
                    &copy; 2026 Canonix Protocol | Built by Degens for Degens
                </div>
            </div>
        </footer>
    `;
};
