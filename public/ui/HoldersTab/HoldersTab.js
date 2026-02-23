export const HoldersTabUI = () => {
    return `
        <div class="flex gap-1.5 mb-3">
            <button id="tab-holders" class="tab-btn active px-4 py-1.5 bg-accent text-black font-display text-xl border border-secondary shadow-brutal hover:shadow-none transition-all uppercase tracking-tight">Top Holders</button>
        </div>
        <div id="tabContent" class="bg-secondary border border-secondary shadow-minimal min-h-[150px] overflow-hidden">
            <!-- Table goes here -->
        </div>
    `;
};
