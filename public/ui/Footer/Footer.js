export const FooterUI = () => {
    return `
        <footer class="py-16 bg-bg border-t-4 border-card">
            <div class="max-w-7xl mx-auto text-center">
                <div class="flex items-center justify-center gap-4 mb-12">
                    <div class="w-12 h-12 border-2 border-card shadow-brutal flex items-center justify-center rotate-[10deg] overflow-hidden">
                        <img src="public/assets/logo.png" alt="Logo" class="w-full h-full object-contain" onerror="this.src='asset/android-icon-192x192.png'">
                    </div>
                    <span class="text-3xl md:text-5xl font-display tracking-widest text-primary-text italic">CANONIX</span>
                </div>
                <div class="flex flex-wrap justify-center gap-8 font-display text-xl mb-12">
                    <a href="#" class="text-muted-text hover:text-meme-green transition-colors uppercase italic">Docs</a>
                    <a href="#" class="text-muted-text hover:text-meme-pink transition-colors uppercase italic">Github</a>
                    <a href="#" class="text-muted-text hover:text-meme-cyan transition-colors uppercase italic">Twitter</a>
                    <a href="#" class="text-muted-text hover:text-meme-yellow transition-colors uppercase italic">Telegram</a>
                </div>
                <div class="font-mono text-[8px] text-muted-text font-black uppercase tracking-[0.5em]">
                    &copy; 2026 Canonix Protocol | Built by Degens for Degens
                </div>
            </div>
        </footer>
    `;
};
