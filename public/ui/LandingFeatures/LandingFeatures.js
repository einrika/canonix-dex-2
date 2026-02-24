export const LandingFeaturesUI = (props) => {
    return `
        <section class="py-20 bg-meme-black border-t-4 border-black px-4">
            <div class="max-w-7xl mx-auto">
                <div class="grid md:grid-cols-3 gap-12">
                    <div class="reveal">
                        <div class="w-16 h-16 bg-meme-green border-2 border-black shadow-brutal flex items-center justify-center rotate-[-5deg] mb-8">
                            <i class="fas fa-bolt text-black text-2xl"></i>
                        </div>
                        <h3 class="font-display text-3xl text-white italic uppercase mb-4 tracking-tighter">Instant Swaps</h3>
                        <p class="font-mono text-gray-500 text-sm font-bold uppercase leading-relaxed">Lightning fast execution on Paxi Network. No front-running, no BS.</p>
                    </div>
                    <div class="reveal delay-[200ms]">
                        <div class="w-16 h-16 bg-meme-cyan border-2 border-black shadow-brutal flex items-center justify-center rotate-[3deg] mb-8">
                            <i class="fas fa-shield-alt text-black text-2xl"></i>
                        </div>
                        <h3 class="font-display text-3xl text-white italic uppercase mb-4 tracking-tighter">Safe Harbor</h3>
                        <p class="font-mono text-gray-500 text-sm font-bold uppercase leading-relaxed">Locked liquidity and verified contracts. We hunt rugs so you don't have to.</p>
                    </div>
                    <div class="reveal delay-[400ms]">
                        <div class="w-16 h-16 bg-meme-pink border-2 border-black shadow-brutal flex items-center justify-center rotate-[-2deg] mb-8">
                            <i class="fas fa-rocket text-white text-2xl"></i>
                        </div>
                        <h3 class="font-display text-3xl text-white italic uppercase mb-4 tracking-tighter">Moon Missions</h3>
                        <p class="font-mono text-gray-500 text-sm font-bold uppercase leading-relaxed">Launch your own token in seconds. Bonding curve mechanics for fair starts.</p>
                    </div>
                </div>
            </div>
        </section>
    `;
};
