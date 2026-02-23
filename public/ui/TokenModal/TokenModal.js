export const TokenModalUI = () => {
    return `
        <div id="tokenDetailModal" class="hidden fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-bg/90 backdrop-blur-md" onclick="window.hideTokenDetail()"></div>
            <div id="tokenDetailContent" class="relative w-full max-w-2xl bg-secondary border-4 border-card shadow-brutal-lg overflow-hidden animate-fade-in">
                <!-- Content injected by JS -->
            </div>
        </div>
    `;
};
