export const HoldersTabUI = (props) => {
    return `
        <div class="px-3 md:px-4 pb-20">
            <div class="flex gap-2 mb-4">
                <button id="tab-holders" class="tab-btn active px-6 py-2 bg-meme-green text-black font-display text-2xl border-2 border-black shadow-brutal hover:shadow-none transition-all uppercase italic tracking-tighter">Top Holders</button>
            </div>
            <div id="tabContent" class="bg-meme-surface border-2 border-black shadow-brutal min-h-[200px] overflow-hidden">
                <!-- Table goes here -->
            </div>
        </div>
    `;
};
