window.UIManager.registerUI('AboutToken', () => {
    return `
        <div class="bg-secondary border border-secondary p-4 shadow-brutal">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 class="text-lg font-display text-accent mb-2 italic uppercase tracking-tighter">ABOUT</h4>
                    <p id="tokenDesc" class="font-mono text-[9px] text-muted-text leading-relaxed uppercase italic">NO DESCRIPTION AVAILABLE.</p>
                </div>
                <div>
                    <h4 class="text-lg font-display text-soft-warning mb-2 italic uppercase tracking-tighter">MARKETING</h4>
                    <div class="flex items-center gap-2 bg-secondary p-2 border border-secondary">
                        <code id="mktAddr" class="text-[10px] font-mono text-muted-text break-all flex-1 uppercase tracking-tighter italic">N/A</code>
                        <button id="copy-mkt-btn" class="text-soft-warning hover:scale-110 transition-transform"><i class="fas fa-copy text-sm"></i></button>
                    </div>
                </div>
            </div>
        </div>
    `;
});
