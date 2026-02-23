window.UIManager.registerUI('ConsoleModal', () => {
    return `
        <div id="consoleModal" class="hidden fixed inset-0 bg-primary/98 z-[9999] flex items-center justify-center p-4">
            <div class="bg-secondary border border-secondary w-full max-w-3xl h-[60vh] flex flex-col overflow-hidden shadow-minimal">
                <div class="p-2.5 border-b border-secondary flex justify-between items-center bg-secondary">
                    <div class="flex items-center gap-2">
                        <i class="fas fa-terminal text-soft-success text-base"></i>
                        <span class="font-display text-base text-primary-text uppercase">SYSTEM CONSOLE</span>
                    </div>
                    <button id="close-console-modal" class="text-soft-failed hover:scale-110 transition-transform"><i class="fas fa-times text-base"></i></button>
                </div>
                <div id="consoleContent" class="flex-1 overflow-y-auto p-3 font-mono text-[7px] text-soft-success bg-primary no-scrollbar selection:bg-soft-success selection:text-black"></div>
                <div class="p-2 border-t border-secondary bg-secondary flex justify-between items-center">
                    <span id="consoleStats" class="font-mono text-[7px] text-muted-text font-bold uppercase tracking-widest">0 LOGS</span>
                    <button id="purge-console" class="font-display text-sm text-soft-failed hover:text-primary-text transition-colors uppercase border-b border-soft-failed leading-none">PURGE</button>
                </div>
            </div>
        </div>
    `;
});
