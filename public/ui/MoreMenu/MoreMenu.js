export const MoreMenuUI = () => {
    return `
        <div id="moreMenuModal" class="hidden fixed inset-0 z-[200] flex items-end lg:items-center justify-center p-4">
            <div class="absolute inset-0 bg-bg/80 backdrop-blur-md" onclick="window.toggleMoreMenu()"></div>
            <div class="relative w-full max-w-sm bg-secondary border-4 border-card shadow-brutal-lg p-6 animate-slide-up lg:animate-fade-in">
                <div class="flex justify-between items-center mb-8">
                    <h3 class="text-3xl font-display text-primary-text italic uppercase">Sub Systems</h3>
                    <button onclick="window.toggleMoreMenu()" class="w-8 h-8 border-2 border-card flex items-center justify-center text-muted-text hover:text-meme-pink"><i class="fas fa-times"></i></button>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <a href="faq.html" class="flex flex-col items-center gap-3 p-6 bg-bg border-2 border-card shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                        <i class="fas fa-question-circle text-2xl text-meme-cyan"></i>
                        <span class="font-display text-sm uppercase italic">Help</span>
                    </a>
                    <button onclick="window.setSidebarTab('donate'); window.toggleMoreMenu(); window.toggleUnifiedSidebar();" class="flex flex-col items-center gap-3 p-6 bg-bg border-2 border-card shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                        <i class="fas fa-heart text-2xl text-meme-pink"></i>
                        <span class="font-display text-sm uppercase italic">Donate</span>
                    </a>
                    <button onclick="window.toggleConsoleModal(); window.toggleMoreMenu();" class="flex flex-col items-center gap-3 p-6 bg-bg border-2 border-card shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                        <i class="fas fa-terminal text-2xl text-meme-green"></i>
                        <span class="font-display text-sm uppercase italic">Console</span>
                    </button>
                    <a href="setting.html" class="flex flex-col items-center gap-3 p-6 bg-bg border-2 border-card shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                        <i class="fas fa-cog text-2xl text-meme-yellow"></i>
                        <span class="font-display text-sm uppercase italic">Settings</span>
                    </a>
                </div>

                <div class="mt-8 pt-8 border-t-2 border-card text-center">
                    <p class="font-mono text-[8px] text-muted-text font-black uppercase tracking-widest italic">Canonix v2.0.4-beta</p>
                </div>
            </div>
        </div>
    `;
};
